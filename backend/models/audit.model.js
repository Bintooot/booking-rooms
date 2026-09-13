import pool from "../config/db.js";

/**
 * Format audit log row for consistent client consumption
 */
function formatAuditLog(row) {
  if (!row) return null;
  const d = new Date(row.created_at);

  return {
    id: `log-${row.id}`,
    raw_id: row.id,
    user_id: row.user_id || null,
    actor: row.actor,
    action: row.action,
    target: row.target || "N/A",
    type: row.type || "system",
    ip: row.ip || "127.0.0.1",
    timestamp: row.created_at,
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

export async function getAllAuditLogs({ limit = 200, type = "all", search = "" } = {}) {
  let query = `
    SELECT a.*, u.email AS user_email
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
  `;
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (type && type !== "all") {
    conditions.push(`a.type = $${paramIdx}`);
    params.push(type);
    paramIdx++;
  }

  if (search && search.trim() !== "") {
    conditions.push(`(
      a.action ILIKE $${paramIdx} OR 
      a.actor ILIKE $${paramIdx} OR 
      a.target ILIKE $${paramIdx}
    )`);
    params.push(`%${search.trim()}%`);
    paramIdx++;
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY a.created_at DESC LIMIT $${paramIdx}`;
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows.map(formatAuditLog);
}

export async function createAuditLog({
  user_id = null,
  actor = "System",
  action,
  target = "N/A",
  type = "system",
  ip = "127.0.0.1",
}) {
  const result = await pool.query(
    `INSERT INTO audit_logs (user_id, actor, action, target, type, ip)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [user_id ? Number(user_id) : null, actor, action, target, type, ip]
  );
  return formatAuditLog(result.rows[0]);
}

export async function clearAllAuditLogs() {
  await pool.query("DELETE FROM audit_logs");
  return true;
}

