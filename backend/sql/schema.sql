CREATE EXTENSION IF NOT EXISTS btree_gist;

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
  type VARCHAR(50) DEFAULT 'Meeting Room',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  booker_name VARCHAR(100) NOT NULL,
  title VARCHAR(150) DEFAULT 'Meeting',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  notes TEXT DEFAULT '',
  attendees INT DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_range CHECK (end_time > start_time)
);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;

ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status = 'confirmed');

-- Seed Default Administrator (password: password123)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrator', 'admin@company.com', '$2b$10$7v5Z1n3T0Nn.W0oH2l/m4.1XyM7y9A3qR6hK4bW5cE2fJ8pL0mN9O', 'Administrator')
ON CONFLICT (email) DO NOTHING;

-- Seed Default Operational Rooms
INSERT INTO rooms (name, capacity, location, description, amenities, is_active, type)
VALUES 
  ('Conference Room A', 12, '2nd Floor, West Wing', 'Spacious conference room equipped for executive board meetings and hybrid presentations.', ARRAY['WiFi', 'Projector', 'Display', 'Video Conference', 'Whiteboard'], true, 'Conference Room'),
  ('Huddle Room 1', 6, '1st Floor, Tech Hub', 'Compact private room designed for fast team syncs and stand-ups.', ARRAY['WiFi', 'Display', 'Whiteboard'], true, 'Huddle Room'),
  ('The Boardroom', 20, '3rd Floor, Executive Suite', 'Flagship boardroom with high-end audio-visual equipment and panoramic city views.', ARRAY['WiFi', 'Projector', 'Display', 'Sound System', 'Video Conference'], true, 'Boardroom'),
  ('Meeting Room B', 8, '2nd Floor, East Wing', 'Mid-sized collaborative room currently scheduled for AV maintenance.', ARRAY['WiFi', 'Display'], false, 'Meeting Room'),
  ('Training Room', 30, '1st Floor, Learning Center', 'Large versatile training area with modular seating and dual presentation screens.', ARRAY['WiFi', 'Projector', 'Sound System', 'Air Conditioning'], true, 'Training Room'),
  ('Executive Room', 8, '3rd Floor, Executive Suite', 'Confidential interview and executive negotiation meeting space.', ARRAY['WiFi', 'Display', 'Coffee Machine'], true, 'Private Office')
ON CONFLICT DO NOTHING;