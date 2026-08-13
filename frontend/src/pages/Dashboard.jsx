import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner.jsx";
import { Clock, DoorOpen, Users, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

function Dashboard() {
  const { theme, toggleTheme } = useOutletContext();

  const [progress, setProgress] = useState(0);

  const totalRooms = 10;
  const occupiedRooms = 7;
  const occupancy = Math.round((occupiedRooms / totalRooms) * 100);

  const cardSummary = [
    {
      id: 1,
      total: 10,
      description: "Total Rooms",
      icon: <DoorOpen size={20} />,
      trend: null,
    },
    {
      id: 2,
      total: 7,
      description: "Occupied",
      icon: <Users size={20} />,
      trend: { value: "+2", up: true },
    },
    {
      id: 3,
      total: 3,
      description: "Available",
      icon: <DoorOpen size={20} />,
      trend: { value: "-2", up: false },
    },
  ];

  const upcomingBookings = [
    { id: 1, room: "Conference Room A", booker: "Jane Doe", time: "9:00 AM" },
    { id: 2, room: "Huddle Room 1", booker: "Mark Reyes", time: "2:00 PM" },
    { id: 3, room: "The Boardroom", booker: "Ana Cruz", time: "4:30 PM" },
  ];

  const roomStatus = [
    { id: 1, name: "Conference Room A", status: "In Use" },
    { id: 2, name: "Huddle Room 1", status: "Available" },
    { id: 3, name: "The Boardroom", status: "Available" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setProgress(occupancy), 100);
    return () => clearTimeout(timer);
  }, []);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <main className="w-full">
      <Banner header="Dashboard" theme={theme} toggleTheme={toggleTheme} />

      {/* Stat cards */}
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
              <div
                className={`p-2.5 rounded-lg ${
                  theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>
              {item.trend && (
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    item.trend.up
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {item.trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {item.trend.value}
                </span>
              )}
            </div>

            <h3
              className={`mt-4 text-3xl font-bold tracking-tight ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              {item.total}
            </h3>
            <p className={`text-sm mt-1 ${theme ? "text-gray-400" : "text-gray-500"}`}>
              {item.description}
            </p>

            {/* Decorative corner accent */}
            <div
              className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${
                theme ? "bg-blue-400" : "bg-blue-500"
              }`}
            />
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Occupancy — circular progress */}
        <section
          className={`rounded-xl border p-6 flex flex-col ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <h2 className={`text-base font-semibold ${theme ? "text-white" : "text-slate-900"}`}>
            Room occupancy
          </h2>
          <p className={`text-sm mt-1 mb-6 ${theme ? "text-gray-400" : "text-gray-500"}`}>
            {occupiedRooms} of {totalRooms} rooms currently in use
          </p>

          <div className="flex items-center justify-center gap-8 flex-1">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="10"
                  className={theme ? "stroke-slate-700" : "stroke-gray-100"}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className={`transition-all duration-700 ease-out ${
                    theme ? "stroke-blue-400" : "stroke-blue-500"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${theme ? "text-white" : "text-slate-900"}`}>
                  {progress}%
                </span>
                <span className={`text-xs ${theme ? "text-gray-400" : "text-gray-500"}`}>
                  occupied
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {roomStatus.map((room) => (
                <div key={room.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      room.status === "In Use" ? "bg-red-400" : "bg-green-400"
                    }`}
                  />
                  <span className={theme ? "text-gray-300" : "text-slate-700"}>{room.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming bookings */}
        <section
          className={`rounded-xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className={`text-base font-semibold ${theme ? "text-white" : "text-slate-900"}`}>
              Upcoming bookings
            </h2>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
              }`}
            >
              {upcomingBookings.length} today
            </span>
          </div>
          <p className={`text-sm mb-5 ${theme ? "text-gray-400" : "text-gray-500"}`}>
            Next scheduled reservations
          </p>

          <ul className="flex flex-col">
            {upcomingBookings.map((b, i) => (
              <li
                key={b.id}
                className={`flex items-center gap-3 py-3 ${
                  i !== upcomingBookings.length - 1
                    ? theme
                      ? "border-b border-slate-700"
                      : "border-b border-gray-100"
                    : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                    theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {b.booker.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${theme ? "text-white" : "text-slate-900"}`}>
                    {b.room}
                  </p>
                  <p className={`text-xs ${theme ? "text-gray-400" : "text-gray-500"}`}>
                    {b.booker}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium shrink-0 ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Clock size={13} />
                  {b.time}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;