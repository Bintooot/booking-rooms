import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import { initDb } from "./config/initDb.js";
import roomRoutes from "./routes/rooms.routes.js";
import userRoutes from "./routes/users.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import settingRoutes from "./routes/settings.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      // Allow any localhost / 127.0.0.1 port (5173, 5174, 80, 3000, etc.)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      database: "connected",
      db_time: dbRes.rows[0].now,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: err.message,
    });
  }
});

// API routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Run idempotent database migrations
  await initDb();
});

export default app;
