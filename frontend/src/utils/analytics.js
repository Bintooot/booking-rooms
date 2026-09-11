/**
 * Analytics Utility
 * Standardized statistical calculations and date range filtering for reports.
 */

/**
 * Parses time string (HH:MM or ISO) and calculates duration in fractional hours.
 */
export function calculateDurationHours(startTime, endTime) {
  if (!startTime || !endTime) return 1.0;

  // Extract HH:MM
  const parseTime = (t) => {
    if (typeof t === "string" && t.includes("T")) {
      const d = new Date(t);
      return d.getHours() * 60 + d.getMinutes();
    }
    if (typeof t === "string" && t.includes(":")) {
      const [h, m] = t.split(":");
      return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
    }
    return 0;
  };

  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);

  if (endMinutes <= startMinutes) return 1.0;
  return Number(((endMinutes - startMinutes) / 60).toFixed(1));
}

/**
 * Filter bookings based on a calendar time range.
 * 
 * @param {Array} bookings 
 * @param {'This Week'|'This Month'|'This Quarter'|'All Time'} range 
 */
export function filterBookingsByRange(bookings, range) {
  if (!Array.isArray(bookings)) return [];
  if (range === "All Time") return bookings;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return bookings.filter((b) => {
    const rawDateStr = b.date || (typeof b.start_time === "string" ? b.start_time.split("T")[0] : null);
    if (!rawDateStr) return true;

    const [y, m, d] = rawDateStr.split("-").map(Number);
    const bookingDate = new Date(y, m - 1, d);

    if (range === "This Week") {
      const dayOfWeek = today.getDay(); // 0 is Sunday
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    }

    if (range === "This Month") {
      return (
        bookingDate.getFullYear() === now.getFullYear() &&
        bookingDate.getMonth() === now.getMonth()
      );
    }

    if (range === "This Quarter") {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const bookingQuarter = Math.floor(bookingDate.getMonth() / 3);
      return (
        bookingDate.getFullYear() === now.getFullYear() &&
        currentQuarter === bookingQuarter
      );
    }

    return true;
  });
}

/**
 * Computes peak booking hour and most frequent days of the week.
 */
export function computeDemandMetrics(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return {
      peakHour: "10:00 AM",
      peakDays: "Tuesday - Thursday",
    };
  }

  const hourCounts = {};
  const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  bookings.forEach((b) => {
    let hour = 10;
    if (typeof b.start_time === "string") {
      if (b.start_time.includes("T")) {
        hour = new Date(b.start_time).getHours();
      } else if (b.start_time.includes(":")) {
        hour = parseInt(b.start_time.split(":")[0], 10) || 10;
      }
    }
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    const rawDateStr = b.date || (typeof b.start_time === "string" ? b.start_time.split("T")[0] : null);
    if (rawDateStr) {
      const d = new Date(rawDateStr);
      if (!isNaN(d.getTime())) {
        dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + 1;
      }
    }
  });

  // Find peak hour
  let maxHour = 10;
  let maxCount = 0;
  for (const [h, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxHour = Number(h);
    }
  }

  const period = maxHour >= 12 ? "PM" : "AM";
  const displayHour = maxHour % 12 === 0 ? 12 : maxHour % 12;
  const peakHourStr = `${String(displayHour).padStart(2, "0")}:00 ${period}`;

  // Find top days
  const sortedDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)
    .map(([dayIndex]) => dayNames[Number(dayIndex)]);

  const peakDaysStr =
    sortedDays.length >= 2
      ? `${sortedDays[0]} & ${sortedDays[1]}`
      : sortedDays[0] || "Tuesday - Thursday";

  return {
    peakHour: peakHourStr,
    peakDays: peakDaysStr,
  };
}

