import { api } from "./client.js";

export function normalizeRoom(r, fallback = {}) {
  if (!r) return r;
  const status = r.status || (r.is_active === false ? "Maintenance" : fallback.status || "Available");
  const capacity = Number(r.capacity) || 4;
  const size = r.size || (capacity > 15 ? "large" : capacity > 6 ? "medium" : "small");
  return {
    ...r,
    status,
    is_active: r.is_active !== false && status !== "Maintenance",
    size,
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
  };
}

export async function getRooms() {
  try {
    const response = await api.get("/rooms");
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((r) => normalizeRoom(r));
    }
  } catch (err) {
    console.error("Failed to fetch rooms from backend:", err.message);
  }
  return [];
}

export async function getRoomById(id) {
  try {
    const response = await api.get(`/rooms/${id}`);
    if (response.data) return normalizeRoom(response.data);
  } catch (err) {
    console.error(`Failed to fetch room ${id}:`, err.message);
  }
  return null;
}

export async function createRoom(data) {
  try {
    const response = await api.post("/rooms", data);
    if (response.data) {
      return normalizeRoom(response.data, data);
    }
  } catch (err) {
    console.error("Failed to create room on backend:", err.message);
    throw err;
  }
  return null;
}

export async function updateRoom(id, data) {
  try {
    const response = await api.patch(`/rooms/${id}`, data);
    if (response.data) {
      return normalizeRoom(response.data, data);
    }
  } catch (err) {
    console.error(`Failed to update room ${id}:`, err.message);
    throw err;
  }
  return null;
}

export async function deleteRoom(id) {
  try {
    await api.delete(`/rooms/${id}`);
    return { success: true, id };
  } catch (err) {
    console.error(`Failed to delete room ${id}:`, err.message);
    throw err;
  }
}
