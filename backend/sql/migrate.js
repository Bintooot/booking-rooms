import pool from "../config/db.js";

async function runMigration() {
  console.log("Starting database migration...");

  try {
    // 1. Ensure required columns in rooms table
    await pool.query(`
      ALTER TABLE rooms ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Meeting Room';
    `);
    console.log("Verified rooms table schema.");

    // 2. Ensure required columns in bookings table
    await pool.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS title VARCHAR(150) DEFAULT 'Meeting';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 2;
    `);
    console.log("Verified bookings table schema.");

    console.log("Database schema verified. No mock data will be seeded.");
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
