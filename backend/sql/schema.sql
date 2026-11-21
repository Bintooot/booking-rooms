CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  location VARCHAR(150),
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  type VARCHAR(50) DEFAULT 'Room',
  hourly_rate NUMERIC DEFAULT 0,
  price_per_night NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price_per_night NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  booker_name VARCHAR(100) NOT NULL,
  title VARCHAR(150) DEFAULT 'Reservation',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  notes TEXT DEFAULT '',
  attendees INT DEFAULT 2,
  contact_phone VARCHAR(50) DEFAULT '',
  total_price NUMERIC DEFAULT 0,
  special_requests TEXT DEFAULT '',
  check_in_time TIMESTAMPTZ DEFAULT NULL,
  check_out_time TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_range CHECK (end_time > start_time)
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT DEFAULT '';

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;

ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status = 'confirmed');

-- Security and Administrative Audit Logs
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

-- Notifications System
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

-- Per-user notification read tracking
CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id INT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

-- System Settings & Booking Policy Configuration (Single-row table)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  system_name VARCHAR(100) DEFAULT 'SpaceSync',
  system_tagline VARCHAR(255) DEFAULT 'Universal Room Reservation System',
  org_name VARCHAR(150) DEFAULT 'HIJO Resources Corporation',
  building_name VARCHAR(150) DEFAULT 'Main Facility',
  venue_type VARCHAR(50) DEFAULT 'general',
  currency_symbol VARCHAR(10) DEFAULT '$',
  pricing_enabled BOOLEAN DEFAULT false,
  favicon_url TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  contact_email VARCHAR(255) DEFAULT 'support@company.com',
  contact_phone VARCHAR(50) DEFAULT '+1 (555) 019-2834',
  support_url VARCHAR(255) DEFAULT '',
  max_booking_days INT DEFAULT 30,
  max_duration_hours INT DEFAULT 8,
  buffer_minutes INT DEFAULT 15,
  auto_release_minutes INT DEFAULT 15,
  email_reminders BOOLEAN DEFAULT true,
  conflict_strict BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS venue_type VARCHAR(50) DEFAULT 'general';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(10) DEFAULT '$';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS pricing_enabled BOOLEAN DEFAULT false;

-- Seed Default Settings
INSERT INTO system_settings (
  id, system_name, system_tagline, org_name, building_name, 
  venue_type, currency_symbol, pricing_enabled,
  favicon_url, logo_url, contact_email, contact_phone, support_url,
  max_booking_days, max_duration_hours, buffer_minutes, auto_release_minutes, 
  email_reminders, conflict_strict
)
VALUES (
  1, 'SpaceSync', 'Universal Room Reservation System', 'HIJO Resources Corporation', 'Main Facility',
  'general', '$', false,
  '', '', 'support@company.com', '+1 (555) 019-2834', '',
  30, 8, 15, 15, true, true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Administrator Account (password: password123)
-- All rooms, bookings, and additional users start empty for a clean slate
INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrator', 'admin@company.com', crypt('password123', gen_salt('bf', 10)), 'Administrator')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;