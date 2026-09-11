import { api } from "./client.js";
import { INITIAL_BOOKINGS } from "./mockData.js";

function getLocalBookings() {
  const saved = localStorage.getItem("confe_bookings");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_BOOKINGS;
    }
  }
  localStorage.setItem("confe_bookings", JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
}

function saveLocalBookings(bookings) {
  localStorage.setItem("confe_bookings", JSON.stringify(bookings));
}

export async function getBookings() {
  try {
    const response = await api.get("/bookings");
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      saveLocalBookings(response.data);
      return response.data;
    }
  } catch (err) {
    console.warn("Backend /bookings unavailable, using local store:", err.message);
  }
  return getLocalBookings();
}

export async function getBookingById(id) {
  try {
    const response = await api.get(`/bookings/${id}`);
    if (response.data) return response.data;
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
      const current = getLocalBookings();
      saveLocalBookings([response.data.booking, ...current]);
      return response.data.booking;
    }
  } catch (err) {
    console.warn("Backend create booking failed, saving locally:", err.message);
  }

  const bookings = getLocalBookings();
  const colors = ["blue", "purple", "green", "orange", "pink"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newBooking = {
    id: Date.now(),
    room_id: Number(data.room_id) || 1,
    room_name: data.room_name || "Conference Room",
    booker_name: data.booker_name || "Team Member",
    title: data.title || "Meeting",
    date: data.date || new Date().toISOString().split("T")[0],
    start_time: data.start_time || "09:00",
    end_time: data.end_time || "10:00",
    attendees: Number(data.attendees) || 2,
    status: data.status || "confirmed",
    notes: data.notes || "",
    color: data.color || randomColor,
  };

  const updated = [newBooking, ...bookings];
  saveLocalBookings(updated);
  return newBooking;
}

export async function updateBookingStatus(id, { start_time, end_time, status, ...rest }) {
  try {
    const response = await api.patch(`/bookings/${id}`, { start_time, end_time, status });
    if (response.data) {
      const bookings = getLocalBookings().map((b) => (b.id === Number(id) ? { ...b, ...response.data } : b));
      saveLocalBookings(bookings);
      return response.data;
    }
  } catch (err) {
    console.warn(`Backend update booking ${id} status failed:`, err.message);
  }

  const bookings = getLocalBookings();
  let updatedBooking = null;
  const updated = bookings.map((b) => {
    if (b.id === Number(id)) {
      updatedBooking = {
        ...b,
        ...(start_time ? { start_time } : {}),
        ...(end_time ? { end_time } : {}),
        ...(status ? { status } : {}),
        ...rest,
      };
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

