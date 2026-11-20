import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const isSSLRequired = Boolean(
  process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes("neon.tech") ||
      process.env.DATABASE_URL.includes("sslmode=require") ||
      process.env.NODE_ENV === "production")
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSSLRequired ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
    console.log("Connected to the database");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
});

export default pool;