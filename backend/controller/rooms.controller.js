import {
  getAllActiveRoom,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../models/rooms.model.js";

export const getRoomsController = async (req, res) => {
  try {
    const rooms = await getAllActiveRoom();
    if (rooms.length === 0) {
      return res.status(404).json({ error: "No rooms found." });
    }
    res.json(rooms);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createnewRoomController = async (req, res) => {
  try {
    const { name, capacity, location, description, amenities } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: "name and capacity are required" });
    }

    const newRoom = await createRoom({
      name,
      capacity,
      location,
      description,
      amenities,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateRoomController = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { name, capacity, location, description, amenities } = req.body;

    const updatedRoom = await updateRoom(roomId, {
      name,
      capacity,
      location,
      description,
      amenities,
    });

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(updatedRoom);
  } catch (error) {
    console.error(error);
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
    res.json({message: "Room deleted successfully", room: deletedRoom});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
