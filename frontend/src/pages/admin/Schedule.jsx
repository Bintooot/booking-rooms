import { useState, useEffect, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from "../../api/bookings.js";
import { getRooms } from "../../api/rooms.js";
import { useToast } from "../../components/Toast.jsx";
import { validateBookingAgainstPolicy } from "../../services/settingsService.js";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";
import {
  CalendarDays,
  Plus,
  Users,
  Clock,
  MapPin,
  X,
  Calendar,
  AlertCircle,
  Trash2,
  Ban,
  Filter,
} from "lucide-react";

const CATEGORY_THEMES = {
  blue: {
    label: "General",
    light: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", badgeBg: "#dbeafe", bar: "#3b82f6" },
    dark: { bg: "#1e293b", border: "#334155", text: "#93c5fd", badgeBg: "rgba(59, 130, 246, 0.2)", bar: "#3b82f6" },
  },
  purple: {
    label: "Executive",
    light: { bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8", badgeBg: "#f3e8ff", bar: "#8b5cf6" },
    dark: { bg: "#1e293b", border: "#334155", text: "#c4b5fd", badgeBg: "rgba(139, 92, 246, 0.2)", bar: "#8b5cf6" },
  },
  green: {
    label: "Workshop",
    light: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", badgeBg: "#dcfce7", bar: "#10b981" },
    dark: { bg: "#1e293b", border: "#334155", text: "#86efac", badgeBg: "rgba(16, 185, 129, 0.2)", bar: "#10b981" },
  },
  orange: {
    label: "Standup",
    light: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", badgeBg: "#ffedd5", bar: "#f97316" },
    dark: { bg: "#1e293b", border: "#334155", text: "#fdba74", badgeBg: "rgba(249, 115, 22, 0.2)", bar: "#f97316" },
  },
  pink: {
    label: "Interview",
    light: { bg: "#fdf2f8", border: "#fbcfe8", text: "#9d174d", badgeBg: "#fce7f3", bar: "#ec4899" },
    dark: { bg: "#1e293b", border: "#334155", text: "#f472b6", badgeBg: "rgba(236, 72, 153, 0.2)", bar: "#ec4899" },
  },
};

function Schedule() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [roomFilter, setRoomFilter] = useState("All Rooms");
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [conflictWarning, setConflictWarning] = useState("");

  const [newBookingData, setNewBookingData] = useState({
    room_id: "",
    title: "",
    booker_name: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
    attendees: 4,
    notes: "",
    color: "blue",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsData, roomsData] = await Promise.all([
        getBookings(),
        getRooms(),
      ]);
      setBookings(bookingsData || []);
      setRooms(roomsData || []);
      if (roomsData && roomsData.length > 0) {
        setNewBookingData((prev) => ({
          ...prev,
          room_id: prev.room_id || roomsData[0].id,
        }));
      }
    } catch {
      showToast("Failed to load schedule", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Bookings by Room
  const filteredBookings = useMemo(() => {
    if (roomFilter === "All Rooms") return bookings;
    return bookings.filter(
      (b) =>
        String(b.room_id) === String(roomFilter) || b.room_name === roomFilter
    );
  }, [bookings, roomFilter]);

  // Transform bookings into FullCalendar events format
  const calendarEvents = useMemo(() => {
    return filteredBookings.map((b) => {
      let start = b.raw_start_time;
      let end = b.raw_end_time;

      const baseDate = b.date || new Date().toISOString().split("T")[0];
      if (!start || !start.includes("T")) {
        start = `${baseDate}T${b.start_time || "09:00"}:00`;
      }
      if (!end || !end.includes("T")) {
        end = `${baseDate}T${b.end_time || "10:00"}:00`;
      }

      const colorKey = b.color && CATEGORY_THEMES[b.color] ? b.color : "blue";
      const isCancelled = b.status === "cancelled";

      return {
        id: String(b.id),
        title: b.title || "Meeting",
        start,
        end,
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: {
          booking: b,
          colorKey,
          isCancelled,
        },
      };
    });
  }, [filteredBookings]);

  // Event Click (View details)
  const handleEventClick = (info) => {
    const b = info.event.extendedProps?.booking;
    if (b) {
      setSelectedBooking(b);
    }
  };

  // Date / Slot Click (Create new reservation)
  const handleDateClick = (arg) => {
    const rawDateStr = arg.dateStr || "";
    const clickedDate = rawDateStr.split("T")[0] || new Date().toISOString().split("T")[0];
    let clickedTime = "09:00";
    let endTime = "10:00";

    if (rawDateStr.includes("T")) {
      clickedTime = rawDateStr.split("T")[1].slice(0, 5);
      const [h, m] = clickedTime.split(":").map(Number);
      const nextHour = (h + 1) % 24;
      endTime = `${String(nextHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    setNewBookingData((prev) => ({
      ...prev,
      date: clickedDate,
      start_time: clickedTime,
      end_time: endTime,
      room_id: prev.room_id || (rooms[0] ? rooms[0].id : ""),
    }));
    setConflictWarning("");
    setShowBookingModal(true);
  };

  // Custom Event Content Rendering
  const renderEventContent = (eventInfo) => {
    const { booking, colorKey, isCancelled } = eventInfo.event.extendedProps || {};
    const viewType = eventInfo.view.type;
    const isMonthView = viewType === "dayGridMonth";

    const catTheme = CATEGORY_THEMES[colorKey] || CATEGORY_THEMES.blue;
    const colors = theme ? catTheme.dark : catTheme.light;

    if (isCancelled) {
      colors.bg = theme ? "rgba(239, 68, 68, 0.15)" : "#fef2f2";
      colors.border = theme ? "rgba(239, 68, 68, 0.3)" : "#fecaca";
      colors.text = theme ? "#fca5a5" : "#b91c1c";
      colors.bar = "#ef4444";
    }

    if (isMonthView) {
      return (
        <div
          className="w-full px-2 py-1 rounded-md flex items-center gap-1.5 overflow-hidden transition-all duration-150 hover:shadow-xs"
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.bar}`,
            color: colors.text,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: colors.bar }}
          />
          <span className="text-[11px] font-medium truncate leading-tight">
            {booking?.start_time} {eventInfo.event.title}
          </span>
        </div>
      );
    }

    // TimeGrid (Week & Day View)
    return (
      <div
        className="w-full h-full p-2 rounded-lg flex flex-col justify-between overflow-hidden shadow-xs transition-all duration-150 hover:shadow-md"
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
          borderLeft: `4px solid ${colors.bar}`,
          color: colors.text,
        }}
      >
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: colors.badgeBg,
                color: colors.text,
              }}
            >
              {booking?.room_name || "Room"}
            </span>
            <span className="text-[10px] font-normal opacity-85">
              {booking?.start_time} - {booking?.end_time}
            </span>
          </div>

          <h4 className="text-xs font-semibold truncate leading-tight">
            {eventInfo.event.title}
          </h4>
        </div>

        <div className="flex items-center justify-between text-[10px] opacity-75 mt-1">
          <span className="truncate flex items-center gap-1">
            <Users size={10} className="shrink-0" />
            {booking?.booker_name || "Team Member"}
          </span>
          {isCancelled && (
            <span className="text-red-500 font-medium uppercase text-[9px]">Cancelled</span>
          )}
        </div>
      </div>
    );
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setConflictWarning("");

    if (newBookingData.start_time >= newBookingData.end_time) {
      setConflictWarning("End time must be later than start time.");
      return;
    }

    const selectedRoom = rooms.find(
      (r) => String(r.id) === String(newBookingData.room_id)
    );
    const roomName = selectedRoom ? selectedRoom.name : "Room / Space";

    const validation = validateBookingAgainstPolicy(newBookingData, bookings);
    if (!validation.isValid) {
      setConflictWarning(validation.error);
      showToast(validation.error, "error");
      return;
    }

    if (validation.isWarning) {
      const proceed = window.confirm(
        `${validation.error}\nDo you want to proceed anyway?`
      );
      if (!proceed) return;
    }

    try {
      const created = await createBooking({
        room_id: Number(newBookingData.room_id),
        user_id: user?.id,
        room_name: roomName,
        title: newBookingData.title,
        booker_name: newBookingData.booker_name,
        date: newBookingData.date,
        start_time: newBookingData.start_time,
        end_time: newBookingData.end_time,
        attendees: Number(newBookingData.attendees),
        notes: newBookingData.notes,
        color: newBookingData.color,
        status: "confirmed",
      });

      setBookings((prev) => [created, ...prev]);

      logAuditEvent({
        action: "Booking Created",
        actor: user?.name || newBookingData.booker_name,
        target: `${newBookingData.title} (${roomName})`,
        type: "booking",
      });

      addNotification({
        title: "New Reservation Confirmed",
        message: `"${newBookingData.title}" reserved in ${roomName} for ${newBookingData.date} (${newBookingData.start_time}-${newBookingData.end_time}).`,
        type: "booking",
        targetUserId: user?.id,
        targetEmail: user?.email,
        targetRoles: ["Administrator", "Manager"],
      });

      showToast(`Reserved "${roomName}" for ${newBookingData.title}!`);
      setShowBookingModal(false);
      setNewBookingData({
        room_id: rooms[0]?.id || "",
        title: "",
        booker_name: "",
        date: new Date().toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "10:00",
        attendees: 4,
        notes: "",
        color: "blue",
      });
    } catch {
      showToast("Failed to create booking", "error");
    }
  };

  const handleCancelBooking = async (booking) => {
    try {
      await updateBookingStatus(booking.id, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "cancelled" } : b
        )
      );
      showToast(`Booking "${booking.title}" has been cancelled`);
      setSelectedBooking(null);
    } catch {
      showToast("Failed to cancel booking", "error");
    }
  };

  const handleDeleteBooking = async (booking) => {
    const confirmed = window.confirm(
      `Permanently delete booking "${booking.title}"?`
    );
    if (!confirmed) return;

    try {
      await deleteBooking(booking.id);
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
      showToast(`Booking deleted successfully`);
      setSelectedBooking(null);
    } catch {
      showToast("Failed to delete booking", "error");
    }
  };

  const inputClass = `w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition duration-150 ${
    theme
      ? "bg-slate-900/80 border-slate-700 text-slate-100 placeholder:text-gray-500 focus:border-blue-500"
      : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-16">
      <Banner header="Schedule & Calendar" theme={theme} />

      {/* Header & Quick Action Bar */}
      <section className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-lg font-semibold tracking-tight ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Interactive Schedule
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                theme
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-blue-50 text-blue-600 border-blue-200"
              }`}
            >
              Live Sync
            </span>
          </div>
          <p
            className={`text-xs mt-1 ${
              theme ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Switch between Month, Week, and Day views. Click any time slot to reserve a room.
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Room Filter Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition ${
              theme
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <Filter size={14} className="text-blue-500 shrink-0" />
            <span className="text-[11px] text-slate-400">Space:</span>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="bg-transparent text-xs font-medium outline-none cursor-pointer pr-1 text-slate-800 dark:text-slate-200"
            >
              <option value="All Rooms" className={theme ? "bg-slate-800 text-white" : "bg-white text-slate-800"}>
                All Rooms ({rooms.length})
              </option>
              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                  className={theme ? "bg-slate-800 text-white" : "bg-white text-slate-800"}
                >
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* New Reservation Action Button */}
          <button
            type="button"
            onClick={() => {
              setConflictWarning("");
              setShowBookingModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            New Reservation
          </button>
        </div>
      </section>

      {/* Category Legend & Mini Stats Strip */}
      <section
        className={`mt-4 px-4 py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs transition ${
          theme
            ? "bg-slate-800/80 border-slate-700/80 text-slate-300"
            : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-medium text-slate-500">Categories:</span>
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(CATEGORY_THEMES).map(([key, cat]) => {
              const c = theme ? cat.dark : cat.light;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[10px] border"
                  style={{
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    color: c.text,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: c.bar }}
                  />
                  {cat.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>{filteredBookings.length} Bookings</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {rooms.filter((r) => r.is_active).length} Active Spaces
          </span>
        </div>
      </section>

      {/* Calendar Card Container */}
      <section
        className={`mt-4 rounded-3xl border p-4 md:p-6 shadow-xs transition ${
          theme
            ? "bg-slate-800/90 border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-xs font-normal text-slate-400">Loading schedule...</p>
          </div>
        ) : (
          <div className={`spacesync-fullcalendar ${theme ? "fc-dark-theme" : "fc-light-theme"}`}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: "Today",
                dayGridMonth: "Month",
                timeGridWeek: "Week",
                timeGridDay: "Day",
              }}
              events={calendarEvents}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={true}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              nowIndicator={true}
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
            />
          </div>
        )}
      </section>

      {/* Scoped Styles for FullCalendar */}
      <style>{`
        .spacesync-fullcalendar .fc {
          font-family: inherit;
        }

        /* Toolbar Title */
        .spacesync-fullcalendar .fc-toolbar-title {
          font-size: 1.05rem !important;
          font-weight: 600 !important;
          letter-spacing: -0.01em;
        }

        /* Toolbar Layout */
        .spacesync-fullcalendar .fc-toolbar {
          margin-bottom: 1.25rem !important;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        /* Buttons */
        .spacesync-fullcalendar .fc-button {
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          border-radius: 0.75rem !important;
          padding: 0.4rem 0.85rem !important;
          box-shadow: none !important;
          transition: all 0.15s ease-in-out !important;
        }

        /* Base event resets */
        .spacesync-fullcalendar .fc-event {
          background: transparent !important;
          border: none !important;
          margin-bottom: 2px !important;
          cursor: pointer;
        }

        /* Header Day Names */
        .spacesync-fullcalendar .fc-col-header-cell {
          padding: 8px 0 !important;
          font-size: 0.7rem !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Day numbers */
        .spacesync-fullcalendar .fc-daygrid-day-number {
          padding: 6px 8px !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
        }

        /* TimeGrid Hour Labels */
        .spacesync-fullcalendar .fc-timegrid-slot-label-cushion {
          font-size: 0.7rem !important;
          font-weight: 500 !important;
        }

        /* --- LIGHT THEME STYLES --- */
        .fc-light-theme {
          color: #1e293b;
        }
        .fc-light-theme .fc-toolbar-title {
          color: #0f172a;
        }
        .fc-light-theme .fc-button-primary {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #334155 !important;
        }
        .fc-light-theme .fc-button-primary:hover {
          background-color: #f8fafc !important;
          color: #0f172a !important;
        }
        .fc-light-theme .fc-button-active {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
        }
        .fc-light-theme .fc-theme-standard td, 
        .fc-light-theme .fc-theme-standard th {
          border-color: #e2e8f0 !important;
        }
        .fc-light-theme .fc-col-header-cell-cushion {
          color: #475569 !important;
        }
        .fc-light-theme .fc-daygrid-day-number {
          color: #334155 !important;
        }
        .fc-light-theme .fc-daygrid-day.fc-day-today {
          background-color: #eff6ff !important;
        }
        .fc-light-theme .fc-day-today .fc-daygrid-day-number {
          background-color: #2563eb;
          color: #ffffff !important;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin: 4px;
        }
        .fc-light-theme .fc-timegrid-slot-label-cushion {
          color: #64748b !important;
        }
        .fc-light-theme .fc-timegrid-now-indicator-line {
          border-color: #2563eb !important;
        }

        /* --- DARK THEME STYLES --- */
        .fc-dark-theme {
          color: #f1f5f9;
        }
        .fc-dark-theme .fc-toolbar-title {
          color: #ffffff;
        }
        .fc-dark-theme .fc-button-primary {
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
          color: #94a3b8 !important;
        }
        .fc-dark-theme .fc-button-primary:hover {
          background-color: #334155 !important;
          color: #f8fafc !important;
        }
        .fc-dark-theme .fc-button-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        .fc-dark-theme .fc-theme-standard td, 
        .fc-dark-theme .fc-theme-standard th {
          border-color: #334155 !important;
        }
        .fc-dark-theme .fc-col-header-cell-cushion {
          color: #94a3b8 !important;
        }
        .fc-dark-theme .fc-daygrid-day-number {
          color: #cbd5e1 !important;
        }
        .fc-dark-theme .fc-daygrid-day.fc-day-today {
          background-color: rgba(59, 130, 246, 0.08) !important;
        }
        .fc-dark-theme .fc-day-today .fc-daygrid-day-number {
          background-color: #3b82f6;
          color: #ffffff !important;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin: 4px;
        }
        .fc-dark-theme .fc-timegrid-slot-label-cushion {
          color: #64748b !important;
        }
        .fc-dark-theme .fc-timegrid-now-indicator-line {
          border-color: #3b82f6 !important;
        }
      `}</style>

      {/* NEW RESERVATION MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowBookingModal(false)}
          />

          <section
            className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border transition-all ${
              theme
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Schedule Room Reservation
                  </h3>
                  <p className={`text-xs ${theme ? "text-slate-400" : "text-slate-500"}`}>
                    Selected Date: {newBookingData.date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className={`p-2 rounded-xl transition ${
                  theme
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              {/* Room picker */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                  Target Room / Collaborative Space
                </label>
                <select
                  value={newBookingData.room_id}
                  onChange={(e) =>
                    setNewBookingData({
                      ...newBookingData,
                      room_id: e.target.value,
                    })
                  }
                  required
                  className={inputClass}
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id} className={theme ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                      {room.name} ({room.capacity} seats · {room.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting title */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                  Meeting / Reservation Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Design Sprint & Planning"
                  value={newBookingData.title}
                  onChange={(e) =>
                    setNewBookingData({
                      ...newBookingData,
                      title: e.target.value,
                    })
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* Booker name */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                  Organizer / Booker Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={newBookingData.booker_name}
                  onChange={(e) =>
                    setNewBookingData({
                      ...newBookingData,
                      booker_name: e.target.value,
                    })
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* Date & Attendees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newBookingData.date}
                    onChange={(e) =>
                      setNewBookingData({
                        ...newBookingData,
                        date: e.target.value,
                      })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                    Attendees Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBookingData.attendees}
                    onChange={(e) =>
                      setNewBookingData({
                        ...newBookingData,
                        attendees: e.target.value,
                      })
                    }
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newBookingData.start_time}
                    onChange={(e) =>
                      setNewBookingData({
                        ...newBookingData,
                        start_time: e.target.value,
                      })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newBookingData.end_time}
                    onChange={(e) =>
                      setNewBookingData({
                        ...newBookingData,
                        end_time: e.target.value,
                      })
                    }
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Color Tag Selector */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${theme ? "text-slate-300" : "text-slate-700"}`}>
                  Category Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_THEMES).map(([key, cat]) => {
                    const c = theme ? cat.dark : cat.light;
                    const isSelected = newBookingData.color === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() =>
                          setNewBookingData({ ...newBookingData, color: key })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-blue-500 scale-102"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: c.bg,
                          borderColor: c.border,
                          color: c.text,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.bar }}
                        />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    theme
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* VIEW / MANAGE BOOKING DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedBooking(null)}
          />

          <section
            className={`relative w-full max-w-md rounded-3xl shadow-2xl p-6 border transition-all ${
              theme
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${
                    selectedBooking.status === "cancelled"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {selectedBooking.status || "CONFIRMED"}
                </span>

                <h3 className="text-base font-semibold tracking-tight mt-2">
                  {selectedBooking.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  theme
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div
                className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                  theme
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                <MapPin size={15} className="shrink-0" />
                <span className="font-medium">
                  {selectedBooking.room_name || `Room #${selectedBooking.room_id}`}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-1 ${theme ? "text-slate-400" : "text-slate-600"}`}>
                <Calendar size={14} className="shrink-0" />
                <span>{selectedBooking.date}</span>
              </div>

              <div className={`flex items-center gap-2 px-1 ${theme ? "text-slate-400" : "text-slate-600"}`}>
                <Clock size={14} className="shrink-0" />
                <span>
                  {selectedBooking.start_time} - {selectedBooking.end_time}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-1 ${theme ? "text-slate-400" : "text-slate-600"}`}>
                <Users size={14} className="shrink-0" />
                <span>
                  Booked by {selectedBooking.booker_name} ({selectedBooking.attendees} attendees)
                </span>
              </div>

              {selectedBooking.notes && (
                <div
                  className={`mt-3 p-3 rounded-2xl border text-xs ${
                    theme
                      ? "bg-slate-800/80 border-slate-700/60 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <p className="text-[10px] uppercase font-medium text-slate-400 mb-1">Notes</p>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <div
              className={`flex items-center justify-between gap-3 mt-6 pt-4 border-t ${
                theme ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => handleDeleteBooking(selectedBooking)}
                className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-1.5 p-2 rounded-xl transition cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>

              {selectedBooking.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(selectedBooking)}
                  className={`px-4 py-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                    theme
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/15"
                      : "border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Ban size={14} /> Cancel Booking
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Schedule;
