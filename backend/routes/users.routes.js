import express from "express";
import {
  getUsersController,
  getUserbyIdController,
  registerUserController,
  loginUserController,
  updateUserController,
  deleteUserController,
} from "../controller/users.controller.js";

const router = express.Router();

router.get("/", getUsersController);
router.get("/:id", getUserbyIdController);
router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.patch("/:id", updateUserController);
router.delete("/:id", deleteUserController);

export default router;
