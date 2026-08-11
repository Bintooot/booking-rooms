import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
} from "../models/bookings.model.js";

export const getBookingsController = async (req, res) => {
  try {
    const bookings = await getAllBookings();
    if (bookings.length === 0) {
      return res.status(404).json({ error: "No bookings found." });
    }
    res.json(bookings);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createBookingController = async (req, res) => {
  try {
    const { user_id, room_id, start_time, end_time, status } = req.body;
    const newBooking = await createBooking({
      user_id,
      room_id,
      start_time,
      end_time,
      status,
    });
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateBookingStatusController = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { start_time, end_time, status } = req.body;

   

    const updatedBooking = await updateBookingStatus(bookingId, {
      start_time,
      end_time,
      status,
    });

     if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
