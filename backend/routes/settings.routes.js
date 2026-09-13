import express from "express";
import {
  getSettingsController,
  updateSettingsController,
} from "../controller/settings.controller.js";
import { verifyToken, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getSettingsController);
router.put("/", verifyToken, requireRoles("Administrator", "Manager"), updateSettingsController);

export default router;

