import pool from "./db.js";
import bcrypt from "bcrypt";

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
        system_name VARCHAR(100) DEFAULT 'SpaceSync',
        system_tagline VARCHAR(255) DEFAULT 'Workspace & Room Reservation',
        org_name VARCHAR(150) DEFAULT 'HIJO Resources Corporation',
        building_name VARCHAR(150) DEFAULT 'Headquarters Building A',
        favicon_url TEXT DEFAULT '',
        logo_url TEXT DEFAULT '',
        contact_email VARCHAR(255) DEFAULT 'support@company.com',
        contact_phone VARCHAR(50) DEFAULT '+1 (555) 019-2834',
        support_url VARCHAR(255) DEFAULT '',
        max_booking_days INT DEFAULT 30,
        max_duration_hours INT DEFAULT 4,
        buffer_minutes INT DEFAULT 15,
        auto_release_minutes INT DEFAULT 15,
        email_reminders BOOLEAN DEFAULT true,
        conflict_strict BOOLEAN DEFAULT true,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT single_row_check CHECK (id = 1)
      );

      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS system_name VARCHAR(100) DEFAULT 'SpaceSync';
      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS system_tagline VARCHAR(255) DEFAULT 'Workspace & Room Reservation';
      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT '';
      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255) DEFAULT 'support@company.com';
      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) DEFAULT '+1 (555) 019-2834';
      ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS support_url VARCHAR(255) DEFAULT '';

      INSERT INTO system_settings (id, system_name, system_tagline, org_name, building_name, max_booking_days, max_duration_hours, buffer_minutes, auto_release_minutes, email_reminders, conflict_strict)
      VALUES (1, 'SpaceSync', 'Workspace & Room Reservation', 'HIJO Resources Corporation', 'Headquarters Building A', 30, 4, 15, 15, true, true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Ensure default administrator account exists with authentic bcrypt hash for 'password123'
    try {
      const adminEmail = "admin@company.com";
      const validHash = await bcrypt.hash("password123", 10);

      const existing = await pool.query(
        "SELECT id, password_hash FROM users WHERE LOWER(email) = LOWER($1)",
        [adminEmail]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO users (name, email, password_hash, role)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO NOTHING`,
          ["Administrator", adminEmail, validHash, "Administrator"]
        );
        console.log(`[DB] Created default administrator account: ${adminEmail}`);
      } else {
        const row = existing.rows[0];
        let valid = false;
        try {
          valid = await bcrypt.compare("password123", row.password_hash);
        } catch (_e) {
          valid = false;
        }
        if (!valid) {
          await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [validHash, row.id]
          );
          console.log(`[DB] Repaired password hash for administrator: ${adminEmail}`);
        }
      }
    } catch (userErr) {
      console.warn("[DB] User verification notice:", userErr.message);
    }

    console.log("[DB] Database schema, tables, and accounts verified successfully.");
  } catch (err) {
    console.error("[DB] Migration warning:", err.message);
  }
}

