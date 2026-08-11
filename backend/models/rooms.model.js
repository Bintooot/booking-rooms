import pool from "../config/db.js";

export async function getAllActiveRoom() {
  const result = await pool.query(
    "SELECT * FROM rooms WHERE is_active = true ORDER BY id ASC",
  );
  return result.rows;
} 

export async function getRoomById(id) {
  const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createRoom({
  name,
  capacity,
  location,
  description,
  amenities,
}) {
  const result = await pool.query(
    `INSERT INTO rooms (name, capacity, location, description, amenities)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, capacity, location || null, description || null, amenities || []],
  );
  return result.rows[0];
}

export async function updateRoom(
  id,
  { name, capacity, location, description, amenities },
) {
  const result = await pool.query(
    `UPDATE rooms SET name = COALESCE($1, name), capacity = COALESCE($2, capacity), location = COALESCE($3, location), description = COALESCE($4, description), amenities = COALESCE($5, amenities)
     WHERE id = $6 RETURNING *`,
    [
      name,
      capacity,
      location || null,
      description || null,
      amenities || [],
      id,
    ],
  );
  return result.rows[0];
}

export async function deleteRoom(id) {
  const result = await pool.query(`DELETE FROM rooms WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
}