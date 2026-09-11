import express from "express";
import {
  getBookingsController,
  getBookingByIdController,
  createBookingController,
  updateBookingController,
  deleteBookingController,
} from "../controller/bookings.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getBookingsController);
router.get("/:id", verifyToken, getBookingByIdController);
router.post("/", verifyToken, createBookingController);
router.patch("/:id", verifyToken, updateBookingController);
router.delete("/:id", verifyToken, deleteBookingController);

export default router;
