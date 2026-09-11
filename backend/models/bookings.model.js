import pool from "../config/db.js";

export async function getAllBookings() {
  const result = await pool.query(`
    SELECT b.*, r.name AS room_name
    FROM bookings b
    LEFT JOIN rooms r ON b.room_id = r.id
    ORDER BY b.start_time DESC
  `);
  return result.rows;
}

export async function getBookingById(id) {
  const result = await pool.query(
    `SELECT b.*, r.name AS room_name
     FROM bookings b
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createBooking({
  room_id,
  booker_name = "Team Member",
  start_time,
  end_time,
  status = "confirmed",
  title = "Meeting",
  notes = "",
  attendees = 2,
}) {
  const result = await pool.query(
    `INSERT INTO bookings (room_id, booker_name, start_time, end_time, status, title, notes, attendees)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      Number(room_id),
      booker_name,
      start_time,
      end_time,
      status,
      title,
      notes,
      Number(attendees) || 2,
    ]
  );

  const newBooking = result.rows[0];
  if (newBooking) {
    const roomRes = await pool.query("SELECT name FROM rooms WHERE id = $1", [newBooking.room_id]);
    newBooking.room_name = roomRes.rows[0]?.name || "Conference Room";
  }
  return newBooking;
}

export async function updateBooking(id, fields) {
  const allowed = [
    "room_id",
    "booker_name",
    "start_time",
    "end_time",
    "status",
    "title",
    "notes",
    "attendees",
  ];
  const sets = [];
  const values = [];
  let paramIdx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key) && val !== undefined) {
      sets.push(`${key} = $${paramIdx}`);
      values.push(val);
      paramIdx++;
    }
  }

  if (sets.length === 0) {
    return getBookingById(id);
  }

  values.push(id);
  const query = `UPDATE bookings SET ${sets.join(", ")} WHERE id = $${paramIdx} RETURNING *`;
  const result = await pool.query(query, values);
  const updated = result.rows[0] || null;

  if (updated) {
    const roomRes = await pool.query("SELECT name FROM rooms WHERE id = $1", [updated.room_id]);
    updated.room_name = roomRes.rows[0]?.name || "Conference Room";
  }
  return updated;
}

export const updateBookingStatus = updateBooking;

export async function deleteBooking(id) {
  const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] || null;
}
