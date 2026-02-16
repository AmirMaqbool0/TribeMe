import { Router } from "express";
import { NotificationController } from "../../controllers/member/notification/notification.controller";
import { memberMiddleware } from "../../middleware/member.middleware";

const router = Router();

// FCM Token routes
router.post("/fcm/register", memberMiddleware, NotificationController.registerFcmToken);
router.post("/fcm/delete", memberMiddleware, NotificationController.deleteFcmToken);

// Notification routes
router.get("/", memberMiddleware, NotificationController.getNotifications);
router.get("/unread-count", memberMiddleware, NotificationController.getUnreadCount);
router.put("/:notificationId/read", memberMiddleware, NotificationController.markAsRead);
router.put("/read-all", memberMiddleware, NotificationController.markAllAsRead);
router.delete("/:notificationId", memberMiddleware, NotificationController.deleteNotification);
router.delete("/", memberMiddleware, NotificationController.clearAllNotifications);

export default router;
