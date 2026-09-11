/**
 * Notification Service
 * Standardized notification dispatcher and storage engine.
 */

const NOTIFICATION_STORAGE_KEY = "confe_notifications";
export const NOTIFICATIONS_UPDATED_EVENT = "confe_notifications_updated";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Welcome to ConfeBook",
    message: "Meeting room management and scheduling system is fully initialized and operational.",
    time: "Recently",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    type: "booking",
  },
  {
    id: "notif-2",
    title: "Operational Status Notice",
    message: "Conference facilities are available for reservations according to facility scheduling policies.",
    time: "Today",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: true,
    type: "maintenance",
  },
];

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

export function getNotifications() {
  const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return [...INITIAL_NOTIFICATIONS];
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((n) => ({
      ...n,
      time: getRelativeTime(n.timestamp),
    }));
  } catch (err) {
    console.error("Failed to parse notifications from storage:", err);
    return [];
  }
}

export function getUnreadCount() {
  const notifications = getNotifications();
  return notifications.filter((n) => !n.read).length;
}

export function addNotification({ title, message, type = "booking" }) {
  const current = getNotifications();
  const now = new Date();

  const newNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    message,
    type,
    read: false,
    timestamp: now.toISOString(),
    time: "Just now",
  };

  const updated = [newNotification, ...current].slice(0, 100);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: newNotification }));
  return newNotification;
}

export function markAsRead(id) {
  const current = getNotifications();
  const updated = current.map((n) => (String(n.id) === String(id) ? { ...n, read: true } : n));
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: updated }));
  return updated;
}

export function toggleNotificationRead(id) {
  const current = getNotifications();
  const updated = current.map((n) => (String(n.id) === String(id) ? { ...n, read: !n.read } : n));
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: updated }));
  return updated;
}

export function markAllAsRead() {
  const current = getNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: updated }));
  return updated;
}

export function clearAllNotifications() {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: [] }));
  return [];
}

