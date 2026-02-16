// import { Server as SocketServer } from "socket.io";
// import { Server as HttpServer } from "http";
// import { getRepository } from "typeorm";
// import { SelectedBrand } from "../models/member/selected-brands/selected-brands.models";
// import { User } from "../models/member/auth/user.models";
// import { Brand } from "../models/brand/auth/auth-brand.models";
// import { Offer } from "../models/brand/offers/offer.models";
// import { FcmService } from "./fcm.service";
// import { NotificationType } from "../models/member/notification/notification.models";

// export class SocketService {
//   private io: SocketServer;
//   private userSockets: Map<string, Set<string>> = new Map();

//   constructor(server: HttpServer) {
//     this.io = new SocketServer(server, {
//       cors: {
//         origin:
//           process.env.NODE_ENV === "testing" || "production"
//             ? "*"
//             : ["https://brands.tribeme.com"],

//         methods: ["GET", "POST"],
//         credentials: true,
//       },
//     });

//     this.initializeSocketEvents();
//   }

//   private initializeSocketEvents(): void {
//     this.io.on("connection", (socket) => {
//       console.log("New client connected with socket ID: ", socket.id);

//       socket.on("authenticate", async (userId: string) => {
//         try {
//           const user = await getRepository(User).findOne({
//             where: { id: userId },
//           });

//           const { password, ...withoutPassword } = user;

//           console.log(
//             "user ",
//             withoutPassword.fullName,
//             " has send socket connection"
//           );

//           if (!withoutPassword) {
//             socket.emit("error", { message: "User not found with this ID" });
//             return;
//           }

//           if (!this.userSockets.has(userId)) {
//             this.userSockets.set(userId, new Set());
//           }
//           this.userSockets.get(userId)!.add(socket.id);

//           console.log(
//             `User ID: ${userId} authenticated with socket ID: ${socket.id}`
//           );
//         } catch (error) {
//           console.error("Authentication error:", error);
//         }
//       });

//       socket.on("disconnect", () => {
//         for (const [userId, socketId] of this.userSockets.entries()) {
//           if (socketId.has(socket.id)) {
//             socketId.delete(socket.id);
//             if (socketId.size === 0) {
//               this.userSockets.delete(userId);
//             }
//             console.log(`User ${userId} disconnected`);
//             break;
//           }
//         }
//       });
//     });
//   }

//   public async notifyUsersOfNewOffer(
//     brandId: string,
//     offerId: string
//   ): Promise<void> {
//     const notifiedUsers = new Set<string>();

//     try {
//       const brand = await getRepository(Brand).findOne({
//         where: { id: brandId },
//         relations: ["images"],
//       });

//       if (!brand) {
//         throw new Error("Brand not found");
//       }

//       const offer = await getRepository(Offer).findOne({
//         where: { id: offerId },
//         relations: ["offerImages"],
//       });

//       if (!offer) {
//         throw new Error("Offer not found");
//       }

//       const selectedBrands = await getRepository(SelectedBrand).find({
//         where: { category: brand.category },
//         relations: ["user", "brand"],
//       });

//       if (selectedBrands.length === 0) {
//         console.log(
//           "Error sending notifications: No member app users selected this brand's category"
//         );
//       }

//       // Prepare notification data
//       const notificationData = {
//         type: "NEW_OFFER",
//         brandId: brand.id,
//         businessName: brand.businessName,
//         images: Array.isArray(brand.images)
//           ? brand.images.map((image) => image.url)
//           : ["Image not uploaded by brand"],
//         offerId: offer.id,
//         offerName: offer.offerName,
//         offerImage: Array.isArray(offer.offerImages)
//           ? offer.offerImages.map((image) => image.url)
//           : ["Brand not uploaded offer Image"],
//         timestamp: new Date().toISOString(),
//       };
//             const userIds: string[] = [];

//       // Send notifications to connected users
//       for (const selection of selectedBrands) {
//         const userId = selection.user.id;

//         if (!notifiedUsers.has(userId)) {
//           // Add to FCM notification list
//           userIds.push(userId);
          
//           // Send socket notification to connected users
//           const socketId = this.userSockets.get(userId);
//           if (socketId) {
//             for (const id of socketId) {
//               this.io.to(id).emit("notification", notificationData);
//             }
//             console.log(`Socket notification sent to user ${userId}`);
//           } else {
//             console.log(`User ${userId} is not connected via socket`);
//           }
//           notifiedUsers.add(userId);
//         }
//       }

//       // Send FCM push notifications
//       if (userIds.length > 0) {
//         try {
//           const fcmTemplate = FcmService.getNewOfferNotification(
//             brand.businessName,
//             offer.offerName
//           );

//           const fcmPayload = {
//             title: fcmTemplate.title,
//             body: fcmTemplate.body,
//             data: {
//               ...fcmTemplate.data,
//               brandId: brand.id,
//               offerId: offer.id,
//               brandImage: Array.isArray(brand.images) && brand.images.length > 0
//                 ? brand.images[0].url
//                 : undefined,
//             },
//             imageUrl: Array.isArray(offer.offerImages) && offer.offerImages.length > 0
//               ? offer.offerImages[0].url
//               : undefined,
//           };

//           const fcmResults = await FcmService.sendToMultipleUsers(
//             userIds,
//             fcmPayload,
//             NotificationType.NEW_OFFER
//           );

//           console.log(`FCM notifications sent to ${userIds.length} users:`, fcmResults);
//         } catch (fcmError) {
//           console.error("Error sending FCM notifications:", fcmError);
//           // Don't throw here - socket notifications already sent successfully
//         }
//       }
//     } catch (error) {
//       console.error("Error sending notifications:", error);
//       throw error;
//     }
//   }
// }


import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { getRepository } from 'typeorm';
import { SelectedBrand } from '../../src/models/member/selected-brands/selected-brands.models';
import { User } from '../models/member/auth/user.models';
import { Brand } from '../models/brand/auth/auth-brand.models';
import { Offer } from '../../src/models/brand/offers/offer.models';
import { FcmService } from './fcm.service';
import { NotificationType, Notification, NotificationStatus } from '../models/member/notification/notification.models';

export class SocketService {
  private static instance: SocketService | null = null;
  private io: SocketServer;
  private userSockets: Map<string, Set<string>> = new Map();

  private constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin:
          process.env.NODE_ENV === 'testing' || process.env.NODE_ENV === 'production'
            ? '*'
            : ['https://brands.tribeme.com'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initializeSocketEvents();
  }

  public static getInstance(server?: HttpServer): SocketService {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server);
    }
    if (!SocketService.instance) {
      throw new Error('SocketService not initialized. Provide a server instance.');
    }
    return SocketService.instance;
  }

  private initializeSocketEvents(): void {
    this.io.on('connection', (socket) => {
      console.log('New client connected with socket ID: ', socket.id);

      socket.on('authenticate', async (userId: string) => {
        try {
          const user = await getRepository(User).findOne({
            where: { id: userId },
          });

          if (!user) {
            socket.emit('error', { message: 'User not found with this ID' });
            return;
          }

          const { password, ...withoutPassword } = user;

          console.log(
            'user ',
            withoutPassword.fullName,
            ' has send socket connection'
          );

          if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
          }
          this.userSockets.get(userId)!.add(socket.id);

          console.log(`User ID: ${userId} authenticated with socket ID: ${socket.id}`);
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('error', { message: 'Authentication failed' });
        }
      });

      socket.on('disconnect', () => {
        for (const [userId, socketIds] of this.userSockets.entries()) {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
            if (socketIds.size === 0) {
              this.userSockets.delete(userId);
            }
            console.log(`User ${userId} disconnected`);
            break;
          }
        }
      });
    });
  }

  public async emitNewNotification(userId: string, notification: Notification): Promise<void> {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.io.to(socketId).emit('notification:created', {
          id: notification.id,
          title: notification.title,
          message: notification.body,
          createdAt: notification.createdAt,
          isRead: notification.isRead,
          readAt: notification.readAt,
          type: notification.type,
          data: notification.data,
          actions: this.getNotificationAction(notification),
        });
        console.log(`New notification sent to user ${userId} via socket ${socketId}`);
      }
    } else {
      console.log(`User ${userId} is not connected via socket`);
    }
  }

  public async emitUpdatedNotification(userId: string, notification: Notification): Promise<void> {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.io.to(socketId).emit('notification:updated', {
          id: notification.id,
          title: notification.title,
          message: notification.body,
          createdAt: notification.createdAt,
          isRead: notification.isRead,
          readAt: notification.readAt,
          type: notification.type,
          data: notification.data,
          actions: this.getNotificationAction(notification),
        });
        console.log(`Updated notification sent to user ${userId} via socket ${socketId}`);
      }
    } else {
      console.log(`User ${userId} is not connected via socket`);
    }
  }

  private getNotificationAction(notification: Notification): string {
    const { type, data } = notification;
    switch (type) {
      case NotificationType.NEW_OFFER:
      case NotificationType.REDEMPTION_APPROVED:
      case NotificationType.REDEMPTION_REJECTED:
      case NotificationType.OFFER_REDEMPTION:
        return 'BrandOfferDetails';
      case NotificationType.REFERRAL_REWARD:
      case NotificationType.COIN_TO_CASH_CONVERSION:
      case NotificationType.WALLET_UPDATE:
        return 'Wallet';
      case NotificationType.REWARD_CLAIMED:
        return 'RewardScreen';
      case NotificationType.VIDEO_REWARD:
        return 'VideoRewards';
      case NotificationType.WELCOME:
      case NotificationType.BRAND_UPDATE:
        return data?.brandId ? 'BrandDetails' : 'Dashboard';
      case NotificationType.PASSWORD_RESET:
        return 'Profile';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return 'Notifications';
      default:
        return 'Notifications';
    }
  }

  public async notifyUsersOfNewOffer(brandId: string, offerId: string): Promise<void> {
    const notifiedUsers = new Set<string>();

    try {
      const brand = await getRepository(Brand).findOne({
        where: { id: brandId },
        relations: ['images'],
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const offer = await getRepository(Offer).findOne({
        where: { id: offerId },
        relations: ['offerImages'],
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      const selectedBrands = await getRepository(SelectedBrand).find({
        where: { category: brand.category },
        relations: ['user', 'brand'],
      });

      if (selectedBrands.length === 0) {
        console.log('Error sending notifications: No member app users selected this brand\'s category');
        return;
      }

      const notificationRepo = getRepository(Notification);
      const userIds: string[] = [];

      for (const selection of selectedBrands) {
        const userId = selection.user.id;

        if (!notifiedUsers.has(userId)) {
          const notification = new Notification();
          notification.userId = userId;
          notification.title = `New Offer from ${brand.businessName}!`;
          notification.body = `Check out the new offer: ${offer.offerName}`;
          notification.data = {
            type: NotificationType.NEW_OFFER,
            brandId: brand.id,
            businessName: brand.businessName,
            images: Array.isArray(brand.images) ? brand.images.map((image) => image.url) : [],
            offerId: offer.id,
            offerName: offer.offerName,
            offerImage: Array.isArray(offer.offerImages) ? offer.offerImages.map((image) => image.url) : [],
            timestamp: new Date().toISOString(),
          };
          notification.type = NotificationType.NEW_OFFER;
          notification.status = NotificationStatus.SENT;
          notification.isRead = false;
          notification.createdAt = new Date();

          await notificationRepo.save(notification);

          await this.emitNewNotification(userId, notification);

          userIds.push(userId);
          notifiedUsers.add(userId);
        }
      }

      if (userIds.length > 0) {
        try {
          const fcmTemplate = FcmService.getNewOfferNotification(brand.businessName, offer.offerName);
          const fcmPayload = {
            title: fcmTemplate.title,
            body: fcmTemplate.body,
            data: {
              ...fcmTemplate.data,
              brandId: brand.id,
              offerId: offer.id,
              brandImage: Array.isArray(brand.images) && brand.images.length > 0 ? brand.images[0].url : undefined,
            },
            imageUrl: Array.isArray(offer.offerImages) && offer.offerImages.length > 0 ? offer.offerImages[0].url : undefined,
          };

          const fcmResults = await FcmService.sendToMultipleUsers(userIds, fcmPayload, NotificationType.NEW_OFFER);
          console.log(`FCM notifications sent to ${userIds.length} users:`, fcmResults);
        } catch (fcmError) {
          console.error('Error sending FCM notifications:', fcmError);
        }
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  }
}