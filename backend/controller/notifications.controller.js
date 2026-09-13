import {
  getNotificationsForUser,
  createNotification,
  toggleNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../models/notifications.model.js";

export const getNotificationsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || "Employee";
    const email = req.user?.email || "";

    const notifications = await getNotificationsForUser(userId, role, email);
    res.json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createNotificationController = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "booking",
      targetRoles,
      targetUserId,
      targetEmail,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required." });
    }

    const createdBy = req.user?.id || null;

    const notif = await createNotification({
      title,
      message,
      type,
      target_roles: targetRoles || ["*"],
      target_user_id: targetUserId || null,
      target_email: targetEmail || null,
      created_by: createdBy,
    });

    res.status(201).json(notif);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const toggleReadController = async (req, res) => {
  try {
    const notifId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User identity required." });
    }

    const result = await toggleNotificationRead(notifId, userId);
    res.json(result);
  } catch (error) {
    console.error("Error toggling notification read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markAllReadController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || "Employee";
    const email = req.user?.email || "";

    if (!userId) {
      return res.status(401).json({ error: "User identity required." });
    }

    await markAllNotificationsRead(userId, role, email);
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Error marking all read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotificationController = async (req, res) => {
  try {
    const notifId = req.params.id;
    await deleteNotification(notifId);
    res.json({ message: "Notification deleted successfully.", id: notifId });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

