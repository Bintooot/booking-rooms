import express from "express";
import {
  getBookingsController,
  getBookingByIdController,
  createBookingController,
  updateBookingStatusController,
} from "../controller/bookings.controller.js";

const router = express.Router();

router.get("/", getBookingsController);

router.get("/:id", getBookingByIdController);

router.post("/", createBookingController);

router.patch("/:id", updateBookingStatusController);

export default router;
