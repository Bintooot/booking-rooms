import pool from "../config/db.js";

function formatBooking(row) {
  if (!row) return null;
  const start = new Date(row.start_time);
  const end = new Date(row.end_time);

  // Extract YYYY-MM-DD
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  // Extract HH:MM
  const startHour = String(start.getHours()).padStart(2, "0");
  const startMin = String(start.getMinutes()).padStart(2, "0");
  const startTimeStr = `${startHour}:${startMin}`;

  const endHour = String(end.getHours()).padStart(2, "0");
  const endMin = String(end.getMinutes()).padStart(2, "0");
  const endTimeStr = `${endHour}:${endMin}`;

  const colors = ["blue", "purple", "green", "orange", "pink"];
  const color = colors[Math.abs(Number(row.room_id || row.id || 0)) % colors.length];

  return {
    ...row,
    user_id: row.user_id || null,
    user_name: row.user_name || row.booker_name,
    user_email: row.user_email || null,
    date: dateStr,
    start_time: startTimeStr,
    end_time: endTimeStr,
    raw_start_time: row.start_time,
    raw_end_time: row.end_time,
    check_in_time: row.check_in_time || null,
    check_out_time: row.check_out_time || null,
    color,
  };
}

export async function getAllBookings() {
  const result = await pool.query(`
    SELECT b.*, r.name AS room_name, u.name AS user_name, u.email AS user_email
    FROM bookings b
    LEFT JOIN rooms r ON b.room_id = r.id
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.start_time DESC
  `);
  return result.rows.map(formatBooking);
}

export async function getBookingById(id) {
  const result = await pool.query(
    `SELECT b.*, r.name AS room_name, u.name AS user_name, u.email AS user_email
     FROM bookings b
     LEFT JOIN rooms r ON b.room_id = r.id
     LEFT JOIN users u ON b.user_id = u.id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0] ? formatBooking(result.rows[0]) : null;
}

export async function createBooking({
  room_id,
  user_id = null,
  booker_name = "Team Member",
  start_time,
  end_time,
  status = "confirmed",
  title = "Meeting",
  notes = "",
  attendees = 2,
}) {
  const result = await pool.query(
    `INSERT INTO bookings (room_id, user_id, booker_name, start_time, end_time, status, title, notes, attendees)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      Number(room_id),
      user_id ? Number(user_id) : null,
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
    newBooking.room_name = roomRes.rows[0]?.name || "Room / Space";

    if (newBooking.user_id) {
      const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [newBooking.user_id]);
      if (userRes.rows[0]) {
        newBooking.user_name = userRes.rows[0].name;
        newBooking.user_email = userRes.rows[0].email;
      }
    }
  }
  return formatBooking(newBooking);
}

export async function updateBooking(id, fields) {
  const allowed = [
    "room_id",
    "user_id",
    "booker_name",
    "start_time",
    "end_time",
    "status",
    "title",
    "notes",
    "attendees",
    "check_in_time",
    "check_out_time",
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
    updated.room_name = roomRes.rows[0]?.name || "Room / Space";

    if (updated.user_id) {
      const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [updated.user_id]);
      if (userRes.rows[0]) {
        updated.user_name = userRes.rows[0].name;
        updated.user_email = userRes.rows[0].email;
      }
    }
  }
  return formatBooking(updated);
}

export const updateBookingStatus = updateBooking;

export async function deleteBooking(id) {
  const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] || null;
}
