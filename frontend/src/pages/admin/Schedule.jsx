import { useState, useEffect, useMemo, useCallback } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getBookings, createBooking, updateBookingStatus, deleteBooking } from "../../api/bookings.js";
import { getRooms } from "../../api/rooms.js";
import { useToast } from "../../components/Toast.jsx";
import {
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";

function Schedule() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
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
        setNewBookingData((prev) => ({ ...prev, room_id: prev.room_id || roomsData[0].id }));
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

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: previousMonthDays - i,
      currentMonth: false,
      date: new Date(year, month - 1, previousMonthDays - i),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      currentMonth: true,
      date: new Date(year, month, day),
    });
  }

  let nextDay = 1;
  while (calendarDays.length < 42) {
    calendarDays.push({
      day: nextDay,
      currentMonth: false,
      date: new Date(year, month + 1, nextDay),
    });
    nextDay++;
  }

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const filteredBookings = useMemo(() => {
    if (roomFilter === "All Rooms") return bookings;
    return bookings.filter(
      (b) => String(b.room_id) === String(roomFilter) || b.room_name === roomFilter
    );
  }, [bookings, roomFilter]);

  const getBookingsForDate = (date) => {
    const key = formatDateKey(date);
    return filteredBookings.filter((b) => {
      if (b.date === key) return true;
      if (typeof b.start_time === "string" && b.start_time.includes("T")) {
        return b.start_time.split("T")[0] === key;
      }
      if (typeof b.raw_start_time === "string" && b.raw_start_time.includes("T")) {
        return b.raw_start_time.split("T")[0] === key;
      }
      return false;
    });
  };

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getBookingColor = (color) => {
    const styles = {
      blue: theme
        ? "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25"
        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      purple: theme
        ? "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      green: theme
        ? "bg-green-500/15 text-green-300 border-green-500/30 hover:bg-green-500/25"
        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      orange: theme
        ? "bg-orange-500/15 text-orange-300 border-orange-500/30 hover:bg-orange-500/25"
        : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
      pink: theme
        ? "bg-pink-500/15 text-pink-300 border-pink-500/30 hover:bg-pink-500/25"
        : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
    };
    return styles[color] || styles.blue;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const openNewBookingForDate = (date) => {
    setNewBookingData((prev) => ({
      ...prev,
      date: formatDateKey(date),
      room_id: prev.room_id || (rooms[0] ? rooms[0].id : ""),
    }));
    setConflictWarning("");
    setShowBookingModal(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setConflictWarning("");

    if (newBookingData.start_time >= newBookingData.end_time) {
      setConflictWarning("End time must be later than start time.");
      return;
    }

    const selectedRoom = rooms.find((r) => String(r.id) === String(newBookingData.room_id));
    const roomName = selectedRoom ? selectedRoom.name : "Conference Room";

    const existingConflict = bookings.find((b) => {
      if (b.status === "cancelled") return false;
      const bDate = b.date || (typeof b.start_time === "string" && b.start_time.includes("T") ? b.start_time.split("T")[0] : null);
      if (bDate !== newBookingData.date) return false;
      if (String(b.room_id) !== String(newBookingData.room_id)) return false;

      const bStart = typeof b.start_time === "string" && b.start_time.includes("T") ? b.start_time.split("T")[1].slice(0, 5) : b.start_time;
      const bEnd = typeof b.end_time === "string" && b.end_time.includes("T") ? b.end_time.split("T")[1].slice(0, 5) : b.end_time;

      return (
        (newBookingData.start_time >= bStart && newBookingData.start_time < bEnd) ||
        (newBookingData.end_time > bStart && newBookingData.end_time <= bEnd) ||
        (newBookingData.start_time <= bStart && newBookingData.end_time >= bEnd)
      );
    });

    if (existingConflict) {
      const proceed = window.confirm(
        `Warning: Conflict with existing booking "${existingConflict.title}" (${existingConflict.start_time}-${existingConflict.end_time}). Proceed anyway?`
      );
      if (!proceed) return;
    }

    try {
      const created = await createBooking({
        room_id: Number(newBookingData.room_id),
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
        prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
      );
      showToast(`Booking "${booking.title}" has been cancelled`);
      setSelectedBooking(null);
    } catch {
      showToast("Failed to cancel booking", "error");
    }
  };

  const handleDeleteBooking = async (booking) => {
    const confirmed = window.confirm(`Permanently delete booking "${booking.title}"?`);
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

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-xs outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Schedule & Calendar" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Room Reservation Calendar
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Monitor real-time room occupancies, avoid scheduling conflicts, and book meetings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setConflictWarning("");
            setShowBookingModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <Plus size={16} />
          New Reservation
        </button>
      </div>

      {/* Calendar Controls */}
      <section
        className={`mt-6 rounded-2xl border p-4 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className={`p-2 rounded-lg transition ${
                theme
                  ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-slate-900"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            <h3
              className={`min-w-44 text-center text-base font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              {monthName}
            </h3>

            <button
              type="button"
              onClick={goToNextMonth}
              className={`p-2 rounded-lg transition ${
                theme
                  ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-slate-900"
              }`}
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                theme
                  ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
                  : "bg-gray-100 text-slate-700 hover:bg-gray-200"
              }`}
            >
              Today
            </button>
          </div>

          {/* Room filter */}
          <div className="flex items-center gap-2">
            <CalendarDays
              size={16}
              className={theme ? "text-gray-500" : "text-gray-400"}
            />
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium outline-none ${
                theme
                  ? "bg-slate-900 border-slate-700 text-gray-200"
                  : "bg-gray-50 border-gray-200 text-slate-700"
              }`}
            >
              <option value="All Rooms">All Rooms ({rooms.length})</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Calendar Grid */}
      <section
        className={`mt-4 rounded-3xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700">
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day) => (
            <div
              key={day}
              className={`py-3 px-2 text-center text-[11px] font-bold uppercase tracking-wider border-r last:border-r-0 ${
                theme
                  ? "text-gray-400 border-slate-700"
                  : "text-gray-500 border-gray-200"
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Days cells */}
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((calendarDay, index) => {
              const dayBookings = getBookingsForDate(calendarDay.date);

              return (
                <div
                  key={`${formatDateKey(calendarDay.date)}-${index}`}
                  onClick={() => openNewBookingForDate(calendarDay.date)}
                  className={`relative min-h-32 p-2 border-b border-r cursor-pointer transition hover:bg-blue-500/5 ${
                    theme ? "border-slate-700" : "border-gray-200"
                  } ${
                    !calendarDay.currentMonth
                      ? theme
                        ? "bg-slate-900/40 text-gray-600"
                        : "bg-gray-50/70 text-gray-300"
                      : ""
                  }`}
                >
                  {/* Date header */}
                  <div className="flex justify-between items-start pointer-events-none">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                        isToday(calendarDay.date)
                          ? "bg-blue-600 text-white font-bold"
                          : calendarDay.currentMonth
                            ? theme
                              ? "text-gray-200"
                              : "text-slate-800"
                            : theme
                              ? "text-gray-600"
                              : "text-gray-400"
                      }`}
                    >
                      {calendarDay.day}
                    </span>

                    {dayBookings.length > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          theme
                            ? "bg-slate-700 text-blue-400"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Bookings list */}
                  <div className="mt-1.5 space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <button
                        type="button"
                        key={booking.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                        className={`w-full text-left border rounded-lg px-2 py-1 transition ${getBookingColor(
                          booking.color,
                        )} ${booking.status === "cancelled" ? "line-through opacity-50" : ""}`}
                      >
                        <p className="text-[10px] font-bold truncate">
                          {booking.title}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] opacity-80 mt-0.5">
                          <Clock size={9} />
                          <span>{booking.start_time}</span>
                          <span>•</span>
                          <span className="truncate">{booking.room_name}</span>
                        </div>
                      </button>
                    ))}

                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-blue-500 font-semibold px-1">
                        +{dayBookings.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* NEW BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowBookingModal(false)}
          />

          <section
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl shadow-2xl ${
              theme
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <div>
                <h3
                  className={`text-base font-bold ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  Schedule Room Reservation
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Date: {newBookingData.date}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className={`p-2 rounded-lg transition ${
                  theme
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-400 hover:text-slate-900 hover:bg-gray-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              {/* Room picker */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Conference Room
                </label>
                <select
                  value={newBookingData.room_id}
                  onChange={(e) =>
                    setNewBookingData({ ...newBookingData, room_id: e.target.value })
                  }
                  required
                  className={inputClass}
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.capacity} seats · {room.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Meeting title */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Meeting / Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Product Sync"
                  value={newBookingData.title}
                  onChange={(e) =>
                    setNewBookingData({ ...newBookingData, title: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* Booker name */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Organizer / Booker Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newBookingData.booker_name}
                  onChange={(e) =>
                    setNewBookingData({ ...newBookingData, booker_name: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              {/* Date & Attendees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={newBookingData.date}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, date: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBookingData.attendees}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, attendees: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newBookingData.start_time}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, start_time: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newBookingData.end_time}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, end_time: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Color Tag */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Category Color
                </label>
                <div className="flex gap-2">
                  {["blue", "purple", "green", "orange", "pink"].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewBookingData({ ...newBookingData, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        newBookingData.color === c ? "scale-110 border-white ring-2 ring-blue-500" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor:
                          c === "blue" ? "#3b82f6" : c === "purple" ? "#a855f7" : c === "green" ? "#22c55e" : c === "orange" ? "#f97316" : "#ec4899",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    theme
                      ? "text-gray-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedBooking(null)}
          />

          <section
            className={`relative w-full max-w-md rounded-3xl shadow-2xl p-6 ${
              theme
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedBooking.status === "cancelled"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}
                >
                  {selectedBooking.status?.toUpperCase() || "CONFIRMED"}
                </span>

                <h3
                  className={`text-base font-bold mt-2 ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {selectedBooking.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className={`p-1.5 rounded-lg transition ${
                  theme ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-slate-900"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-blue-500 font-semibold">
                <MapPin size={14} />
                <span>{selectedBooking.room_name || `Room #${selectedBooking.room_id}`}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={14} />
                <span>{selectedBooking.date}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span>{selectedBooking.start_time} - {selectedBooking.end_time}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <Users size={14} />
                <span>Booked by {selectedBooking.booker_name} ({selectedBooking.attendees} attendees)</span>
              </div>

              {selectedBooking.notes && (
                <p className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 text-xs">
                  {selectedBooking.notes}
                </p>
              )}
            </div>

            <div
              className={`flex items-center justify-between gap-3 mt-6 pt-4 border-t ${
                theme ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <button
                type="button"
                onClick={() => handleDeleteBooking(selectedBooking)}
                className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete
              </button>

              {selectedBooking.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(selectedBooking)}
                  className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition flex items-center gap-1.5"
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
