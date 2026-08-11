import pool from "../config/db.js";

export async function getAllBookings() {
  try {
    const result = await pool.query("SELECT * FROM bookings");
    return result.rows;
  } catch (error) {
    console.log(error);
  }
}

export async function getBookingById(id) {
  try {
    const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  } catch (error) {
    console.log(error);
  }
}

export async function createBooking({
  user_id,
  room_id,
  start_time,
  end_time,
  status,
}) {
  try {
    const result = await pool.query(
      `INSERT INTO bookings (user_id, room_id, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, room_id, start_time, end_time, status],
    );
    return result.rows[0];
  } catch (error) {
    console.log(error);
  }
}

export async function updateBookingStatus(
  id,
  { start_time, end_time, status },
) {
  try {
    const result = await pool.query(
      `UPDATE bookings SET
         start_time = COALESCE($1, start_time),
         end_time = COALESCE($2, end_time),
         status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [start_time, end_time, status, id],
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
