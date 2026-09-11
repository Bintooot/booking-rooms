import { api } from "./client.js";
import { INITIAL_BOOKINGS } from "./mockData.js";

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
    room_name: b.room_name || fallback.room_name || "Conference Room",
    raw_start_time: b.raw_start_time || b.start_time,
    raw_end_time: b.raw_end_time || b.end_time,
  };
}

function getLocalBookings() {
  const saved = localStorage.getItem("confe_bookings");
  if (saved) {
    try {
      return JSON.parse(saved).map((b) => normalizeBooking(b));
    } catch {
      return INITIAL_BOOKINGS.map((b) => normalizeBooking(b));
    }
  }
  const normalized = INITIAL_BOOKINGS.map((b) => normalizeBooking(b));
  localStorage.setItem("confe_bookings", JSON.stringify(normalized));
  return normalized;
}

function saveLocalBookings(bookings) {
  localStorage.setItem("confe_bookings", JSON.stringify(bookings.map((b) => normalizeBooking(b))));
}

export async function getBookings() {
  try {
    const response = await api.get("/bookings");
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const normalized = response.data.map((b) => normalizeBooking(b));
      saveLocalBookings(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("Backend /bookings unavailable, using local store:", err.message);
  }
  return getLocalBookings();
}

export async function getBookingById(id) {
  try {
    const response = await api.get(`/bookings/${id}`);
    if (response.data) return normalizeBooking(response.data);
  } catch (err) {
    console.warn(`Backend /bookings/${id} unavailable:`, err.message);
  }
  const bookings = getLocalBookings();
  return bookings.find((b) => b.id === Number(id)) || null;
}

export async function createBooking(data) {
  try {
    const response = await api.post("/bookings", data);
    if (response.data && response.data.booking) {
      const normalized = normalizeBooking(response.data.booking, data);
      const current = getLocalBookings();
      saveLocalBookings([normalized, ...current]);
      return normalized;
    }
  } catch (err) {
    console.warn("Backend create booking failed, saving locally:", err.message);
  }

  const bookings = getLocalBookings();
  const normalized = normalizeBooking({
    ...data,
    id: Date.now(),
    status: data.status || "confirmed",
  }, data);

  const updated = [normalized, ...bookings];
  saveLocalBookings(updated);
  return normalized;
}

export async function updateBookingStatus(id, { start_time, end_time, status, ...rest }) {
  try {
    const response = await api.patch(`/bookings/${id}`, { start_time, end_time, status, ...rest });
    if (response.data) {
      const normalized = normalizeBooking(response.data);
      const bookings = getLocalBookings().map((b) => (b.id === Number(id) ? normalized : b));
      saveLocalBookings(bookings);
      return normalized;
    }
  } catch (err) {
    console.warn(`Backend update booking ${id} status failed:`, err.message);
  }

  const bookings = getLocalBookings();
  let updatedBooking = null;
  const updated = bookings.map((b) => {
    if (b.id === Number(id)) {
      updatedBooking = normalizeBooking({
        ...b,
        ...(start_time ? { start_time } : {}),
        ...(end_time ? { end_time } : {}),
        ...(status ? { status } : {}),
        ...rest,
      });
      return updatedBooking;
    }
    return b;
  });
  saveLocalBookings(updated);
  return updatedBooking;
}

export async function deleteBooking(id) {
  try {
    await api.delete(`/bookings/${id}`);
  } catch (err) {
    console.warn(`Backend delete booking ${id} failed:`, err.message);
  }

  const bookings = getLocalBookings();
  const updated = bookings.filter((b) => b.id !== Number(id));
  saveLocalBookings(updated);
  return { success: true, id };
}
