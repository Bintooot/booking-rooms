import { api } from "./client.js";
import { INITIAL_ROOMS } from "./mockData.js";

function getLocalRooms() {
  const saved = localStorage.getItem("confe_rooms");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_ROOMS;
    }
  }
  localStorage.setItem("confe_rooms", JSON.stringify(INITIAL_ROOMS));
  return INITIAL_ROOMS;
}

function saveLocalRooms(rooms) {
  localStorage.setItem("confe_rooms", JSON.stringify(rooms));
}

export async function getRooms() {
  try {
    const response = await api.get("/rooms");
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      saveLocalRooms(response.data);
      return response.data;
    }
  } catch (err) {
    console.warn("Backend /rooms unavailable, using local store:", err.message);
  }
  return getLocalRooms();
}

export async function getRoomById(id) {
  try {
    const response = await api.get(`/rooms/${id}`);
    if (response.data) return response.data;
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
      const current = getLocalRooms();
      saveLocalRooms([response.data, ...current]);
      return response.data;
    }
  } catch (err) {
    console.warn("Backend create room failed, saving locally:", err.message);
  }

  // Local fallback
  const rooms = getLocalRooms();
  const newRoom = {
    id: Date.now(),
    name: data.name || data.roomName,
    capacity: Number(data.capacity) || 4,
    location: data.location || "Ground Floor",
    description: data.description || "",
    amenities: data.amenities || ["WiFi"],
    type: data.type || data.roomType || "Meeting Room",
    status: "Available",
    is_active: true,
    size: Number(data.capacity) > 15 ? "large" : Number(data.capacity) > 6 ? "medium" : "small",
  };
  const updated = [newRoom, ...rooms];
  saveLocalRooms(updated);
  return newRoom;
}

export async function updateRoom(id, data) {
  try {
    const response = await api.patch(`/rooms/${id}`, data);
    if (response.data) {
      const rooms = getLocalRooms().map((r) => (r.id === Number(id) ? { ...r, ...response.data } : r));
      saveLocalRooms(rooms);
      return response.data;
    }
  } catch (err) {
    console.warn(`Backend update room ${id} failed:`, err.message);
  }

  const rooms = getLocalRooms();
  let updatedRoom = null;
  const updated = rooms.map((r) => {
    if (r.id === Number(id)) {
      updatedRoom = { ...r, ...data };
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

