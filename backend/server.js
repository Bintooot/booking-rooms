import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import roomRoutes from "./routes/rooms.routes.js";
import userRoutes from "./routes/users.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
