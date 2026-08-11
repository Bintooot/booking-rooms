import express from "express";
import pool from "../config/db.js";

import {
  getRoomsController,
  getRoomByIdController,
  createnewRoomController,
  updateRoomController, 
  deleteRoomController
} from "../controller/rooms.controller.js";

const router = express.Router();

router.get("/", getRoomsController);

router.get("/:id", getRoomByIdController);

router.post("/", createnewRoomController);

router.patch('/:id', updateRoomController);

router.delete('/:id', deleteRoomController);

export default router;
