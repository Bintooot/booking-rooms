/**
 * Overtime & Meeting Lifecycle Utility
 * Tracks real-time room occupancy, check-in/check-out states, and overtime durations.
 */

/**
 * Parses booking into standard start and end Date objects.
 */
export function parseBookingTimestamps(booking) {
  if (!booking) return { startDate: new Date(), endDate: new Date() };

  let startDate = null;
  let endDate = null;

  // 1. Check raw ISO timestamps first
  if (booking.raw_start_time && typeof booking.raw_start_time === "string") {
    const d = new Date(booking.raw_start_time);
    if (!isNaN(d.getTime())) startDate = d;
  }
  if (booking.raw_end_time && typeof booking.raw_end_time === "string") {
    const d = new Date(booking.raw_end_time);
    if (!isNaN(d.getTime())) endDate = d;
  }

  // 2. Parse from date + start_time / end_time if not already resolved
  const dateStr = booking.date || new Date().toISOString().split("T")[0];

  if (!startDate && booking.start_time) {
    if (typeof booking.start_time === "string" && booking.start_time.includes("T")) {
      startDate = new Date(booking.start_time);
    } else {
      const timePart = booking.start_time.length === 5 ? `${booking.start_time}:00` : booking.start_time;
      startDate = new Date(`${dateStr}T${timePart}`);
    }
  }

  if (!endDate && booking.end_time) {
    if (typeof booking.end_time === "string" && booking.end_time.includes("T")) {
      endDate = new Date(booking.end_time);
    } else {
      const timePart = booking.end_time.length === 5 ? `${booking.end_time}:00` : booking.end_time;
      endDate = new Date(`${dateStr}T${timePart}`);
    }
  }

  // Fallbacks if parsing produced invalid dates
  if (!startDate || isNaN(startDate.getTime())) startDate = new Date();
  if (!endDate || isNaN(endDate.getTime())) endDate = new Date(startDate.getTime() + 3600000);

  return { startDate, endDate };
}

/**
 * Evaluates the real-time timing status of a booking.
 */
export function getBookingTimingState(booking, currentTime = new Date()) {
  if (!booking) {
    return {
      state: "unknown",
      label: "Unknown",
      overtimeMinutes: 0,
      overtimeHours: 0,
      scheduledHours: 1.0,
      actualHours: 1.0,
      isLiveOvertime: false,
    };
  }

  if (booking.status === "cancelled") {
    return {
      state: "cancelled",
      label: "Cancelled",
      overtimeMinutes: 0,
      overtimeHours: 0,
      scheduledHours: 0,
      actualHours: 0,
      isLiveOvertime: false,
    };
  }

  const { startDate, endDate } = parseBookingTimestamps(booking);
  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);

  const scheduledMillis = Math.max(0, endDate.getTime() - startDate.getTime());
  const scheduledHours = Number((scheduledMillis / 3600000).toFixed(1));

  const checkInDate = booking.check_in_time ? new Date(booking.check_in_time) : null;
  const checkOutDate = booking.check_out_time ? new Date(booking.check_out_time) : null;

  // Case 1: Session has been checked out / completed
  if (checkOutDate && !isNaN(checkOutDate.getTime())) {
    const isOvertime = checkOutDate.getTime() > endDate.getTime();
    const overtimeMillis = isOvertime ? checkOutDate.getTime() - endDate.getTime() : 0;
    const overtimeMinutes = Math.floor(overtimeMillis / 60000);
    const overtimeHours = Number((overtimeMillis / 3600000).toFixed(1));

    const effectiveStart = checkInDate && !isNaN(checkInDate.getTime()) ? checkInDate : startDate;
    const actualMillis = Math.max(0, checkOutDate.getTime() - effectiveStart.getTime());
    const actualHours = Number((actualMillis / 3600000).toFixed(1));

    return {
      state: "completed",
      label: overtimeMinutes > 0 ? `Completed (+${overtimeMinutes}m OT)` : "Completed",
      overtimeMinutes,
      overtimeHours,
      scheduledHours,
      actualHours,
      startDate,
      endDate,
      checkInDate,
      checkOutDate,
      isLiveOvertime: false,
    };
  }

  // Case 2: Uncompleted session - check current time vs scheduled window
  const nowTime = now.getTime();
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  // If current time is past the scheduled end time and not checked out
  if (nowTime > endTime) {
    // Only treat as active live overtime if the session was scheduled within the last 24 hours
    // (avoids runaway overtime on unclosed historical demo bookings from weeks ago)
    const hoursPast = (nowTime - endTime) / 3600000;
    const isRecent = hoursPast <= 24;

    if (isRecent) {
      const overtimeMillis = nowTime - endTime;
      const overtimeMinutes = Math.max(1, Math.floor(overtimeMillis / 60000));
      const overtimeHours = Number((overtimeMillis / 3600000).toFixed(1));
      const actualHours = Number((scheduledHours + overtimeHours).toFixed(1));

      return {
        state: "overtime",
        label: `Overtime (+${overtimeMinutes}m)`,
        overtimeMinutes,
        overtimeHours,
        scheduledHours,
        actualHours,
        startDate,
        endDate,
        checkInDate,
        checkOutDate: null,
        isLiveOvertime: true,
      };
    } else {
      // Historical session left open without checkout - treated as completed at scheduled end
      return {
        state: "completed",
        label: "Completed",
        overtimeMinutes: 0,
        overtimeHours: 0,
        scheduledHours,
        actualHours: scheduledHours,
        startDate,
        endDate,
        checkInDate,
        checkOutDate: null,
        isLiveOvertime: false,
      };
    }
  }

  // Case 3: In progress right now within scheduled window
  if (nowTime >= startTime && nowTime <= endTime) {
    const elapsedMillis = nowTime - startTime;
    const elapsedHours = Number((elapsedMillis / 3600000).toFixed(1));

    return {
      state: "in_progress",
      label: "In Session",
      overtimeMinutes: 0,
      overtimeHours: 0,
      scheduledHours,
      actualHours: elapsedHours,
      startDate,
      endDate,
      checkInDate,
      checkOutDate: null,
      isLiveOvertime: false,
    };
  }

  // Case 4: Upcoming future booking
  return {
    state: "upcoming",
    label: "Upcoming",
    overtimeMinutes: 0,
    overtimeHours: 0,
    scheduledHours,
    actualHours: 0,
    startDate,
    endDate,
    checkInDate: null,
    checkOutDate: null,
    isLiveOvertime: false,
  };
}

/**
 * Returns all active bookings currently running overtime right now.
 */
export function getActiveOvertimeBookings(bookings, currentTime = new Date()) {
  if (!Array.isArray(bookings)) return [];
  return bookings
    .map((b) => ({
      booking: b,
      timing: getBookingTimingState(b, currentTime),
    }))
    .filter((item) => item.timing.isLiveOvertime);
}

