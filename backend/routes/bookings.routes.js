import express from "express";
import {
  getBookingsController,
  getBookingByIdController,
  createBookingController,
  updateBookingController,
  deleteBookingController,
} from "../controller/bookings.controller.js";

const router = express.Router();

router.get("/", getBookingsController);
router.get("/:id", getBookingByIdController);
router.post("/", createBookingController);
router.patch("/:id", updateBookingController);
router.delete("/:id", deleteBookingController);

export default router;
