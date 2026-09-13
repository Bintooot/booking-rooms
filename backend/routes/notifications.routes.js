import express from "express";
import {
  getNotificationsController,
  createNotificationController,
  toggleReadController,
  markAllReadController,
  deleteNotificationController,
} from "../controller/notifications.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotificationsController);
router.post("/", verifyToken, createNotificationController);
router.post("/:id/read", verifyToken, toggleReadController);
router.post("/read-all", verifyToken, markAllReadController);
router.delete("/:id", verifyToken, deleteNotificationController);

export default router;

