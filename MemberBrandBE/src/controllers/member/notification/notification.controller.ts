import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { FcmToken } from "../../../models/member/notification/fcm-token.models";
import { Notification, NotificationStatus, NotificationType } from "../../../models/member/notification/notification.models";
import { FcmService } from "../../../services/fcm.service";
import ApiResponse from "../../../utils/api-response";
import ApiError from "../../../utils/api-error";
import { MESSAGES } from "../../../utils/message-codes";
import { SocketService } from "../../../../src/services/socket.service";

// Helper function to determine the action for each notification type
function getNotificationAction(notification: Notification): string {
  const { type, data } = notification;

  switch (type) {
    case NotificationType.NEW_OFFER:
      return 'BrandOfferDetails';

    case NotificationType.REDEMPTION_APPROVED:
    case NotificationType.REDEMPTION_REJECTED:
    case NotificationType.OFFER_REDEMPTION:
      return 'BrandOfferDetails';

    case NotificationType.REFERRAL_REWARD:
      return 'Wallet';

    case NotificationType.REWARD_CLAIMED:
      return 'RewardScreen';

    case NotificationType.COIN_TO_CASH_CONVERSION:
      return 'Wallet';

    case NotificationType.VIDEO_REWARD:
      return 'VideoRewards';

    case NotificationType.WELCOME:
      return 'Dashboard';

    case NotificationType.PASSWORD_RESET:
      return 'Profile';

    case NotificationType.WALLET_UPDATE:
      return 'Wallet';

    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return 'Notifications';

    case NotificationType.BRAND_UPDATE:
      return data?.brandId ? 'BrandDetails' : 'Dashboard';

    default:
      return 'Notifications';
  }
}

export class NotificationController {

 private static socketService: SocketService;

  public static setSocketService(socketService: SocketService) {
    this.socketService = socketService;
  }

  // Register FCM token
  public static async registerFcmToken(req: Request, res: Response) {
    try {
      const { token, deviceId, deviceType } = req.body;
      const { userId } = (req as any).user;

      if (!token) {
        return res.status(MESSAGES.BAD_REQUEST._CODE).json({
          error: new ApiError(
            MESSAGES.BAD_REQUEST._CODE,
            null,
            "FCM token is required"
          ),
        });
      }

      const fcmToken = await FcmService.registerToken(
        userId,
        token,
        deviceId,
        deviceType
      );

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, fcmToken, "FCM token registered successfully")
      );
    } catch (error) {
      console.error("Error registering FCM token:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  // Delete FCM token
  public static async deleteFcmToken(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      const fcmTokenRepo = getRepository(FcmToken);

      // Delete FCM token associated with the userId
      const result = await fcmTokenRepo.delete({ userId });
      console.log('Delete result:', result); // Log the result for debugging

      if (result.affected === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "No FCM tokens found for this user"
          ),
        });
      }

      // await FcmService.unregisterToken(userId, userId);
      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, null, "FCM token deleted successfully")
      );
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  // Get user's notifications
  public static async getNotifications(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const notificationRepo = getRepository(Notification);

      const [notifications, total] = await notificationRepo.findAndCount({
        where: { userId },
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      });

      const unreadCount = await notificationRepo.count({
        where: { userId, isRead: false },
      });

      // Add action to each notification
      const notificationsWithActions = notifications.map(notification => ({
        ...notification,
        actions: getNotificationAction(notification)
      }));

      // Emit a sync event to other connected clients for the user (optional)
      const socketIds = NotificationController.socketService['userSockets'].get(userId);
      if (socketIds) {
        for (const socketId of socketIds) {
          NotificationController.socketService['io'].to(socketId).emit('notification:sync', {
            notifications: notificationsWithActions,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
            unreadCount,
          });
          console.log(`Synced notifications to user ${userId} via socket ${socketId}`);
        }
      }

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, {
          notifications: notificationsWithActions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          unreadCount,
        }, "Notifications retrieved successfully")
      );
    } catch (error) {
      console.error("Error getting notifications:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  // Mark notification as read
  public static async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const { userId } = (req as any).user;

      const notificationRepo = getRepository(Notification);

      const notification = await notificationRepo.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Notification not found"
          ),
        });
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notificationRepo.save(notification);

        // Emit updated notification via SocketService
        await NotificationController.socketService.emitUpdatedNotification(userId, notification);
      }

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, null, "Notification marked as read")
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  // Mark all notifications as read
  public static async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.user as any;

      const notificationRepo = getRepository(Notification);

      const updatedNotifications = await notificationRepo.find({
        where: { userId, isRead: false },
      });

      await notificationRepo.update(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      // Emit updated notifications via SocketService
      for (const notification of updatedNotifications) {
        notification.isRead = true;
        notification.readAt = new Date();
        await NotificationController.socketService.emitUpdatedNotification(userId, notification);
      }

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, null, "All notifications marked as read")
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  // Get unread notification count
  public static async getUnreadCount(req: Request, res: Response) {
    try {
      const { userId } = req.user as any;

      const notificationRepo = getRepository(Notification);

      const unreadCount = await notificationRepo.count({
        where: { userId, isRead: false },
      });

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, { unreadCount }, "Unread count retrieved successfully")
      );
    } catch (error) {
      console.error("Error getting unread count:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  // Delete notification
  public static async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const { userId } = req.user as any;

      const notificationRepo = getRepository(Notification);

      const result = await notificationRepo.delete({
        id: notificationId,
        userId,
      });

      if (result.affected === 0) {
        return res.status(MESSAGES.NOT_FOUND._CODE).json({
          error: new ApiError(
            MESSAGES.NOT_FOUND._CODE,
            null,
            "Notification not found"
          ),
        });
      }

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, null, "Notification deleted successfully")
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  // Clear all notifications
  public static async clearAllNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.user as any;

      const notificationRepo = getRepository(Notification);

      await notificationRepo.delete({ userId });

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, null, "All notifications cleared successfully")
      );
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
  // Test notification (for development/testing)
  public static async testNotification(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;
      const { title, body, data } = req.body;

      const notificationRepo = getRepository(Notification);
      const notification = new Notification();
      notification.userId = userId;
      notification.title = title || 'Test Notification';
      notification.body = body || 'This is a test notification';
      notification.data = data || { test: 'true' };
      notification.type = NotificationType.SYSTEM_ANNOUNCEMENT;
      notification.status = NotificationStatus.SENT;
      notification.isRead = false;
      notification.createdAt = new Date();

      await notificationRepo.save(notification);

      const result = await FcmService.sendToUser(
        userId,
        {
          title: title || "Test Notification",
          body: body || "This is a test notification",
          data: data || { test: "true" },
        },
        NotificationType.SYSTEM_ANNOUNCEMENT
      );

      await NotificationController.socketService.emitNewNotification(userId, notification);

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, result, "Test notification sent")
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }

  // Get FCM status (for development/troubleshooting)
  public static async getFcmStatus(req: Request, res: Response) {
    try {
      const { userId } = (req as any).user;

      const fcmStatus = FcmService.getStatus();
      const tokenCount = await FcmService.getActiveTokenCount(userId);
      const notificationStats = await FcmService.getNotificationStats(userId);

      const statusData = {
        fcm: fcmStatus,
        tokens: {
          activeCount: tokenCount,
        },
        notifications: notificationStats,
      };

      return res.status(MESSAGES.SUCCESS._CODE).json(
        new ApiResponse(MESSAGES.SUCCESS._CODE, statusData, "FCM status retrieved successfully")
      );
    } catch (error) {
      console.error("Error getting FCM status:", error);
      return res.status(MESSAGES.INTERNAL_SERVER_ERROR._CODE).json({
        error: new ApiError(
          MESSAGES.INTERNAL_SERVER_ERROR._CODE,
          null,
          MESSAGES.INTERNAL_SERVER_ERROR.message
        ),
      });
    }
  }
}
