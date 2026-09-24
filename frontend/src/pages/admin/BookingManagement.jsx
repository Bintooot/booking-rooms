import { useState, useEffect, useMemo, useCallback } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasPermission } from "../../utils/permissions.js";
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
} from "../../api/bookings.js";
import { getRooms } from "../../api/rooms.js";
import { useToast } from "../../components/Toast.jsx";
import { validateBookingAgainstPolicy } from "../../services/settingsService.js";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";
import { getBookingTimingState } from "../../utils/overtime.js";
import {
  Search,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  X,
  Trash2,
  Ban,
  CheckCircle2,
  Check,
  AlertTriangle,
  LogIn,
  LogOut,
} from "lucide-react";

function BookingManagement() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep live timing in sync every 30 seconds
  useEffect(() => {
    const ticker = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(ticker);
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room_id: "",
    title: "",
    booker_name: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
    attendees: 4,
    notes: "",
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
        setFormData((prev) => ({ ...prev, room_id: prev.room_id || roomsData[0].id }));
      }
    } catch {
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckIn = async (id, title) => {
    try {
      const nowIso = new Date().toISOString();
      await checkInBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, check_in_time: nowIso } : b))
      );
      logAuditEvent({
        action: "Room Session Started (Check-In)",
        actor: user?.name || "User",
        target: title,
        type: "booking",
      });
      showToast(`Checked in for "${title}"`);
    } catch {
      showToast("Failed to check in", "error");
    }
  };

  const handleCheckOut = async (id, title) => {
    try {
      const nowIso = new Date().toISOString();
      await checkOutBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, check_out_time: nowIso } : b))
      );
      logAuditEvent({
        action: "Room Session Released (Check-Out)",
        actor: user?.name || "User",
        target: title,
        type: "booking",
      });
      showToast(`Released room for "${title}"`);
    } catch {
      showToast("Failed to release room", "error");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        (b.title && b.title.toLowerCase().includes(search.toLowerCase())) ||
        (b.booker_name && b.booker_name.toLowerCase().includes(search.toLowerCase())) ||
        (b.room_name && b.room_name.toLowerCase().includes(search.toLowerCase()));

      const timing = getBookingTimingState(b, currentTime);

      let matchesStatus = true;
      if (statusFilter === "overtime") {
        matchesStatus = timing.isLiveOvertime;
      } else if (statusFilter === "in_progress") {
        matchesStatus = timing.state === "in_progress";
      } else if (statusFilter === "completed") {
        matchesStatus = timing.state === "completed";
      } else if (statusFilter !== "All") {
        matchesStatus = b.status?.toLowerCase() === statusFilter.toLowerCase();
      }

      const matchesRoom =
        roomFilter === "All" ||
        String(b.room_id) === String(roomFilter) ||
        b.room_name === roomFilter;

      return matchesSearch && matchesStatus && matchesRoom;
    });
  }, [bookings, search, statusFilter, roomFilter, currentTime]);

  const handleCancel = async (id, title) => {
    try {
      await updateBookingStatus(id, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );

      logAuditEvent({
        action: "Booking Cancelled",
        actor: user?.name || "User",
        target: title,
        type: "booking",
      });

      addNotification({
        title: "Reservation Cancelled",
        message: `Booking "${title}" was cancelled by ${user?.name || "User"}.`,
        type: "booking",
        targetUserId: user?.id,
        targetEmail: user?.email,
        targetRoles: ["Administrator", "Manager"],
      });

      showToast(`Booking "${title}" cancelled`);
    } catch {
      showToast("Failed to cancel booking", "error");
    }
  };

  const handleConfirm = async (id, title) => {
    try {
      await updateBookingStatus(id, { status: "confirmed" });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b))
      );

      logAuditEvent({
        action: "Booking Confirmed",
        actor: user?.name || "User",
        target: title,
        type: "booking",
      });

      showToast(`Booking "${title}" marked as confirmed`);
    } catch {
      showToast("Failed to confirm booking", "error");
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete reservation "${title}"?`);
    if (!confirmed) return;

    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));

      logAuditEvent({
        action: "Booking Deleted",
        actor: user?.name || "Administrator",
        target: title,
        type: "booking",
      });

      showToast(`Booking removed`);
    } catch {
      showToast("Failed to delete booking", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const selectedRoom = rooms.find((r) => String(r.id) === String(formData.room_id));
    const roomName = selectedRoom ? selectedRoom.name : "Room / Space";

    // Standard policy validation (advance window, max duration, conflict)
    const validation = validateBookingAgainstPolicy(formData, bookings);
    if (!validation.isValid) {
      showToast(validation.error, "error");
      return;
    }
    if (validation.isWarning) {
      const proceed = window.confirm(`${validation.error}\nDo you want to proceed anyway?`);
      if (!proceed) return;
    }

    try {
      const newBooking = await createBooking({
        ...formData,
        user_id: user?.id,
        room_name: roomName,
        status: "confirmed",
      });
      setBookings((prev) => [newBooking, ...prev]);

      logAuditEvent({
        action: "Booking Created",
        actor: user?.name || formData.booker_name,
        target: `${formData.title} (${roomName})`,
        type: "booking",
      });

      addNotification({
        title: "New Reservation Confirmed",
        message: `"${formData.title}" reserved in ${roomName} for ${formData.date} (${formData.start_time}-${formData.end_time}).`,
        type: "booking",
        targetUserId: user?.id,
        targetEmail: user?.email,
        targetRoles: ["Administrator", "Manager"],
      });

      showToast(`Reservation created for ${formData.title}`);
      setShowModal(false);
      setFormData({
        room_id: rooms[0]?.id || "",
        title: "",
        booker_name: "",
        date: new Date().toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "10:00",
        attendees: 4,
        notes: "",
      });
    } catch {
      showToast("Failed to create reservation", "error");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const todayCount = bookings.filter((b) => b.date === todayStr).length;

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-xs outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Booking Management" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-semibold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Reservation Records
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Review, confirm, cancel, and audit all meeting space reservations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm"
        >
          <Plus size={16} />
          New Reservation
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Bookings", value: bookings.length, icon: <CalendarDays size={18} /> },
          { label: "Confirmed", value: confirmedCount, icon: <CheckCircle2 size={18} /> },
          { label: "Cancelled", value: cancelledCount, icon: <Ban size={18} /> },
          { label: "Today's Meetings", value: todayCount, icon: <Clock size={18} /> },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-2xl border p-4 ${
              theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}
              >
                {kpi.icon}
              </div>
              <span
                className={`text-2xl font-bold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {kpi.value}
              </span>
            </div>
            <p
              className={`text-xs mt-3 font-normal ${
                theme ? "text-gray-400" : "text-slate-500"
              }`}
            >
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <section
        className={`mt-6 rounded-2xl border p-4 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                theme ? "text-gray-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search by title, booker, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs outline-none transition ${
                theme
                  ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-xs font-normal outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="overtime">⚠️ Overtime Sessions</option>
            <option value="in_progress">🟢 In Session</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-xs font-normal outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <option value="All">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Bookings Table / List */}
      <section
        className={`mt-6 rounded-3xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading reservations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-medium uppercase tracking-wider ${
                    theme
                      ? "border-slate-700 bg-slate-900/40 text-gray-400"
                      : "border-slate-200 bg-slate-50/80 text-slate-600"
                  }`}
                >
                  <th className="py-3.5 px-5">Meeting Details</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={`transition hover:bg-blue-500/5 ${
                      booking.status === "cancelled" ? "opacity-60" : ""
                    }`}
                  >
                    <td className="py-4 px-5">
                      <p
                        className={`font-semibold ${
                          theme ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {booking.title}
                      </p>
                      {booking.notes && (
                        <p
                          className={`text-[11px] mt-0.5 max-w-xs truncate ${
                            theme ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {booking.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 font-medium text-blue-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {booking.room_name || `Room #${booking.room_id}`}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p
                        className={`font-medium ${
                          theme ? "text-gray-200" : "text-slate-800"
                        }`}
                      >
                        {booking.date}
                      </p>
                      <p
                        className={`text-[11px] mt-0.5 flex items-center gap-1 ${
                          theme ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Clock size={11} />
                        {booking.start_time} - {booking.end_time}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-medium ${
                          theme ? "text-gray-200" : "text-slate-800"
                        }`}
                      >
                        {booking.booker_name}
                      </span>
                      <span
                        className={`block text-[11px] ${
                          theme ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {booking.attendees} attendees
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {(() => {
                        const timing = getBookingTimingState(booking, currentTime);

                        if (booking.status === "cancelled") {
                          return (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                                theme
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              CANCELLED
                            </span>
                          );
                        }

                        if (timing.isLiveOvertime) {
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border border-rose-500/40 bg-rose-500/20 text-rose-600 dark:text-rose-300 animate-pulse">
                                <AlertTriangle size={12} />
                                OVERTIME (+{timing.overtimeMinutes}m)
                              </span>
                              <span className="text-[10px] text-rose-500 font-medium">
                                Exceeded schedule
                              </span>
                            </div>
                          );
                        }

                        if (timing.state === "in_progress") {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              IN SESSION
                            </span>
                          );
                        }

                        if (timing.state === "completed") {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-slate-400/20 bg-slate-500/10 text-slate-500 dark:text-slate-400">
                                COMPLETED
                              </span>
                              {timing.overtimeMinutes > 0 && (
                                <span className="text-[10px] text-amber-500 font-normal">
                                  +{timing.overtimeMinutes}m OT recorded
                                </span>
                              )}
                            </div>
                          );
                        }

                        return (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                              theme
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            UPCOMING
                          </span>
                        );
                      })()}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {(() => {
                        const timing = getBookingTimingState(booking, currentTime);
                        const isOwnBooking =
                          booking.booker_name?.toLowerCase() === user?.name?.toLowerCase();
                        const canCancel =
                          hasPermission(user?.role, "cancel_any") ||
                          (hasPermission(user?.role, "cancel_own") && isOwnBooking);
                        const canDelete = hasPermission(user?.role, "cancel_any");
                        const canManageLifecycle =
                          hasPermission(user?.role, "cancel_any") || isOwnBooking;

                        return (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Check In action for upcoming session */}
                            {canManageLifecycle &&
                              booking.status === "confirmed" &&
                              !booking.check_in_time &&
                              !booking.check_out_time &&
                              timing.state !== "completed" && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckIn(booking.id, booking.title)}
                                  title="Check In (Start Session)"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                >
                                  <LogIn size={13} />
                                  <span>Check In</span>
                                </button>
                              )}

                            {/* Release / Check Out action for active or overtime sessions */}
                            {canManageLifecycle &&
                              booking.status === "confirmed" &&
                              !booking.check_out_time &&
                              (timing.state === "in_progress" || timing.isLiveOvertime) && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckOut(booking.id, booking.title)}
                                  title="Release Room / Check Out"
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition shadow-xs ${
                                    timing.isLiveOvertime
                                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                                      : "bg-blue-600 hover:bg-blue-700 text-white"
                                  }`}
                                >
                                  <LogOut size={13} />
                                  <span>Release</span>
                                </button>
                              )}

                            {canCancel && (
                              booking.status === "confirmed" ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancel(booking.id, booking.title)}
                                  title="Cancel Booking"
                                  className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition"
                                >
                                  <Ban size={15} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConfirm(booking.id, booking.title)}
                                  title="Restore / Confirm Booking"
                                  className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition"
                                >
                                  <Check size={15} />
                                </button>
                              )
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(booking.id, booking.title)}
                                title="Delete Record"
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div className="py-12 text-center text-xs text-gray-400">
            No booking reservations match your filter criteria.
          </div>
        )}
      </section>

      {/* NEW RESERVATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowModal(false)}
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
                  className={`text-base font-semibold ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  Create New Reservation
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Book a room directly into the system.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg transition ${
                  theme
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-400 hover:text-slate-900 hover:bg-gray-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Meeting Room
                </label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
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

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sprint Planning Session"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Booker Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.booker_name}
                  onChange={(e) => setFormData({ ...formData, booker_name: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Notes & Special Requirements
                </label>
                <textarea
                  rows="2"
                  placeholder="Need whiteboard markers, catering, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    theme
                      ? "text-gray-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default BookingManagement;

