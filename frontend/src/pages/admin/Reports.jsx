import { useState, useEffect, useMemo } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getRooms } from "../../api/rooms.js";
import { getBookings } from "../../api/bookings.js";
import { useToast } from "../../components/Toast.jsx";
import {
  filterBookingsByRange,
  calculateDurationHours,
  computeDemandMetrics,
} from "../../utils/analytics.js";
import {
  Download,
  Calendar,
  Clock,
  TrendingUp,
  PieChart,
} from "lucide-react";

function Reports() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [timeRange, setTimeRange] = useState("This Month");

  useEffect(() => {
    async function loadData() {
      const [r, b] = await Promise.all([getRooms(), getBookings()]);
      setRooms(r || []);
      setBookings(b || []);
    }
    loadData();
  }, []);

  // Filter bookings strictly by selected calendar window
  const periodBookings = useMemo(() => {
    return filterBookingsByRange(bookings, timeRange);
  }, [bookings, timeRange]);

  const totalBookings = periodBookings.length;
  const confirmedBookings = periodBookings.filter((b) => b.status === "confirmed").length;
  const cancelledBookings = periodBookings.filter((b) => b.status === "cancelled").length;
  const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  // Real calculated duration hours
  const totalHoursBooked = useMemo(() => {
    const total = periodBookings.reduce((sum, b) => {
      return sum + calculateDurationHours(b.start_time, b.end_time);
    }, 0);
    return Number(total.toFixed(1));
  }, [periodBookings]);

  const avgMeetingHours = totalBookings > 0 ? (totalHoursBooked / totalBookings).toFixed(1) : "0";

  // Dynamic peak demand metrics based on actual hours and days
  const demandMetrics = useMemo(() => {
    return computeDemandMetrics(periodBookings);
  }, [periodBookings]);

  const roomStats = useMemo(() => {
    return rooms.map((room) => {
      const roomBookings = periodBookings.filter(
        (b) => String(b.room_id) === String(room.id) || b.room_name === room.name
      );

      const totalHours = roomBookings.reduce((sum, b) => {
        return sum + calculateDurationHours(b.start_time, b.end_time);
      }, 0);

      const utilizationScore = totalBookings > 0
        ? Math.min(100, Math.round((roomBookings.length / totalBookings) * 100))
        : 0;

      return {
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        bookingCount: roomBookings.length,
        totalHours: Number(totalHours.toFixed(1)),
        utilizationScore,
      };
    });
  }, [rooms, periodBookings, totalBookings]);

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Reporting Period: ${timeRange}\n`;
    csvContent += "Room Name,Capacity,Location,Bookings Count,Total Hours,Demand Score\n";

    roomStats.forEach((r) => {
      csvContent += `"${r.name}",${r.capacity},"${r.location}",${r.bookingCount},${r.totalHours},${r.utilizationScore}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `confe_room_reports_${timeRange.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${timeRange} report as CSV!`);
  };

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Usage Reports & Analytics" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Utilization Analytics
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Insights into room reservation frequency, peak hours, and workspace demand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-xs font-medium outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-gray-50 border-gray-200 text-slate-700"
            }`}
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="All Time">All Time</option>
          </select>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: "Total Reservations",
            value: totalBookings,
            sub: `${confirmedBookings} confirmed`,
            icon: <Calendar size={18} />,
          },
          {
            label: "Total Hours Booked",
            value: `${totalHoursBooked}h`,
            sub: `Average meeting: ${avgMeetingHours}h`,
            icon: <Clock size={18} />,
          },
          {
            label: "Peak Demand Time",
            value: demandMetrics.peakHour,
            sub: demandMetrics.peakDays,
            icon: <TrendingUp size={18} />,
          },
          {
            label: "Cancellation Rate",
            value: `${cancellationRate}%`,
            sub: `${cancelledBookings} meetings cancelled`,
            icon: <PieChart size={18} />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 ${
              theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-2xl font-black ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {item.value}
              </span>
            </div>
            <p
              className={`text-xs mt-3 font-semibold ${
                theme ? "text-gray-200" : "text-slate-800"
              }`}
            >
              {item.label}
            </p>
            <p
              className={`text-[11px] mt-0.5 ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Room Breakdown Table */}
      <section
        className={`mt-6 rounded-3xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3
            className={`text-sm font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Facility Space Breakdown
          </h3>
          <span className="text-xs text-gray-400">
            Reporting period: {timeRange}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  theme
                    ? "border-slate-700 bg-slate-900/40 text-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <th className="py-3.5 px-6">Room Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Bookings</th>
                <th className="py-3.5 px-4">Estimated Hours</th>
                <th className="py-3.5 px-6">Demand Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
              {roomStats.map((room) => (
                <tr key={room.name} className="transition hover:bg-blue-500/5">
                  <td className="py-4 px-6 font-semibold">
                    <span className={theme ? "text-white" : "text-slate-900"}>
                      {room.name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{room.location}</td>
                  <td className="py-4 px-4">{room.capacity} seats</td>
                  <td className="py-4 px-4 font-bold text-blue-500">{room.bookingCount}</td>
                  <td className="py-4 px-4">{room.totalHours} hrs</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex-1 h-2 rounded-full overflow-hidden ${
                          theme ? "bg-slate-700" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.max(10, room.utilizationScore)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold w-8 text-right">
                        {room.utilizationScore}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Reports;

