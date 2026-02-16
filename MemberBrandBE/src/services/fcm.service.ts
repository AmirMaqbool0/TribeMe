import * as admin from "firebase-admin";
import { getRepository } from "typeorm";
import config from "../config";
import { FcmToken } from "../models/member/notification/fcm-token.models";
import { Notification, NotificationType, NotificationStatus } from "../models/member/notification/notification.models";

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

interface NotificationTemplate {
  title: string;
  body: string;
  data?: any;
}

export class FcmService {  private static app: admin.app.App;
  private static isInitialized = false;
  public static initialize() {
    if (!this.app && !this.isInitialized) {
      try {
        const firebaseConfig = config.firebase;
        
        // Check if Firebase config is available
        if (!firebaseConfig.project_id || !firebaseConfig.private_key) {
          console.warn('Firebase configuration is missing. FCM notifications will be disabled.');
          this.isInitialized = true; // Mark as initialized to avoid repeated warnings
          return;
        }
        
        // Format the private key properly (replace \\n with actual newlines)
        const privateKey = firebaseConfig.private_key?.replace(/\\n/g, '\n');

        const serviceAccount = {
          type: firebaseConfig.type,
          project_id: firebaseConfig.project_id,
          private_key_id: firebaseConfig.private_key_id,
          private_key: privateKey,
          client_email: firebaseConfig.client_email,
          client_id: firebaseConfig.client_id,
          auth_uri: firebaseConfig.auth_uri,
          token_uri: firebaseConfig.token_uri,
          auth_provider_x509_cert_url: firebaseConfig.auth_provider_x509_cert_url,
          client_x509_cert_url: firebaseConfig.client_x509_cert_url,
          universe_domain: firebaseConfig.universe_domain || 'googleapis.com',
        };

        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        
        console.log('Firebase Cloud Messaging initialized successfully');
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize Firebase Cloud Messaging:', error);
        this.isInitialized = true; // Mark as initialized to avoid repeated attempts
      }
    }
  }  public static async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
    notificationType: NotificationType
  ): Promise<{ success: boolean; results: any[]; notificationSaved: boolean }> {
    try {
      const fcmTokenRepo = getRepository(FcmToken);
      const notificationRepo = getRepository(Notification);

      // ALWAYS create and save notification record first (for in-app notifications)
      const notification = notificationRepo.create({
        userId,
        type: notificationType,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        status: NotificationStatus.SENT,
      });

      const savedNotification = await notificationRepo.save(notification);
      console.log(`In-app notification saved for user ${userId}`);

      // Check if Firebase is initialized for push notifications
      if (!this.app && this.isInitialized) {
        console.warn('FCM service is not initialized. In-app notification saved but skipping push notification.');
        return { 
          success: true, // Success because in-app notification was saved
          results: [{ info: 'FCM service not initialized, in-app notification saved' }],
          notificationSaved: true
        };
      }

      // Get all active FCM tokens for the user
      const userTokens = await fcmTokenRepo.find({
        where: { userId, isActive: true },
      });

      if (userTokens.length === 0) {
        console.log(`No active FCM tokens found for user ${userId}. In-app notification saved.`);
        return { 
          success: true, // Success because in-app notification was saved
          results: [{ info: 'No FCM tokens found, in-app notification saved' }],
          notificationSaved: true
        };
      }

      const tokens = userTokens.map(token => token.token);
      const results = [];

      // Send to each token
      for (const token of tokens) {
        try {
          const message: admin.messaging.Message = {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
              imageUrl: payload.imageUrl,
            },
            data: payload.data || {},
            android: {
              notification: {
                sound: 'default',
                priority: 'high' as const,
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          };

          const response = await admin.messaging().send(message);
          
          // Update notification with FCM message ID
          await notificationRepo.update(savedNotification.id, {
            fcmMessageId: response,
            status: NotificationStatus.DELIVERED,
          });

          results.push({ token, success: true, messageId: response });
        } catch (error: any) {
          console.error(`Failed to send notification to token ${token}:`, error);
          
          // Handle invalid token
          if (error.code === 'messaging/registration-token-not-registered' ||
              error.code === 'messaging/invalid-registration-token') {
            await fcmTokenRepo.update({ token }, { isActive: false });
          }

          // Update notification with error
          await notificationRepo.update(savedNotification.id, {
            status: NotificationStatus.FAILED,
            errorMessage: error.message,
          });          results.push({ token, success: false, error: error.message });
        }
      }

      return { 
        success: results.some(r => r.success), 
        results,
        notificationSaved: true 
      };
    } catch (error) {
      console.error('Error in sendToUser:', error);
      throw error;
    }
  }
  public static async sendToMultipleUsers(
    userIds: string[],
    payload: PushNotificationPayload,
    notificationType: NotificationType
  ): Promise<{ [userId: string]: { success: boolean; results: any[]; notificationSaved: boolean } }> {
    const results: { [userId: string]: { success: boolean; results: any[]; notificationSaved: boolean } } = {};

    for (const userId of userIds) {
      try {
        results[userId] = await this.sendToUser(userId, payload, notificationType);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        results[userId] = { success: false, results: [], notificationSaved: false };
      }
    }

    return results;
  }
  
  public static async registerToken(
    userId: string,
    token: string,
    deviceId?: string,
    deviceType?: string
  ): Promise<FcmToken> {
    const fcmTokenRepo = getRepository(FcmToken);
    
    // Normalize deviceId: convert empty string to null for consistency
    const normalizedDeviceId = deviceId && deviceId.trim() !== '' ? deviceId : null;

    try {
      // Strategy: Use upsert based on (userId, deviceId) unique constraint
      // This ensures one token per user-device combination
      
      // First, try to find existing token for this user+device combination
      let existingToken = await fcmTokenRepo.findOne({
        where: { userId, deviceId: normalizedDeviceId },
      });

      if (existingToken) {
        // Update existing token with new token value
        existingToken.token = token;
        existingToken.isActive = true;
        existingToken.deviceType = deviceType || existingToken.deviceType;
        console.log(`Updated FCM token for user ${userId}${normalizedDeviceId ? ` on device ${normalizedDeviceId}` : ''}`);
        return await fcmTokenRepo.save(existingToken);
      }

      // If no existing token found, create new one
      const fcmToken = fcmTokenRepo.create({
        userId,
        token,
        deviceId: normalizedDeviceId,
        deviceType,
        isActive: true,
      });

      console.log(`Created new FCM token for user ${userId}${normalizedDeviceId ? ` on device ${normalizedDeviceId}` : ''}`);
      return await fcmTokenRepo.save(fcmToken);

    } catch (error: any) {
      // Handle unique constraint violation gracefully
      if (error.code === '23505' || error.message?.includes('unique_user_device')) {
        console.log(`Unique constraint violation for user ${userId}, device ${normalizedDeviceId}. Retrying update.`);
        
        // Constraint violation means record exists, so update it
        const existingToken = await fcmTokenRepo.findOne({
          where: { userId, deviceId: normalizedDeviceId },
        });

        if (existingToken) {
          existingToken.token = token;
          existingToken.isActive = true;
          existingToken.deviceType = deviceType || existingToken.deviceType;
          return await fcmTokenRepo.save(existingToken);
        }
      }
      
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }

  public static async unregisterToken(userId: string, token: string): Promise<void> {
    const fcmTokenRepo = getRepository(FcmToken);
    await fcmTokenRepo.update({ userId, token }, { isActive: false });
  }
  public static async removeUserTokens(userId: string): Promise<void> {
    const fcmTokenRepo = getRepository(FcmToken);
    await fcmTokenRepo.delete({ userId });
  }

  public static async createInAppNotification(
    userId: string,
    payload: PushNotificationPayload,
    notificationType: NotificationType
  ): Promise<Notification> {
    try {
      const notificationRepo = getRepository(Notification);

      // Create and save notification record for in-app viewing
      const notification = notificationRepo.create({
        userId,
        type: notificationType,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        status: NotificationStatus.SENT,
      });

      const savedNotification = await notificationRepo.save(notification);
      console.log(`In-app notification created for user ${userId}`);

      return savedNotification;
    } catch (error) {
      console.error('Error creating in-app notification:', error);
      throw error;
    }
  }

  // Notification templates
  public static getNewOfferNotification(brandName: string, offerTitle: string): NotificationTemplate {
    return {
      title: `New Offer from ${brandName}!`,
      body: `Check out the new offer: ${offerTitle}`,
      data: {
        type: 'new_offer',
        brandName,
        offerTitle,
      },
    };
  }

  public static getOfferRedemptionNotification(offerTitle: string, points: number): NotificationTemplate {
    return {
      title: 'Offer Redeemed Successfully!',
      body: `You've successfully redeemed "${offerTitle}" and earned ${points} points!`,
      data: {
        type: 'offer_redemption',
        offerTitle,
        points: points.toString(),
      },
    };
  }  public static getRedemptionApprovedNotification(offerTitle: string, points: number, brandName?: string, brandId?: string, isClaimed?: boolean): NotificationTemplate {
    return {
      title: 'Redemption Request Approved! 🎉',
      body: `Your redemption for "${offerTitle}" has been approved! You can now claim your ${points} points.`,
      data: {
        type: 'redemption_approved',
        offerTitle,
        offerName: offerTitle,
        points: points.toString(),
        brandName: brandName || '',
        brandId: brandId || '',
        isClaimed: (isClaimed || false).toString(),
      },
    };
  }  public static getRedemptionRejectedNotification(offerTitle: string, reason?: string, brandName?: string, brandId?: string, isClaimed?: boolean): NotificationTemplate {
    return {
      title: 'Redemption Request Rejected',
      body: `Your redemption for "${offerTitle}" was rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more details.'}`,
      data: {
        type: 'redemption_rejected',
        offerTitle,
        offerName: offerTitle,
        reason: reason || 'No specific reason provided',
        brandName: brandName || '',
        brandId: brandId || '',
        isClaimed: (isClaimed || false).toString(),
      },
    };
  }

  public static getWelcomeNotification(userName: string): NotificationTemplate {
    return {
      title: 'Welcome to MemberBrand! 🎉',
      body: `Hi ${userName}! Your account is now verified. Start exploring amazing offers and earning rewards!`,
      data: {
        type: 'welcome',
        userName,
      },
    };
  }

  public static getReferralRewardNotification(points: number, coins: number, referredUserName?: string): NotificationTemplate {
    const rewardText = points > 0 && coins > 0 
      ? `${points} points and ${coins} coins`
      : points > 0 
        ? `${points} points`
        : `${coins} coins`;
    
    return {
      title: 'Referral Reward Earned! 💰',
      body: `You've earned ${rewardText} for referring ${referredUserName || 'a friend'}!`,
      data: {
        type: 'referral_reward',
        points: points.toString(),
        coins: coins.toString(),
        referredUserName: referredUserName || '',
      },
    };
  }

  public static getSystemAnnouncementNotification(title: string, message: string): NotificationTemplate {
    return {
      title,
      body: message,
      data: {
        type: 'system_announcement',
      },
    };
  }
  public static getCoinToCashNotification(coins: number, cashAmount: number): NotificationTemplate {
    return {
      title: 'Coins Converted to Cash! 💸',
      body: `You've successfully converted ${coins} coins to $${cashAmount.toFixed(2)}!`,
      data: {
        type: 'coin_to_cash_conversion',
        coins: coins.toString(),
        cashAmount: cashAmount.toFixed(2),
      },
    };
  }
  public static getVideoRewardNotification(points: number): NotificationTemplate {
    return {
      title: 'Video Reward Earned! 🎬',
      body: `Great job! You've earned ${points} points for watching a video completely!`,
      data: {
        type: 'video_reward',
        pointsEarned: points.toString(),
      },
    };
  }

  public static getRewardClaimNotification(offerTitle: string, points: number, coins: number): NotificationTemplate {
    const rewardText = points > 0 && coins > 0 
      ? `${points} points and ${coins} coins`
      : points > 0 
        ? `${points} points`
        : `${coins} coins`;
    
    return {
      title: 'Rewards Claimed Successfully! 🎉',
      body: `You've successfully claimed ${rewardText} from "${offerTitle}"!`,
      data: {
        type: 'reward_claim',
        offerTitle,
        points: points.toString(),
        coins: coins.toString(),
      },
    };
  }

  public static getPasswordResetNotification(userName: string): NotificationTemplate {
    return {
      title: 'Password Reset Successful 🔒',
      body: `Hi ${userName}! Your password has been successfully reset. If this wasn't you, please contact support immediately.`,
      data: {
        type: 'password_reset',
        userName,
        timestamp: new Date().toISOString(),
      },
    };
  }
  
  /**
   * Get the FCM initialization status
   * @returns Object containing initialization status and app instance if available
   */
  public static getStatus(): { initialized: boolean; hasApp: boolean } {
    return {
      initialized: this.isInitialized,
      hasApp: !!this.app,
    };
  }
  
  /**
   * Get active FCM tokens count for a user
   * @param userId User ID to check
   * @returns Count of active FCM tokens
   */
  public static async getActiveTokenCount(userId: string): Promise<number> {
    const fcmTokenRepo = getRepository(FcmToken);
    return await fcmTokenRepo.count({
      where: { userId, isActive: true },
    });
  }
  
  /**
   * Get notification statistics for a user
   * @param userId User ID to check
   * @returns Object containing notification statistics
   */
  public static async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    delivered: number;
    failed: number;
  }> {
    const notificationRepo = getRepository(Notification);
    
    const total = await notificationRepo.count({
      where: { userId },
    });
    
    const unread = await notificationRepo.count({
      where: { userId, isRead: false },
    });
    
    const delivered = await notificationRepo.count({
      where: { userId, status: NotificationStatus.DELIVERED },
    });
    
    const failed = await notificationRepo.count({
      where: { userId, status: NotificationStatus.FAILED },
    });
    
    return { total, unread, delivered, failed };
  }
}
