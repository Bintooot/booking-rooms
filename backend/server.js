import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import roomRoutes from "./routes/rooms.routes.js";
import userRoutes from "./routes/users.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
