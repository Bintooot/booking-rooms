/**
 * Settings Service
 * Standardized service for managing organization policies and booking constraints.
 */

const SETTINGS_STORAGE_KEY = "confe_settings";
export const SETTINGS_UPDATED_EVENT = "confe_settings_updated";

export const DEFAULT_SETTINGS = Object.freeze({
  orgName: "HIJO Resources Corporation",
  buildingName: "Headquarters Building A",
  maxBookingDays: 30, // maximum days in advance allowed
  maxDurationHours: 4, // maximum duration for a single reservation
  bufferMinutes: 15, // buffer between back-to-back meetings
  autoReleaseMinutes: 15, // no-show auto release
  emailReminders: true,
  conflictStrict: true, // if true, strictly block overlapping reservations
});

/**
 * Retrieve current settings, falling back to defaults.
 */
export function getSettings() {
  const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!saved) return { ...DEFAULT_SETTINGS };

  try {
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      maxBookingDays: Number(parsed.maxBookingDays) || DEFAULT_SETTINGS.maxBookingDays,
      maxDurationHours: Number(parsed.maxDurationHours) || DEFAULT_SETTINGS.maxDurationHours,
      bufferMinutes: Number(parsed.bufferMinutes) || DEFAULT_SETTINGS.bufferMinutes,
    };
  } catch (err) {
    console.error("Failed to parse settings from storage:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Persist updated settings and broadcast the update event.
 */
export function saveSettings(newSettings) {
  const normalized = {
    ...DEFAULT_SETTINGS,
    ...newSettings,
    maxBookingDays: Number(newSettings.maxBookingDays) || DEFAULT_SETTINGS.maxBookingDays,
    maxDurationHours: Number(newSettings.maxDurationHours) || DEFAULT_SETTINGS.maxDurationHours,
    bufferMinutes: Number(newSettings.bufferMinutes) || DEFAULT_SETTINGS.bufferMinutes,
  };

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: normalized }));
  return normalized;
}

/**
 * Parse standard HH:MM time string to total minutes from midnight.
 */
export function timeStringToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Validate a reservation against current organizational policies.
 * 
 * @param {Object} bookingData - { date: 'YYYY-MM-DD', start_time: 'HH:MM', end_time: 'HH:MM', room_id }
 * @param {Array} existingBookings - Current bookings list
 * @param {Object} [customSettings] - Optional settings override
 * @returns {{ isValid: boolean, error?: string, isWarning?: boolean, conflictBooking?: object }}
 */
export function validateBookingAgainstPolicy(bookingData, existingBookings = [], customSettings = null) {
  const settings = customSettings || getSettings();

  if (!bookingData.date) {
    return { isValid: false, error: "Booking date is required." };
  }

  // 1. Validate advance booking window
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingDate = new Date(bookingData.date);
  bookingDate.setHours(0, 0, 0, 0);

  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { isValid: false, error: "Cannot schedule reservations in the past." };
  }

  if (diffDays > settings.maxBookingDays) {
    return {
      isValid: false,
      error: `Reservations cannot be booked more than ${settings.maxBookingDays} days in advance (selected date is ${diffDays} days away).`,
    };
  }

  // 2. Validate start and end time ordering
  const startMinutes = timeStringToMinutes(bookingData.start_time);
  const endMinutes = timeStringToMinutes(bookingData.end_time);

  if (startMinutes >= endMinutes) {
    return { isValid: false, error: "End time must be later than start time." };
  }

  // 3. Validate maximum duration
  const durationHours = (endMinutes - startMinutes) / 60;
  if (durationHours > settings.maxDurationHours) {
    return {
      isValid: false,
      error: `Meeting duration (${durationHours} hrs) exceeds the maximum allowed policy of ${settings.maxDurationHours} hours.`,
    };
  }

  // 4. Validate room schedule conflicts & buffer
  const cleanDate = bookingData.date;
  const roomId = String(bookingData.room_id);

  const conflict = existingBookings.find((b) => {
    if (b.status === "cancelled") return false;
    if (String(b.id) === String(bookingData.id)) return false; // Ignore self when updating

    const bDate = b.date || (typeof b.start_time === "string" && b.start_time.includes("T") ? b.start_time.split("T")[0] : null);
    if (bDate !== cleanDate) return false;
    if (String(b.room_id) !== roomId) return false;

    const bStartRaw = typeof b.start_time === "string" && b.start_time.includes("T") ? b.start_time.split("T")[1].slice(0, 5) : b.start_time;
    const bEndRaw = typeof b.end_time === "string" && b.end_time.includes("T") ? b.end_time.split("T")[1].slice(0, 5) : b.end_time;

    const bStart = timeStringToMinutes(bStartRaw);
    const bEnd = timeStringToMinutes(bEndRaw);

    // Conflict exists if time ranges overlap
    return (
      (startMinutes >= bStart && startMinutes < bEnd) ||
      (endMinutes > bStart && endMinutes <= bEnd) ||
      (startMinutes <= bStart && endMinutes >= bEnd)
    );
  });

  if (conflict) {
    if (settings.conflictStrict) {
      return {
        isValid: false,
        error: `Schedule Conflict: Room is already booked for "${conflict.title || 'Reserved'}" from ${conflict.start_time} to ${conflict.end_time}. Strict conflict prohibition is enabled.`,
        conflictBooking: conflict,
      };
    } else {
      return {
        isValid: true,
        isWarning: true,
        error: `Conflict detected with existing booking "${conflict.title || 'Reserved'}" (${conflict.start_time} - ${conflict.end_time}).`,
        conflictBooking: conflict,
      };
    }
  }

  return { isValid: true };
}

