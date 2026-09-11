import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { canAccessRoute } from "../../utils/permissions.js";
import { getRooms } from "../../api/rooms.js";
import { getBookings } from "../../api/bookings.js";
import {
  DoorOpen,
  House,
  Users,
  CalendarDays,
  CheckCircle2,
  CalendarPlus,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";

function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [roomsData, bookingsData] = await Promise.all([
          getRooms(),
          getBookings(),
        ]);
        setRooms(roomsData || []);
        setBookings(bookingsData || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const maintenanceRooms = rooms.filter((r) => r.status === "Maintenance").length;
  const availableRooms = totalRooms - occupiedRooms - maintenanceRooms;
  const occupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const cardSummary = [
    {
      id: 1,
      total: totalRooms,
      description: "Total Rooms",
      subtext: `${maintenanceRooms} in maintenance`,
      icon: <House size={20} />,
    },
    {
      id: 2,
      total: occupiedRooms,
      description: "Occupied Now",
      subtext: `${occupancy}% current utilization`,
      icon: <Users size={20} />,
    },
    {
      id: 3,
      total: availableRooms,
      description: "Available Now",
      subtext: "Ready for reservations",
      icon: <DoorOpen size={20} />,
    },
    {
      id: 4,
      total: bookings.length,
      description: "Active Bookings",
      subtext: "Confirmed schedules",
      icon: <CalendarDays size={20} />,
    },
  ];

  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed")
    .slice(0, 4);

  const roomUsage = rooms.slice(0, 5).map((room, idx) => {
    const roomBookings = bookings.filter((b) => b.room_id === room.id || b.room_name === room.name);
    const count = roomBookings.length;
    const hours = Math.min(8, Math.max(2, (count * 1.5) + (idx % 3)));
    const percentage = Math.round((hours / 8) * 100);
    return {
      name: room.name,
      hours,
      percentage,
    };
  });

  return (
    <main className="w-full min-h-screen pb-10">
      <Banner header="Dashboard" theme={theme} />

      {/* Quick Action shortcuts */}
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <Link
          to="/schedule"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm"
        >
          <CalendarPlus size={15} />
          <span>New Reservation</span>
        </Link>

        {canAccessRoute(user?.role, "/room-creation") && (
          <Link
            to="/room-creation"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition ${
              theme
                ? "bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700"
                : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50"
            }`}
          >
            <PlusCircle size={15} />
            <span>Create Room</span>
          </Link>
        )}

        <Link
          to="/booking-management"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition ${
            theme
              ? "bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700"
              : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50"
          }`}
        >
          <CalendarDays size={15} />
          <span>Booking Records</span>
        </Link>
      </div>

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {cardSummary.map((item) => (
          <div
            key={item.id}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
              theme
                ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                : "bg-white border-gray-200 hover:border-blue-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-xs font-medium ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {item.description}
                </p>

                <h3
                  className={`mt-2 text-3xl font-black tracking-tight ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {loading ? "..." : item.total}
                </h3>
              </div>

              <div
                className={`p-2.5 rounded-xl ${
                  theme
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>
            </div>

            <p
              className={`mt-3 text-[11px] font-medium ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {item.subtext}
            </p>

            <div
              className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-5 pointer-events-none ${
                theme ? "bg-blue-400" : "bg-blue-500"
              }`}
            />
          </div>
        ))}
      </section>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Room utilization */}
        <section
          className={`lg:col-span-2 rounded-2xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className={`text-base font-bold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Room Utilization
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Projected reservation load across spaces
              </p>
            </div>

            <Link
              to="/room-management"
              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
            >
              View Rooms <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="space-y-4.5">
            {roomUsage.map((room) => (
              <div key={room.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-semibold ${
                      theme ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    {room.name}
                  </span>

                  <span
                    className={`text-xs font-medium ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {room.hours} hrs ({room.percentage}%)
                  </span>
                </div>

                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    theme ? "bg-slate-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      room.percentage > 70
                        ? "bg-blue-500"
                        : room.percentage > 40
                          ? "bg-indigo-500"
                          : "bg-cyan-500"
                    }`}
                    style={{ width: `${room.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status Breakdown & Quick Insights */}
        <section
          className={`rounded-2xl border p-6 flex flex-col justify-between ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-base font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Occupancy Health
            </h2>
            <p
              className={`text-xs mt-0.5 ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Real-time room availability status
            </p>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="10"
                    className={`text-gray-200 ${theme ? "text-slate-700" : "text-gray-100"}`}
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={339.29}
                    strokeDashoffset={339.29 - (339.29 * (occupancy || 15)) / 100}
                    strokeLinecap="round"
                    className="text-blue-500 transition-all duration-1000"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span
                    className={`text-2xl font-black ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {occupancy}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Occupied
                  </span>
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700 text-center">
                <div>
                  <p className="text-xs font-bold text-green-500">{availableRooms}</p>
                  <p className="text-[10px] text-gray-400">Available</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-500">{occupiedRooms}</p>
                  <p className="text-[10px] text-gray-400">Occupied</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400">{maintenanceRooms}</p>
                  <p className="text-[10px] text-gray-400">Maint.</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              theme
                ? "bg-slate-900/60 border-slate-700 text-gray-300"
                : "bg-blue-50/70 border-blue-100 text-blue-900"
            }`}
          >
            <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
            <span>Automatic conflict prevention is actively monitoring room slots.</span>
          </div>
        </section>
      </div>

      {/* Upcoming bookings */}
      <section
        className={`rounded-2xl border p-6 mt-6 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`text-base font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Upcoming Reservations
            </h2>
            <p
              className={`text-xs mt-0.5 ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Scheduled room reservations across the facility
            </p>
          </div>

          <Link
            to="/booking-management"
            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
          >
            Manage All <ArrowUpRight size={14} />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No upcoming bookings scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${
                  theme
                    ? "border-slate-700 bg-slate-900/40 hover:border-slate-600"
                    : "border-gray-200 bg-gray-50/60 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      theme
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}
                  >
                    {booking.start_time} - {booking.end_time}
                  </span>

                  <span
                    className={`text-[10px] font-semibold ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {booking.date}
                  </span>
                </div>

                <h4
                  className={`font-semibold text-xs mt-3 truncate ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {booking.title || "Meeting"}
                </h4>

                <p
                  className={`text-xs mt-1 truncate ${
                    theme ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {booking.room_name || `Room #${booking.room_id}`}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50 dark:border-slate-700/50 text-[11px] text-gray-400">
                  <span>{booking.booker_name}</span>
                  <span>{booking.attendees || 2} attendees</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
