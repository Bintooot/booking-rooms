import express from "express";
import {
  getRoomsController,
  getRoomByIdController,
  createnewRoomController,
  updateRoomController, 
  deleteRoomController
} from "../controller/rooms.controller.js";
import { verifyToken, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getRoomsController);
router.get("/:id", verifyToken, getRoomByIdController);
router.post("/", verifyToken, requireRoles("Administrator"), createnewRoomController);
router.patch("/:id", verifyToken, requireRoles("Administrator", "Manager"), updateRoomController);
router.delete("/:id", verifyToken, requireRoles("Administrator"), deleteRoomController);

export default router;
