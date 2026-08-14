import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner.jsx";
import {
  Clock,
  DoorOpen,
  House,
  Users,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

function Dashboard() {
  const { theme, toggleTheme } = useOutletContext();

  const [progress, setProgress] = useState(0);

  const totalRooms = 10;
  const occupiedRooms = 8;
  const availableRooms = totalRooms - occupiedRooms;
  const occupancy = Math.round((occupiedRooms / totalRooms) * 100);

  const cardSummary = [
    {
      id: 1,
      total: totalRooms,
      description: "Total Rooms",
      icon: <House size={20} />,
    },
    {
      id: 2,
      total: occupiedRooms,
      description: "Occupied Now",
      icon: <Users size={20} />,
    },
    {
      id: 3,
      total: availableRooms,
      description: "Available Now",
      icon: <DoorOpen size={20} />,
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      room: "Conference Room A",
      booker: "Jane Doe",
      time: "9:00 AM",
    },
    {
      id: 2,
      room: "Huddle Room 1",
      booker: "Mark Reyes",
      time: "2:00 PM",
    },
    {
      id: 3,
      room: "The Boardroom",
      booker: "Ana Cruz",
      time: "4:30 PM",
    },
  ];

  const roomUsage = [
    { name: "Conference Room A", hours: 7, percentage: 78 },
    { name: "Huddle Room 1", hours: 5, percentage: 56 },
    { name: "The Boardroom", hours: 3, percentage: 34 },
    { name: "Training Room", hours: 2, percentage: 22 },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Booking created",
      description: "Jane Doe booked Conference Room A",
      time: "10 min ago",
      icon: <CalendarDays size={16} />,
    },
    {
      id: 2,
      title: "Room released",
      description: "Huddle Room 2 is now available",
      time: "25 min ago",
      icon: <CheckCircle2 size={16} />,
    },
    {
      id: 3,
      title: "Booking updated",
      description: "Ana Cruz changed the Boardroom schedule",
      time: "1 hr ago",
      icon: <Clock size={16} />,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setProgress(occupancy), 100);

    return () => clearTimeout(timer);
  }, [occupancy]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <main className="w-full">
      <Banner
        header="Dashboard"
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        {cardSummary.map((item) => (
          <div
            key={item.id}
            className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
              theme
                ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                : "bg-white border-gray-200 hover:border-blue-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`text-sm ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {item.description}
                </p>

                <h3
                  className={`mt-2 text-3xl font-bold tracking-tight ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {item.total}
                </h3>
              </div>

              <div
                className={`p-3 rounded-lg ${
                  theme
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>
            </div>

            <div
              className={`mt-4 flex items-center gap-1 text-xs ${
                theme ? "text-green-400" : "text-green-600"
              }`}
            >
              <TrendingUp size={14} />
              <span>Updated just now</span>
            </div>

            {/* Decorative accent */}
            <div
              className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-10 ${
                theme ? "bg-blue-400" : "bg-blue-500"
              }`}
            />
          </div>
        ))}
      </section>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        {/* Room utilization */}
        <section
          className={`lg:col-span-2 rounded-xl border p-6 ${
            theme
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className={`text-base font-semibold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Room utilization
              </h2>

              <p
                className={`text-sm mt-1 ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Usage across rooms today
              </p>
            </div>

            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                theme ? "text-green-400" : "text-green-600"
              }`}
            >
              <TrendingUp size={16} />
              12% this week
            </div>
          </div>

          <div className="space-y-5">
            {roomUsage.map((room) => (
              <div key={room.name}>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      theme ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    {room.name}
                  </span>

                  <span
                    className={`text-xs ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {room.hours} hrs
                  </span>
                </div>

                <div
                  className={`w-full h-2 rounded-full ${
                    theme ? "bg-slate-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      theme ? "bg-blue-400" : "bg-blue-500"
                    }`}
                    style={{ width: `${room.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's activity */}
        <section
          className={`rounded-xl border p-6 ${
            theme
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="mb-5">
            <h2
              className={`text-base font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Recent activity
            </h2>

            <p
              className={`text-sm mt-1 ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Latest room activity
            </p>
          </div>

          <div className="space-y-5">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    theme
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {activity.icon}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {activity.title}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {activity.description}
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      theme ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Upcoming bookings */}
      <section
        className={`rounded-xl border p-6 mt-6 ${
          theme
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2
              className={`text-base font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Upcoming bookings
            </h2>

            <p
              className={`text-sm mt-1 ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Today's scheduled reservations
            </p>
          </div>

          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              theme
                ? "bg-blue-500/10 text-blue-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {upcomingBookings.length} bookings
          </span>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {upcomingBookings.map((booking) => (
            <li
              key={booking.id}
              className={`rounded-lg border p-4 ${
                theme
                  ? "border-slate-700 bg-slate-900/30"
                  : "border-gray-100 bg-gray-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                    theme
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {booking.booker
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Clock size={13} />
                  {booking.time}
                </div>
              </div>

              <p
                className={`text-sm font-medium mt-4 ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {booking.room}
              </p>

              <p
                className={`text-xs mt-1 ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {booking.booker}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Dashboard;