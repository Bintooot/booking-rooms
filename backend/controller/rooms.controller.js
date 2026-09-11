import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../models/rooms.model.js";

export const getRoomsController = async (req, res) => {
  try {
    const activeOnly = req.query.active_only === "true";
    const rooms = await getAllRooms(activeOnly);
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRoomByIdController = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    console.error(`Error fetching room ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createnewRoomController = async (req, res) => {
  try {
    const { name, capacity, location, description, amenities, is_active, type } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: "name and capacity are required" });
    }

    const newRoom = await createRoom({
      name,
      capacity: Number(capacity),
      location,
      description,
      amenities,
      is_active,
      type,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateRoomController = async (req, res) => {
  try {
    const roomId = req.params.id;
    const updatedRoom = await updateRoom(roomId, req.body);

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(updatedRoom);
  } catch (error) {
    console.error(`Error updating room ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteRoomController = async (req, res) => {
  try {
    const roomId = req.params.id;
    const deletedRoom = await deleteRoom(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({ message: "Room deleted successfully", id: Number(roomId), room: deletedRoom });
  } catch (error) {
    console.error(`Error deleting room ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
