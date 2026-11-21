import pool from "../config/db.js";

const DEFAULT_SETTINGS = {
  systemName: "SpaceSync",
  systemTagline: "Universal Room Reservation System",
  orgName: "HIJO Resources Corporation",
  buildingName: "Main Facility",
  venueType: "general", // 'general', 'ktv', 'hotel', 'corporate', 'studio'
  currencySymbol: "$",
  pricingEnabled: false,
  faviconUrl: "",
  logoUrl: "",
  contactEmail: "support@company.com",
  contactPhone: "+1 (555) 019-2834",
  supportUrl: "",
  maxBookingDays: 30,
  maxDurationHours: 8,
  bufferMinutes: 15,
  autoReleaseMinutes: 15,
  emailReminders: true,
  conflictStrict: true,
};

function formatSettings(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    systemName: row.system_name || DEFAULT_SETTINGS.systemName,
    systemTagline: row.system_tagline || DEFAULT_SETTINGS.systemTagline,
    orgName: row.org_name || DEFAULT_SETTINGS.orgName,
    buildingName: row.building_name || DEFAULT_SETTINGS.buildingName,
    venueType: row.venue_type || DEFAULT_SETTINGS.venueType,
    currencySymbol: row.currency_symbol || DEFAULT_SETTINGS.currencySymbol,
    pricingEnabled: Boolean(row.pricing_enabled),
    faviconUrl: row.favicon_url || "",
    logoUrl: row.logo_url || "",
    contactEmail: row.contact_email || DEFAULT_SETTINGS.contactEmail,
    contactPhone: row.contact_phone || DEFAULT_SETTINGS.contactPhone,
    supportUrl: row.support_url || "",
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
       id, system_name, system_tagline, org_name, building_name, 
       venue_type, currency_symbol, pricing_enabled,
       favicon_url, logo_url, contact_email, contact_phone, support_url,
       max_booking_days, max_duration_hours, buffer_minutes, auto_release_minutes, 
       email_reminders, conflict_strict, updated_at
     )
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
     ON CONFLICT (id) DO UPDATE SET
       system_name = EXCLUDED.system_name,
       system_tagline = EXCLUDED.system_tagline,
       org_name = EXCLUDED.org_name,
       building_name = EXCLUDED.building_name,
       venue_type = EXCLUDED.venue_type,
       currency_symbol = EXCLUDED.currency_symbol,
       pricing_enabled = EXCLUDED.pricing_enabled,
       favicon_url = EXCLUDED.favicon_url,
       logo_url = EXCLUDED.logo_url,
       contact_email = EXCLUDED.contact_email,
       contact_phone = EXCLUDED.contact_phone,
       support_url = EXCLUDED.support_url,
       max_booking_days = EXCLUDED.max_booking_days,
       max_duration_hours = EXCLUDED.max_duration_hours,
       buffer_minutes = EXCLUDED.buffer_minutes,
       auto_release_minutes = EXCLUDED.auto_release_minutes,
       email_reminders = EXCLUDED.email_reminders,
       conflict_strict = EXCLUDED.conflict_strict,
       updated_at = NOW()
     RETURNING *`,
    [
      merged.systemName || "SpaceSync",
      merged.systemTagline || "Universal Room Reservation System",
      merged.orgName || "HIJO Resources Corporation",
      merged.buildingName || "Main Facility",
      merged.venueType || "general",
      merged.currencySymbol || "$",
      Boolean(merged.pricingEnabled),
      merged.faviconUrl || "",
      merged.logoUrl || "",
      merged.contactEmail || "",
      merged.contactPhone || "",
      merged.supportUrl || "",
      Number(merged.maxBookingDays) || 30,
      Number(merged.maxDurationHours) || 8,
      Number(merged.bufferMinutes) || 15,
      Number(merged.autoReleaseMinutes) || 15,
      merged.emailReminders !== false,
      merged.conflictStrict !== false,
    ]
  );

  return formatSettings(result.rows[0]);
}

