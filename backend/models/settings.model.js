import pool from "../config/db.js";

const DEFAULT_SETTINGS = {
  orgName: "HIJO Resources Corporation",
  buildingName: "Headquarters Building A",
  maxBookingDays: 30,
  maxDurationHours: 4,
  bufferMinutes: 15,
  autoReleaseMinutes: 15,
  emailReminders: true,
  conflictStrict: true,
};

function formatSettings(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    orgName: row.org_name || DEFAULT_SETTINGS.orgName,
    buildingName: row.building_name || DEFAULT_SETTINGS.buildingName,
    maxBookingDays: Number(row.max_booking_days) || DEFAULT_SETTINGS.maxBookingDays,
    maxDurationHours: Number(row.max_duration_hours) || DEFAULT_SETTINGS.maxDurationHours,
    bufferMinutes: Number(row.buffer_minutes) || DEFAULT_SETTINGS.bufferMinutes,
    autoReleaseMinutes: Number(row.auto_release_minutes) || DEFAULT_SETTINGS.autoReleaseMinutes,
    emailReminders: Boolean(row.email_reminders),
    conflictStrict: Boolean(row.conflict_strict),
    updatedAt: row.updated_at,
  };
}

export async function getSystemSettings() {
  const result = await pool.query("SELECT * FROM system_settings WHERE id = 1");
  if (result.rows.length === 0) {
    // Seed default if not yet existing
    const inserted = await pool.query(`
      INSERT INTO system_settings (id, org_name, building_name, max_booking_days, max_duration_hours, buffer_minutes, auto_release_minutes, email_reminders, conflict_strict)
      VALUES (1, 'HIJO Resources Corporation', 'Headquarters Building A', 30, 4, 15, 15, true, true)
      ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      RETURNING *
    `);
    return formatSettings(inserted.rows[0]);
  }
  return formatSettings(result.rows[0]);
}

export async function updateSystemSettings(newSettings) {
  const current = await getSystemSettings();
  const merged = { ...current, ...newSettings };

  const result = await pool.query(
    `INSERT INTO system_settings (
       id, org_name, building_name, max_booking_days, max_duration_hours, 
       buffer_minutes, auto_release_minutes, email_reminders, conflict_strict, updated_at
     )
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (id) DO UPDATE SET
       org_name = EXCLUDED.org_name,
       building_name = EXCLUDED.building_name,
       max_booking_days = EXCLUDED.max_booking_days,
       max_duration_hours = EXCLUDED.max_duration_hours,
       buffer_minutes = EXCLUDED.buffer_minutes,
       auto_release_minutes = EXCLUDED.auto_release_minutes,
       email_reminders = EXCLUDED.email_reminders,
       conflict_strict = EXCLUDED.conflict_strict,
       updated_at = NOW()
     RETURNING *`,
    [
      merged.orgName,
      merged.buildingName,
      Number(merged.maxBookingDays) || 30,
      Number(merged.maxDurationHours) || 4,
      Number(merged.bufferMinutes) || 15,
      Number(merged.autoReleaseMinutes) || 15,
      merged.emailReminders !== false,
      merged.conflictStrict !== false,
    ]
  );

  return formatSettings(result.rows[0]);
}

