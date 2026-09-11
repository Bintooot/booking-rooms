import express from "express";
import {
  getUsersController,
  getUserbyIdController,
  registerUserController,
  loginUserController,
  updateUserController,
  deleteUserController,
} from "../controller/users.controller.js";
import { verifyToken, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public auth routes
router.post("/login", loginUserController);

// Protected routes
router.get("/", verifyToken, getUsersController);
router.get("/:id", verifyToken, getUserbyIdController);
router.post("/register", verifyToken, requireRoles("Administrator"), registerUserController);
router.patch("/:id", verifyToken, requireRoles("Administrator"), updateUserController);
router.delete("/:id", verifyToken, requireRoles("Administrator"), deleteUserController);

export default router;
