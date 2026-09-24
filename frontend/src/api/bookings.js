import { api } from "./client.js";

export function normalizeBooking(b, fallback = {}) {
  if (!b) return b;

  let date = b.date || fallback.date;
  let startTime = b.start_time || fallback.start_time || "09:00";
  let endTime = b.end_time || fallback.end_time || "10:00";

  // Parse ISO string (e.g. 2026-09-17T00:00:00.000Z) into local date and time
  if (typeof b.start_time === "string" && b.start_time.includes("T")) {
    const dObj = new Date(b.start_time);
    if (!isNaN(dObj.getTime())) {
      if (!date) {
        const y = dObj.getFullYear();
        const m = String(dObj.getMonth() + 1).padStart(2, "0");
        const d = String(dObj.getDate()).padStart(2, "0");
        date = `${y}-${m}-${d}`;
      }
      startTime = `${String(dObj.getHours()).padStart(2, "0")}:${String(dObj.getMinutes()).padStart(2, "0")}`;
    }
  }

  if (typeof b.end_time === "string" && b.end_time.includes("T")) {
    const dObj = new Date(b.end_time);
    if (!isNaN(dObj.getTime())) {
      endTime = `${String(dObj.getHours()).padStart(2, "0")}:${String(dObj.getMinutes()).padStart(2, "0")}`;
    }
  }

  if (!date && b.created_at) {
    const dObj = new Date(b.created_at);
    if (!isNaN(dObj.getTime())) {
      const y = dObj.getFullYear();
      const m = String(dObj.getMonth() + 1).padStart(2, "0");
      const d = String(dObj.getDate()).padStart(2, "0");
      date = `${y}-${m}-${d}`;
    }
  }

  const colors = ["blue", "purple", "green", "orange", "pink"];
  const color =
    b.color ||
    fallback.color ||
    colors[Math.abs(Number(b.room_id || b.id || 0)) % colors.length];

  return {
    ...b,
    date: date || new Date().toISOString().split("T")[0],
    start_time: startTime,
    end_time: endTime,
    color,
    room_name: b.room_name || fallback.room_name || "Room / Space",
    raw_start_time: b.raw_start_time || b.start_time,
    raw_end_time: b.raw_end_time || b.end_time,
    check_in_time: b.check_in_time || null,
    check_out_time: b.check_out_time || null,
  };
}

export async function getBookings() {
  try {
    const response = await api.get("/bookings");
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((b) => normalizeBooking(b));
    }
  } catch (err) {
    console.error("Failed to fetch bookings from backend:", err.message);
  }
  return [];
}

export async function getBookingById(id) {
  try {
    const response = await api.get(`/bookings/${id}`);
    if (response.data) return normalizeBooking(response.data);
  } catch (err) {
    console.error(`Failed to fetch booking ${id}:`, err.message);
  }
  return null;
}

export async function createBooking(data) {
  try {
    const response = await api.post("/bookings", data);
    if (response.data && response.data.booking) {
      return normalizeBooking(response.data.booking, data);
    }
    return normalizeBooking(response.data, data);
  } catch (err) {
    console.error("Failed to create booking on backend:", err.message);
    throw err;
  }
}

export async function updateBookingStatus(id, { start_time, end_time, status, ...rest }) {
  try {
    const response = await api.patch(`/bookings/${id}`, { start_time, end_time, status, ...rest });
    if (response.data) {
      return normalizeBooking(response.data);
    }
  } catch (err) {
    console.error(`Failed to update booking ${id}:`, err.message);
    throw err;
  }
  return null;
}

export async function deleteBooking(id) {
  try {
    await api.delete(`/bookings/${id}`);
    return { success: true, id };
  } catch (err) {
    console.error(`Failed to delete booking ${id}:`, err.message);
    throw err;
  }
}

export async function checkInBooking(id) {
  const check_in_time = new Date().toISOString();
  return updateBookingStatus(id, { check_in_time });
}

export async function checkOutBooking(id) {
  const check_out_time = new Date().toISOString();
  return updateBookingStatus(id, { check_out_time });
}

