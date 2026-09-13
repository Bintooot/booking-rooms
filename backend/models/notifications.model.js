import pool from "../config/db.js";

function formatNotification(row) {
  if (!row) return null;
  const d = new Date(row.created_at);

  return {
    id: `notif-${row.id}`,
    raw_id: row.id,
    title: row.title,
    message: row.message,
    type: row.type || "booking",
    targetRoles: row.target_roles || ["*"],
    targetUserId: row.target_user_id || null,
    targetEmail: row.target_email || null,
    createdBy: row.created_by || null,
    timestamp: row.created_at,
    isRead: Boolean(row.is_read),
    displayTime: isNaN(d.getTime())
      ? "Recently"
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
  };
}

export async function getNotificationsForUser(userId, role = "Employee", email = "") {
  const query = `
    SELECT n.*, 
      CASE WHEN nr.user_id IS NOT NULL THEN true ELSE false END AS is_read
    FROM notifications n
    LEFT JOIN notification_reads nr 
      ON n.id = nr.notification_id AND nr.user_id = $1
    WHERE 
      '*' = ANY(n.target_roles)
      OR $2 = ANY(n.target_roles)
      OR n.target_user_id = $1
      OR (n.target_email IS NOT NULL AND LOWER(n.target_email) = LOWER($3))
    ORDER BY n.created_at DESC
    LIMIT 100
  `;

  const result = await pool.query(query, [userId || -1, role || "", email || ""]);
  return result.rows.map(formatNotification);
}

export async function createNotification({
  title,
  message,
  type = "booking",
  target_roles = ["*"],
  target_user_id = null,
  target_email = null,
  created_by = null,
}) {
  const roles = Array.isArray(target_roles) && target_roles.length > 0 ? target_roles : ["*"];

  const result = await pool.query(
    `INSERT INTO notifications (title, message, type, target_roles, target_user_id, target_email, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      title,
      message,
      type,
      roles,
      target_user_id ? Number(target_user_id) : null,
      target_email || null,
      created_by ? Number(created_by) : null,
    ]
  );

  return formatNotification({ ...result.rows[0], is_read: false });
}

export async function toggleNotificationRead(notificationId, userId) {
  const numId = Number(String(notificationId).replace(/\D/g, ""));
  const numUserId = Number(userId);

  // Check if already read
  const check = await pool.query(
    "SELECT 1 FROM notification_reads WHERE notification_id = $1 AND user_id = $2",
    [numId, numUserId]
  );

  if (check.rows.length > 0) {
    await pool.query(
      "DELETE FROM notification_reads WHERE notification_id = $1 AND user_id = $2",
      [numId, numUserId]
    );
    return { id: notificationId, isRead: false };
  } else {
    await pool.query(
      "INSERT INTO notification_reads (notification_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [numId, numUserId]
    );
    return { id: notificationId, isRead: true };
  }
}

export async function markAllNotificationsRead(userId, role = "Employee", email = "") {
  const numUserId = Number(userId);
  if (!numUserId) return false;

  await pool.query(
    `INSERT INTO notification_reads (notification_id, user_id)
     SELECT n.id, $1
     FROM notifications n
     WHERE (
       '*' = ANY(n.target_roles)
       OR $2 = ANY(n.target_roles)
       OR n.target_user_id = $1
       OR (n.target_email IS NOT NULL AND LOWER(n.target_email) = LOWER($3))
     )
     ON CONFLICT (notification_id, user_id) DO NOTHING`,
    [numUserId, role || "", email || ""]
  );

  return true;
}

export async function deleteNotification(notificationId) {
  const numId = Number(String(notificationId).replace(/\D/g, ""));
  await pool.query("DELETE FROM notifications WHERE id = $1", [numId]);
  return true;
}

