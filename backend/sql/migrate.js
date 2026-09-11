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

    // 3. Check if rooms table needs initial seed data
    const roomCountRes = await pool.query("SELECT COUNT(*) FROM rooms");
    const count = parseInt(roomCountRes.rows[0].count, 10);

    if (count === 0) {
      console.log("Rooms table is empty. Seeding initial rooms...");
      const initialRooms = [
        {
          name: "Conference Room A",
          capacity: 12,
          location: "2nd Floor, West Wing",
          description: "Spacious conference room equipped for executive board meetings and hybrid presentations.",
          amenities: ["WiFi", "Projector", "Display", "Video Conference", "Whiteboard"],
          is_active: true,
          type: "Conference Room",
        },
        {
          name: "Huddle Room 1",
          capacity: 6,
          location: "1st Floor, Tech Hub",
          description: "Compact private room designed for fast team syncs and stand-ups.",
          amenities: ["WiFi", "Display", "Whiteboard"],
          is_active: true,
          type: "Huddle Room",
        },
        {
          name: "The Boardroom",
          capacity: 20,
          location: "3rd Floor, Executive Suite",
          description: "Flagship boardroom with high-end audio-visual equipment and panoramic city views.",
          amenities: ["WiFi", "Projector", "Display", "Sound System", "Video Conference"],
          is_active: true,
          type: "Boardroom",
        },
        {
          name: "Meeting Room B",
          capacity: 8,
          location: "2nd Floor, East Wing",
          description: "Mid-sized collaborative room currently scheduled for AV maintenance.",
          amenities: ["WiFi", "Display"],
          is_active: false,
          type: "Meeting Room",
        },
        {
          name: "Training Room",
          capacity: 30,
          location: "1st Floor, Learning Center",
          description: "Large versatile training area with modular seating and dual presentation screens.",
          amenities: ["WiFi", "Projector", "Sound System", "Air Conditioning"],
          is_active: true,
          type: "Training Room",
        },
        {
          name: "Executive Room",
          capacity: 8,
          location: "3rd Floor, Executive Suite",
          description: "Confidential interview and executive negotiation meeting space.",
          amenities: ["WiFi", "Display", "Coffee Machine"],
          is_active: true,
          type: "Private Office",
        },
      ];

      for (const room of initialRooms) {
        await pool.query(
          `INSERT INTO rooms (name, capacity, location, description, amenities, is_active, type)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            room.name,
            room.capacity,
            room.location,
            room.description,
            room.amenities,
            room.is_active,
            room.type,
          ]
        );
      }
      console.log(`Seeded ${initialRooms.length} initial rooms.`);
    } else {
      console.log(`Rooms table already has ${count} records.`);
    }

    // 4. Check if bookings table needs initial seed data
    const bookingCountRes = await pool.query("SELECT COUNT(*) FROM bookings");
    const bCount = parseInt(bookingCountRes.rows[0].count, 10);

    if (bCount === 0) {
      console.log("Bookings table is empty. Seeding initial bookings...");
      const roomsRes = await pool.query("SELECT id, name FROM rooms ORDER BY id ASC LIMIT 3");
      const rList = roomsRes.rows;

      if (rList.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

        const initialBookings = [
          {
            room_id: rList[0].id,
            booker_name: "Ben Aniasco",
            title: "Quarterly Strategy Review",
            start_time: `${today}T09:00:00Z`,
            end_time: `${today}T10:30:00Z`,
            attendees: 10,
            notes: "Hybrid video conference and presentation",
            status: "confirmed",
          },
          {
            room_id: rList[1] ? rList[1].id : rList[0].id,
            booker_name: "Jorge Villanueva",
            title: "Design Sprint Check-in",
            start_time: `${today}T13:00:00Z`,
            end_time: `${today}T14:00:00Z`,
            attendees: 4,
            notes: "Daily standup & backlog refinement",
            status: "confirmed",
          },
          {
            room_id: rList[0].id,
            booker_name: "Kent Cyril",
            title: "Executive Board Session",
            start_time: `${tomorrow}T14:00:00Z`,
            end_time: `${tomorrow}T15:30:00Z`,
            attendees: 12,
            notes: "Executive presentation deck",
            status: "confirmed",
          },
        ];

        for (const b of initialBookings) {
          await pool.query(
            `INSERT INTO bookings (room_id, booker_name, title, start_time, end_time, attendees, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [b.room_id, b.booker_name, b.title, b.start_time, b.end_time, b.attendees, b.notes, b.status]
          );
        }
        console.log(`Seeded ${initialBookings.length} initial bookings.`);
      }
    } else {
      console.log(`Bookings table already has ${bCount} records.`);
    }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
