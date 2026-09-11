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

function getLocalRooms() {
  const saved = localStorage.getItem("confe_rooms");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((r) => normalizeRoom(r));
      }
    } catch {
      return [];
    }
  }
  return [];
}

function saveLocalRooms(rooms) {
  localStorage.setItem("confe_rooms", JSON.stringify((rooms || []).map((r) => normalizeRoom(r))));
}

export async function getRooms() {
  try {
    const response = await api.get("/rooms");
    if (response.data && Array.isArray(response.data)) {
      const normalized = response.data.map((r) => normalizeRoom(r));
      saveLocalRooms(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("Backend /rooms unavailable, using local store:", err.message);
  }
  return getLocalRooms();
}

export async function getRoomById(id) {
  try {
    const response = await api.get(`/rooms/${id}`);
    if (response.data) return normalizeRoom(response.data);
  } catch (err) {
    console.warn(`Backend /rooms/${id} unavailable:`, err.message);
  }
  const rooms = getLocalRooms();
  return rooms.find((r) => r.id === Number(id)) || null;
}

export async function createRoom(data) {
  try {
    const response = await api.post("/rooms", data);
    if (response.data) {
      const normalized = normalizeRoom(response.data, data);
      const current = getLocalRooms();
      saveLocalRooms([normalized, ...current]);
      return normalized;
    }
  } catch (err) {
    console.warn("Backend create room failed, saving locally:", err.message);
  }

  // Local fallback
  const rooms = getLocalRooms();
  const newRoom = normalizeRoom({
    id: Date.now(),
    name: data.name || data.roomName,
    capacity: Number(data.capacity) || 4,
    location: data.location || "Ground Floor",
    description: data.description || "",
    amenities: data.amenities || ["WiFi"],
    type: data.type || data.roomType || "Meeting Room",
    status: data.status || "Available",
    is_active: data.status !== "Maintenance",
  }, data);

  const updated = [newRoom, ...rooms];
  saveLocalRooms(updated);
  return newRoom;
}

export async function updateRoom(id, data) {
  try {
    const response = await api.patch(`/rooms/${id}`, data);
    if (response.data) {
      const normalized = normalizeRoom(response.data, data);
      const rooms = getLocalRooms().map((r) => (r.id === Number(id) ? normalized : r));
      saveLocalRooms(rooms);
      return normalized;
    }
  } catch (err) {
    console.warn(`Backend update room ${id} failed:`, err.message);
  }

  const rooms = getLocalRooms();
  let updatedRoom = null;
  const updated = rooms.map((r) => {
    if (r.id === Number(id)) {
      updatedRoom = normalizeRoom({ ...r, ...data }, data);
      return updatedRoom;
    }
    return r;
  });
  saveLocalRooms(updated);
  return updatedRoom;
}

export async function deleteRoom(id) {
  try {
    await api.delete(`/rooms/${id}`);
  } catch (err) {
    console.warn(`Backend delete room ${id} failed:`, err.message);
  }

  const rooms = getLocalRooms();
  const updated = rooms.filter((r) => r.id !== Number(id));
  saveLocalRooms(updated);
  return { success: true, id };
}
