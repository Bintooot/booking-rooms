import {
  getAllAuditLogs,
  createAuditLog,
  clearAllAuditLogs,
} from "../models/audit.model.js";

export const getAuditLogsController = async (req, res) => {
  try {
    const { limit, type, search } = req.query;
    const logs = await getAllAuditLogs({
      limit: limit ? Number(limit) : 200,
      type: type || "all",
      search: search || "",
    });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createAuditLogController = async (req, res) => {
  try {
    const { action, actor, target, type, ip, user_id } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Action is required." });
    }

    const clientIp = ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
    const author = actor || req.user?.name || "System";
    const userId = user_id || req.user?.id || null;

    const newLog = await createAuditLog({
      user_id: userId,
      actor: author,
      action,
      target: target || "N/A",
      type: type || "system",
      ip: clientIp.toString().replace(/^.*:/, "") || "127.0.0.1",
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error("Error creating audit log:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const clearAuditLogsController = async (req, res) => {
  try {
    await clearAllAuditLogs();
    res.json({ message: "Audit logs cleared successfully." });
  } catch (error) {
    console.error("Error clearing audit logs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

