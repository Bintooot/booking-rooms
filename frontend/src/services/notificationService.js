/**
 * Notification Service
 * Role-based and user-targeted notification dispatcher with per-user read states.
 * Persists to PostgreSQL via /api/notifications with robust local cache fallback.
 */

import { api } from "../api/client.js";

export const NOTIFICATIONS_UPDATED_EVENT = "confe_notifications_updated";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Welcome to SpaceSync",
    message: "Workspace and room reservation system is fully initialized and operational.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    readBy: [],
    type: "booking",
    targetRoles: ["*"],
  },
  {
    id: "notif-2",
    title: "Operational Status Notice",
    message: "Rooms and collaborative facilities are available for reservations according to scheduling policies.",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    readBy: [],
    type: "system",
    targetRoles: ["*"],
  },
  {
    id: "notif-3",
    title: "Real-Time Scheduling Ready",
    message: "Conflict detection active across all executive boardrooms and breakout spaces.",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    readBy: [],
    type: "room",
    targetRoles: ["*"],
  },
];

let memoryNotifications = [...INITIAL_NOTIFICATIONS];

export function getRelativeTime(timestamp) {
  if (!timestamp) return "Recently";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Recently";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStoredNotifications() {
  return [...memoryNotifications];
}

function getUserIdentifier(user) {
  if (!user) return null;
  return user.email ? user.email.toLowerCase() : user.id ? String(user.id) : null;
}

/**
 * Determines whether a notification is relevant to the given user.
 */
export function isNotificationForUser(n, user) {
  if (!user) return false;

  const userKey = getUserIdentifier(user);
  const dismissedBy = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
  if (userKey && dismissedBy.includes(userKey)) {
    return false;
  }

  const userEmail = (user.email || "").toLowerCase();
  const userRole = (user.role || "Employee").toLowerCase();
  const userId = user.id ? String(user.id) : "";

  // 1. Explicit user target by ID
  if (n.targetUserId && String(n.targetUserId) === userId) {
    return true;
  }

  // 2. Explicit user target by Email
  if (n.targetEmail && n.targetEmail.toLowerCase() === userEmail) {
    return true;
  }

  // 3. Target roles check
  if (n.targetRoles && Array.isArray(n.targetRoles) && n.targetRoles.length > 0) {
    const matchesRole = n.targetRoles.some((role) => {
      const r = role.toLowerCase();
      return r === "*" || r === "all" || r === userRole;
    });
    if (matchesRole) return true;
  }

  // 4. Default: If no specific user or role is targeted, it's a broadcast for all
  if (!n.targetUserId && !n.targetEmail && (!n.targetRoles || n.targetRoles.length === 0)) {
    return true;
  }

  return false;
}

/**
 * Synchronously retrieves notifications visible to the given user from cache.
 */
export function getNotifications(user) {
  const all = getStoredNotifications();
  const userKey = getUserIdentifier(user);

  if (!user) return [];

  return all
    .filter((n) => isNotificationForUser(n, user))
    .map((n) => {
      const readBy = Array.isArray(n.readBy) ? n.readBy : [];
      const isRead = userKey ? (readBy.includes(userKey) || Boolean(n.isRead)) : !!n.read;

      return {
        ...n,
        read: isRead,
        time: getRelativeTime(n.timestamp),
      };
    });
}

/**
 * Asynchronously fetch latest notifications from PostgreSQL.
 */
export async function fetchNotifications(user) {
  if (!user) return [];

  try {
    const response = await api.get("/notifications");
    if (response.data && Array.isArray(response.data)) {
      const userKey = getUserIdentifier(user);
      const serverNotifs = response.data.map((n) => ({
        ...n,
        readBy: n.isRead && userKey ? [userKey] : [],
      }));

      memoryNotifications = serverNotifs;
      window.dispatchEvent(
        new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: serverNotifs })
      );
      return getNotifications(user);
    }
  } catch (err) {
    console.warn("Backend /notifications unavailable, using memory notifications:", err.message);
  }

  return getNotifications(user);
}

/**
 * Returns the unread notification count for the current user.
 */
export function getUnreadCount(user) {
  if (!user) return 0;
  const userNotifs = getNotifications(user);
  return userNotifs.filter((n) => !n.read).length;
}

/**
 * Dispatches a new notification with server persistence and memory fallback.
 */
export function addNotification({
  title,
  message,
  type = "booking",
  targetUserId = null,
  targetEmail = null,
  targetRoles = ["*"],
}) {
  const current = getStoredNotifications();
  const now = new Date();

  const localNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    message,
    type,
    targetUserId: targetUserId ? String(targetUserId) : null,
    targetEmail: targetEmail ? targetEmail.toLowerCase() : null,
    targetRoles: Array.isArray(targetRoles) ? targetRoles : [targetRoles],
    readBy: [],
    timestamp: now.toISOString(),
  };

  const updated = [localNotif, ...current].slice(0, 150);
  memoryNotifications = updated;

  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: localNotif })
  );

  // Asynchronously send to PostgreSQL backend
  api.post("/notifications", {
    title,
    message,
    type,
    targetUserId,
    targetEmail,
    targetRoles: Array.isArray(targetRoles) ? targetRoles : [targetRoles],
  }).catch((err) => {
    console.warn("Could not persist notification to backend:", err.message);
  });

  return localNotif;
}

/**
 * Marks a notification as read for the current user.
 */
export function markAsRead(id, user) {
  return toggleNotificationRead(id, user);
}

/**
 * Toggles a notification's read state for the current user.
 */
export function toggleNotificationRead(id, user) {
  const current = getStoredNotifications();
  const userKey = getUserIdentifier(user);
  if (!userKey) return current;

  const updated = current.map((n) => {
    if (String(n.id) === String(id)) {
      let readBy = Array.isArray(n.readBy) ? [...n.readBy] : [];
      if (readBy.includes(userKey)) {
        readBy = readBy.filter((k) => k !== userKey);
      } else {
        readBy.push(userKey);
      }
      return { ...n, readBy };
    }
    return n;
  });

  memoryNotifications = updated;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: updated }));

  // Asynchronously sync with PostgreSQL
  api.post(`/notifications/${id}/read`).catch((err) => {
    console.warn("Could not sync notification read status to backend:", err.message);
  });

  return getNotifications(user);
}

/**
 * Marks all notifications visible to the current user as read.
 */
export function markAllAsRead(user) {
  const current = getStoredNotifications();
  const userKey = getUserIdentifier(user);
  if (!userKey) return current;

  const updated = current.map((n) => {
    if (isNotificationForUser(n, user)) {
      const readBy = Array.isArray(n.readBy) ? [...n.readBy] : [];
      if (!readBy.includes(userKey)) {
        readBy.push(userKey);
      }
      return { ...n, readBy };
    }
    return n;
  });

  memoryNotifications = updated;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: updated }));

  // Asynchronously sync with backend
  api.post("/notifications/read-all").catch((err) => {
    console.warn("Could not sync read-all to backend:", err.message);
  });

  return getNotifications(user);
}

/**
 * Clears notifications for the current user.
 */
export function clearAllNotifications(user) {
  const current = getStoredNotifications();
  const userKey = getUserIdentifier(user);
  if (!userKey) return [];

  const updated = current
    .filter((n) => {
      const isOnlyForThisUser =
        (n.targetUserId && String(n.targetUserId) === String(user.id)) ||
        (n.targetEmail && n.targetEmail.toLowerCase() === user.email?.toLowerCase());
      return !isOnlyForThisUser;
    })
    .map((n) => {
      if (isNotificationForUser(n, user)) {
        const dismissedBy = Array.isArray(n.dismissedBy) ? [...n.dismissedBy] : [];
        if (!dismissedBy.includes(userKey)) {
          dismissedBy.push(userKey);
        }
        return { ...n, dismissedBy };
      }
      return n;
    });

  memoryNotifications = updated;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: updated }));
  return [];
}
