import express from "express";
import {
  getAuditLogsController,
  createAuditLogController,
  clearAuditLogsController,
} from "../controller/audit.controller.js";
import { verifyToken, requireRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getAuditLogsController);
router.post("/", verifyToken, createAuditLogController);
router.delete("/", verifyToken, requireRoles("Administrator"), clearAuditLogsController);

export default router;

