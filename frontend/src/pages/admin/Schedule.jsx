import { useOutletContext } from "react-router-dom";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  MapPin,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

function Schedule() {
  const { theme } = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 14));

  const [roomFilter, setRoomFilter] = useState("All Rooms");

  const rooms = [
    "Conference Room A",
    "Huddle Room 1",
    "The Boardroom",
    "Meeting Room B",
  ];

  const bookings = [
    {
      id: 1,
      date: "2026-08-03",
      title: "Project Planning",
      room: "Conference Room A",
      booker: "Jane Doe",
      start: "09:00",
      end: "10:30",
      attendees: 8,
      color: "blue",
    },
    {
      id: 2,
      date: "2026-08-05",
      title: "Marketing Sync",
      room: "Huddle Room 1",
      booker: "Mark Reyes",
      start: "10:00",
      end: "11:00",
      attendees: 5,
      color: "purple",
    },
    {
      id: 3,
      date: "2026-08-07",
      title: "Management Meeting",
      room: "The Boardroom",
      booker: "Ana Cruz",
      start: "11:30",
      end: "13:00",
      attendees: 12,
      color: "green",
    },
    {
      id: 4,
      date: "2026-08-10",
      title: "Client Presentation",
      room: "Conference Room A",
      booker: "John Smith",
      start: "13:30",
      end: "15:00",
      attendees: 10,
      color: "orange",
    },
    {
      id: 5,
      date: "2026-08-12",
      title: "Team Discussion",
      room: "Meeting Room B",
      booker: "Maria Santos",
      start: "14:00",
      end: "15:30",
      attendees: 6,
      color: "pink",
    },
    {
      id: 6,
      date: "2026-08-14",
      title: "Design Review",
      room: "Conference Room A",
      booker: "Jane Doe",
      start: "09:00",
      end: "10:00",
      attendees: 7,
      color: "blue",
    },
    {
      id: 7,
      date: "2026-08-14",
      title: "One-on-One",
      room: "Huddle Room 1",
      booker: "Mark Reyes",
      start: "13:00",
      end: "14:00",
      attendees: 2,
      color: "purple",
    },
    {
      id: 8,
      date: "2026-08-18",
      title: "Quarterly Meeting",
      room: "The Boardroom",
      booker: "Ana Cruz",
      start: "09:00",
      end: "11:30",
      attendees: 15,
      color: "green",
    },
    {
      id: 9,
      date: "2026-08-20",
      title: "Product Meeting",
      room: "Meeting Room B",
      booker: "John Smith",
      start: "14:00",
      end: "15:00",
      attendees: 6,
      color: "orange",
    },
    {
      id: 10,
      date: "2026-08-24",
      title: "Team Planning",
      room: "Conference Room A",
      booker: "Maria Santos",
      start: "10:00",
      end: "11:30",
      attendees: 9,
      color: "pink",
    },
    {
      id: 11,
      date: "2026-08-27",
      title: "Client Meeting",
      room: "The Boardroom",
      booker: "Jane Doe",
      start: "13:00",
      end: "14:30",
      attendees: 11,
      color: "blue",
    },
    {
      id: 12,
      date: "2026-08-31",
      title: "Monthly Review",
      room: "Conference Room A",
      booker: "Ana Cruz",
      start: "09:30",
      end: "11:00",
      attendees: 8,
      color: "purple",
    },
  ];

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /*
   * Sunday = 0
   * Monday = 1
   */
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const previousMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: previousMonthDays - i,
      currentMonth: false,
      date: new Date(year, month - 1, previousMonthDays - i),
    });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      currentMonth: true,
      date: new Date(year, month, day),
    });
  }

  // Next month
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
    if (roomFilter === "All Rooms") {
      return bookings;
    }

    return bookings.filter((booking) => booking.room === roomFilter);
  }, [roomFilter]);

  const getBookingsForDate = (date) => {
    const key = formatDateKey(date);

    return filteredBookings.filter((booking) => booking.date === key);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getBookingColor = (color) => {
    const styles = {
      blue: theme
        ? "bg-blue-500/15 text-blue-300 border-blue-500/20"
        : "bg-blue-50 text-blue-700 border-blue-100",

      purple: theme
        ? "bg-purple-500/15 text-purple-300 border-purple-500/20"
        : "bg-purple-50 text-purple-700 border-purple-100",

      green: theme
        ? "bg-green-500/15 text-green-300 border-green-500/20"
        : "bg-green-50 text-green-700 border-green-100",

      orange: theme
        ? "bg-orange-500/15 text-orange-300 border-orange-500/20"
        : "bg-orange-50 text-orange-700 border-orange-100",

      pink: theme
        ? "bg-pink-500/15 text-pink-300 border-pink-500/20"
        : "bg-pink-50 text-pink-700 border-pink-100",
    };

    return styles[color];
  };

  const isToday = (date) => {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  return (
    <main className="w-full min-h-screen">
      <Banner header="Schedule" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-semibold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Booking Calendar
          </h2>

          <p
            className={`text-sm mt-1 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            View and monitor room reservations by date.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
        >
          <Plus size={17} />
          New Booking
        </button>
      </div>

      {/* Calendar Controls */}
      <section
        className={`mt-6 rounded-xl border p-4 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month navigation */}
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
              <ChevronLeft size={19} />
            </button>

            <h2
              className={`min-w-45 text-center text-lg font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              {monthName}
            </h2>

            <button
              type="button"
              onClick={goToNextMonth}
              className={`p-2 rounded-lg transition ${
                theme
                  ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-slate-900"
              }`}
            >
              <ChevronRight size={19} />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className={`ml-2 px-3 py-2 rounded-lg text-xs font-medium ${
                theme
                  ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200"
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
              className={`rounded-lg border px-3 py-2 text-sm outline-none ${
                theme
                  ? "bg-slate-900 border-slate-700 text-gray-200"
                  : "bg-gray-50 border-gray-200 text-slate-700"
              }`}
            >
              <option>All Rooms</option>

              {rooms.map((room) => (
                <option key={room}>{room}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section
        className={`mt-4 rounded-xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Week days */}
        <div className="grid grid-cols-7">
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
              className={`py-3 px-2 text-center text-xs font-semibold border-b border-r last:border-r-0 ${
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

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((calendarDay, index) => {
            const dayBookings = getBookingsForDate(calendarDay.date);

            return (
              <div
                key={`${formatDateKey(calendarDay.date)}-${index}`}
                className={`relative min-h-33.75 p-2 border-b border-r ${
                  theme ? "border-slate-700" : "border-gray-200"
                } ${
                  !calendarDay.currentMonth
                    ? theme
                      ? "bg-slate-900/30"
                      : "bg-gray-50/60"
                    : ""
                }`}
              >
                {/* Date number */}
                <div className="flex justify-between items-start">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                      isToday(calendarDay.date)
                        ? "bg-blue-500 text-white"
                        : calendarDay.currentMonth
                          ? theme
                            ? "text-gray-300"
                            : "text-slate-700"
                          : theme
                            ? "text-gray-600"
                            : "text-gray-300"
                    }`}
                  >
                    {calendarDay.day}
                  </span>

                  {dayBookings.length > 0 && (
                    <span
                      className={`text-[10px] ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {dayBookings.length}
                    </span>
                  )}
                </div>

                {/* Bookings */}
                <div className="mt-2 space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <button
                      type="button"
                      key={booking.id}
                      title={`${booking.title} • ${booking.room} • ${booking.start} - ${booking.end}`}
                      className={`w-full text-left border rounded-md px-2 py-1.5 transition hover:shadow-sm ${getBookingColor(
                        booking.color,
                      )}`}
                    >
                      <p className="text-[10px] font-semibold truncate">
                        {booking.title}
                      </p>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] opacity-75">
                          {booking.start}
                        </span>

                        <span className="text-[9px] opacity-50">•</span>

                        <span className="text-[9px] opacity-75 truncate">
                          {booking.room}
                        </span>
                      </div>
                    </button>
                  ))}

                  {dayBookings.length > 3 && (
                    <button
                      type="button"
                      className={`text-[10px] font-medium px-1 ${
                        theme
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      +{dayBookings.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-4">
        <span
          className={`text-xs font-medium ${
            theme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Booking types
        </span>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span
            className={`text-xs ${theme ? "text-gray-500" : "text-gray-400"}`}
          >
            Reservation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span
            className={`text-xs ${theme ? "text-gray-500" : "text-gray-400"}`}
          >
            Meeting
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span
            className={`text-xs ${theme ? "text-gray-500" : "text-gray-400"}`}
          >
            Management
          </span>
        </div>
      </div>
    </main>
  );
}

export default Schedule;
