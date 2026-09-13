/**
 * Audit Logging Service
 * Standardized service for recording security and administrative events.
 * Persists to PostgreSQL via /api/audit-logs with robust local cache fallback.
 */

import { api } from "../api/client.js";

const AUDIT_STORAGE_KEY = "confe_audit_logs";
export const AUDIT_UPDATED_EVENT = "confe_audit_logs_updated";

const INITIAL_LOGS = [
  {
    id: "log-1",
    action: "Room Created",
    actor: "Administrator",
    target: "Innovation Hub",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    displayTime: "Today, 10:45 AM",
    ip: "127.0.0.1",
    type: "room",
  },
  {
    id: "log-2",
    action: "Booking Confirmed",
    actor: "Administrator",
    target: "The Boardroom",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    displayTime: "Today, 09:15 AM",
    ip: "127.0.0.1",
    type: "booking",
  },
  {
    id: "log-3",
    action: "Room Status Changed",
    actor: "Administrator",
    target: "Meeting Room B (Maintenance)",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    displayTime: "Yesterday, 04:30 PM",
    ip: "127.0.0.1",
    type: "room",
  },
  {
    id: "log-4",
    action: "User Registered",
    actor: "Administrator",
    target: "Carlos Mendoza (Employee)",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    displayTime: "2 days ago, 02:00 PM",
    ip: "127.0.0.1",
    type: "user",
  },
];

/**
 * Format a Date object into human-readable audit time.
 */
export function formatAuditDisplayTime(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Recently";

  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(d);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
}

/**
 * Retrieve current audit logs synchronously from storage cache.
 */
export function getAuditLogs() {
  const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
    return [...INITIAL_LOGS];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse audit logs from storage:", err);
    return [];
  }
}

/**
 * Asynchronously fetch latest audit logs from PostgreSQL backend.
 */
export async function fetchAuditLogs(options = {}) {
  try {
    const response = await api.get("/audit-logs", { params: options });
    if (response.data && Array.isArray(response.data)) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(response.data));
      window.dispatchEvent(new CustomEvent(AUDIT_UPDATED_EVENT, { detail: response.data }));
      return response.data;
    }
  } catch (err) {
    console.warn("Backend /audit-logs unavailable, falling back to local cache:", err.message);
  }
  return getAuditLogs();
}

/**
 * Record a new audit log event to PostgreSQL with local fallback.
 */
export function logAuditEvent({ action, actor = "System", target = "N/A", type = "system", ip = "127.0.0.1", user_id = null }) {
  const currentLogs = getAuditLogs();
  const now = new Date();

  const localLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    action,
    actor: actor || "System",
    target,
    timestamp: now.toISOString(),
    displayTime: formatAuditDisplayTime(now),
    ip: ip || "127.0.0.1",
    type: type || "system",
  };

  const updatedLogs = [localLog, ...currentLogs].slice(0, 200);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs));
  window.dispatchEvent(new CustomEvent(AUDIT_UPDATED_EVENT, { detail: localLog }));

  // Asynchronously persist to PostgreSQL
  api.post("/audit-logs", {
    action,
    actor: actor || "System",
    target,
    type: type || "system",
    ip: ip || "127.0.0.1",
    user_id,
  }).catch((err) => {
    console.warn("Could not persist audit log to backend:", err.message);
  });

  return localLog;
}

/**
 * Clear all audit logs on server and local cache.
 */
export async function clearAuditLogs() {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent(AUDIT_UPDATED_EVENT, { detail: [] }));

  try {
    await api.delete("/audit-logs");
  } catch (err) {
    console.warn("Failed to clear audit logs on backend:", err.message);
  }
}

/**
 * Export audit logs as CSV file download.
 */
export function exportAuditLogsCSV() {
  const logs = getAuditLogs();
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Timestamp,Action,Actor,Target Resource,Type,IP Address\n";

  logs.forEach((log) => {
    csvContent += `"${log.displayTime}","${log.action}","${log.actor}","${log.target}","${log.type}","${log.ip}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `spacesync_audit_trail_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
