import pool from "../config/db.js";

function formatRoom(r) {
  if (!r) return null;
  const status = r.status || (r.is_active === false ? "Maintenance" : "Available");
  return {
    ...r,
    status,
    is_active: r.is_active !== false,
    size: Number(r.capacity) > 15 ? "large" : Number(r.capacity) > 6 ? "medium" : "small",
  };
}

export async function getAllRooms(activeOnly = false) {
  const query = activeOnly
    ? "SELECT * FROM rooms WHERE is_active = true ORDER BY id ASC"
    : "SELECT * FROM rooms ORDER BY id ASC";
  const result = await pool.query(query);
  return result.rows.map(formatRoom);
}

export const getAllActiveRoom = () => getAllRooms(true);

export async function getRoomById(id) {
  const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
  return result.rows[0] ? formatRoom(result.rows[0]) : null;
}

export async function createRoom({
  name,
  capacity,
  location,
  description,
  amenities,
  is_active = true,
  type = "Meeting Room",
}) {
  const result = await pool.query(
    `INSERT INTO rooms (name, capacity, location, description, amenities, is_active, type)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      name,
      capacity,
      location || null,
      description || null,
      amenities || [],
      is_active !== undefined ? is_active : true,
      type || "Meeting Room",
    ],
  );
  return formatRoom(result.rows[0]);
}

export async function updateRoom(id, fields) {
  const allowed = ["name", "capacity", "location", "description", "amenities", "is_active", "type"];
  const sets = [];
  const values = [];
  let paramIdx = 1;

  // If status is passed, translate it to is_active
  if (fields.status !== undefined && fields.is_active === undefined) {
    fields.is_active = fields.status !== "Maintenance";
  }

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key) && val !== undefined) {
      sets.push(`${key} = $${paramIdx}`);
      values.push(val);
      paramIdx++;
    }
  }

  if (sets.length === 0) {
    return getRoomById(id);
  }

  values.push(id);
  const query = `UPDATE rooms SET ${sets.join(", ")} WHERE id = $${paramIdx} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] ? formatRoom(result.rows[0]) : null;
}

export async function deleteRoom(id) {
  const result = await pool.query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0] ? formatRoom(result.rows[0]) : null;
}