import express from "express";
import pool from "../config/db.js";

import {
  getUsersController,
  getUserbyIdController,
  registerUserController,
  updateUserController, 
  deleteUserController
} from "../controller/users.controller.js";

const router = express.Router();

router.get("/", getUsersController);

router.get("/:id", getUserbyIdController);

router.post("/register", registerUserController);

router.patch("/:id", updateUserController);

router.delete("/:id", deleteUserController);

export default router;
