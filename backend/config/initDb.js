import pool from "./db.js";

/**
 * Idempotent Database Initialization & Migration
 * Ensures all required enterprise tables and relational columns exist in PostgreSQL.
 */
export async function initDb() {
  try {
    console.log("[DB] Verifying database schema and running migrations...");

    // 1. Ensure user_id, check_in_time, check_out_time columns on bookings
    await pool.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ DEFAULT NULL;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ DEFAULT NULL;
    `);

    // 2. Ensure audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        actor VARCHAR(150) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target VARCHAR(255),
        type VARCHAR(50) DEFAULT 'system',
        ip VARCHAR(45) DEFAULT '127.0.0.1',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Ensure notifications & notification_reads tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'booking',
        target_roles TEXT[] DEFAULT '{"*"}',
        target_user_id INT REFERENCES users(id) ON DELETE CASCADE,
        target_email VARCHAR(255),
        created_by INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notification_reads (
        notification_id INT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (notification_id, user_id)
      );
    `);

    // 4. Ensure system_settings table & default configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY DEFAULT 1,
        org_name VARCHAR(150) DEFAULT 'HIJO Resources Corporation',
        building_name VARCHAR(150) DEFAULT 'Headquarters Building A',
        max_booking_days INT DEFAULT 30,
        max_duration_hours INT DEFAULT 4,
        buffer_minutes INT DEFAULT 15,
        auto_release_minutes INT DEFAULT 15,
        email_reminders BOOLEAN DEFAULT true,
        conflict_strict BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT single_row_check CHECK (id = 1)
      );

      INSERT INTO system_settings (id, org_name, building_name, max_booking_days, max_duration_hours, buffer_minutes, auto_release_minutes, email_reminders, conflict_strict)
      VALUES (1, 'HIJO Resources Corporation', 'Headquarters Building A', 30, 4, 15, 15, true, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("[DB] Database schema and tables verified successfully.");
  } catch (err) {
    console.error("[DB] Migration warning:", err.message);
  }
}

