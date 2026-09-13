import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../models/bookings.model.js";

export const getBookingsController = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error getting bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookingByIdController = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error(`Error getting booking ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createBookingController = async (req, res) => {
  try {
    const {
      room_id,
      booker_name,
      user_name,
      title,
      date,
      start_time,
      end_time,
      status,
      notes,
      attendees,
    } = req.body;

    if (!room_id || !start_time || !end_time) {
      return res.status(400).json({ error: "room_id, start_time, and end_time are required" });
    }

    // Format start and end timestamp if date is passed separately
    let formattedStart = start_time;
    let formattedEnd = end_time;

    if (date && typeof start_time === "string" && !start_time.includes("T")) {
      formattedStart = `${date}T${start_time.length === 5 ? start_time + ":00" : start_time}`;
    }
    if (date && typeof end_time === "string" && !end_time.includes("T")) {
      formattedEnd = `${date}T${end_time.length === 5 ? end_time + ":00" : end_time}`;
    }

    const userId = req.user?.id || req.body.user_id || null;
    const authorName = booker_name || user_name || req.user?.name || "Team Member";

    const newBooking = await createBooking({
      room_id,
      user_id: userId,
      booker_name: authorName,
      title: title || "Meeting",
      start_time: formattedStart,
      end_time: formattedEnd,
      status: status || "confirmed",
      notes: notes || "",
      attendees: attendees || 2,
    });

    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);

    // Postgres code 23P01 is exclusion_violation (overlapping booking constraint)
    if (error.code === "23P01") {
      return res.status(409).json({
        error: "This room is already reserved for the selected time slot. Please choose another time or room.",
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        error: "End time must be after start time.",
      });
    }

    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const updateBookingController = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updatedBooking = await updateBooking(bookingId, req.body);

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(`Error updating booking ${req.params.id}:`, error);

    if (error.code === "23P01") {
      return res.status(409).json({
        error: "This room is already reserved for the selected time slot.",
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateBookingStatusController = updateBookingController;

export const deleteBookingController = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const deletedBooking = await deleteBooking(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully", id: Number(bookingId), booking: deletedBooking });
  } catch (error) {
    console.error(`Error deleting booking ${req.params.id}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
