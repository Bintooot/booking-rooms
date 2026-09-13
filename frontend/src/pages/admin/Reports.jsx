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
  computeOvertimeMetrics,
} from "../../utils/analytics.js";
import { getBookingTimingState } from "../../utils/overtime.js";
import {
  Download,
  Calendar,
  Clock,
  TrendingUp,
  PieChart,
  AlertTriangle,
} from "lucide-react";

function Reports() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [timeRange, setTimeRange] = useState("This Month");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time ticker to keep overtime calculations synchronized
  useEffect(() => {
    const ticker = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(ticker);
  }, []);

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

  // Real scheduled duration hours
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

  // Real-time overtime aggregation across the reporting window
  const overtimeMetrics = useMemo(() => {
    return computeOvertimeMetrics(periodBookings, currentTime);
  }, [periodBookings, currentTime]);

  const roomStats = useMemo(() => {
    return rooms.map((room) => {
      const roomBookings = periodBookings.filter(
        (b) => String(b.room_id) === String(room.id) || b.room_name === room.name
      );

      let scheduledHours = 0;
      let overtimeHours = 0;

      roomBookings.forEach((b) => {
        const timing = getBookingTimingState(b, currentTime);
        scheduledHours += timing.scheduledHours;
        overtimeHours += timing.overtimeHours;
      });

      const totalHours = Number((scheduledHours + overtimeHours).toFixed(1));

      const utilizationScore = totalBookings > 0
        ? Math.min(100, Math.round((roomBookings.length / totalBookings) * 100))
        : 0;

      return {
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        bookingCount: roomBookings.length,
        scheduledHours: Number(scheduledHours.toFixed(1)),
        overtimeHours: Number(overtimeHours.toFixed(1)),
        totalHours,
        utilizationScore,
      };
    });
  }, [rooms, periodBookings, totalBookings, currentTime]);

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Reporting Period: ${timeRange}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += "Room Name,Capacity,Location,Bookings Count,Scheduled Hours,Overtime Hours,Total Utilized Hours,Demand Score\n";

    roomStats.forEach((r) => {
      csvContent += `"${r.name}",${r.capacity},"${r.location}",${r.bookingCount},${r.scheduledHours},${r.overtimeHours},${r.totalHours},${r.utilizationScore}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `spacesync_room_reports_${timeRange.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {[
          {
            label: "Total Reservations",
            value: totalBookings,
            sub: `${confirmedBookings} confirmed`,
            icon: <Calendar size={18} />,
            alert: false,
          },
          {
            label: "Scheduled Hours",
            value: `${totalHoursBooked}h`,
            sub: `Avg: ${avgMeetingHours}h / meeting`,
            icon: <Clock size={18} />,
            alert: false,
          },
          {
            label: "Overtime Recorded",
            value: `${overtimeMetrics.totalOvertimeHours}h`,
            sub:
              overtimeMetrics.overtimeIncidents > 0
                ? `${overtimeMetrics.overtimeIncidents} overrun ${
                    overtimeMetrics.overtimeIncidents === 1 ? "incident" : "incidents"
                  }`
                : "No overruns recorded",
            icon: <AlertTriangle size={18} />,
            alert: overtimeMetrics.totalOvertimeHours > 0,
          },
          {
            label: "Peak Demand Time",
            value: demandMetrics.peakHour,
            sub: demandMetrics.peakDays,
            icon: <TrendingUp size={18} />,
            alert: false,
          },
          {
            label: "Cancellation Rate",
            value: `${cancellationRate}%`,
            sub: `${cancelledBookings} meetings cancelled`,
            icon: <PieChart size={18} />,
            alert: false,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 ${
              item.alert
                ? theme
                  ? "bg-rose-950/20 border-rose-500/40"
                  : "bg-rose-50/70 border-rose-200"
                : theme
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  item.alert
                    ? "bg-rose-500/20 text-rose-500"
                    : theme
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-2xl font-black ${
                  item.alert
                    ? "text-rose-600 dark:text-rose-400"
                    : theme
                      ? "text-white"
                      : "text-slate-900"
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
                item.alert
                  ? "text-rose-500 dark:text-rose-400 font-medium"
                  : theme
                    ? "text-gray-400"
                    : "text-gray-500"
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
                <th className="py-3.5 px-5">Room Name</th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3">Capacity</th>
                <th className="py-3.5 px-3">Bookings</th>
                <th className="py-3.5 px-3">Scheduled</th>
                <th className="py-3.5 px-3">Overtime</th>
                <th className="py-3.5 px-3">Total Utilized</th>
                <th className="py-3.5 px-5">Demand Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
              {roomStats.map((room) => (
                <tr key={room.name} className="transition hover:bg-blue-500/5">
                  <td className="py-4 px-5 font-semibold">
                    <span className={theme ? "text-white" : "text-slate-900"}>
                      {room.name}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-gray-400">{room.location}</td>
                  <td className="py-4 px-3">{room.capacity} seats</td>
                  <td className="py-4 px-3 font-bold text-blue-500">{room.bookingCount}</td>
                  <td className="py-4 px-3 text-slate-600 dark:text-gray-300">{room.scheduledHours}h</td>
                  <td className="py-4 px-3">
                    {room.overtimeHours > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 font-mono">
                        +{room.overtimeHours}h
                      </span>
                    ) : (
                      <span className="text-gray-400 font-mono">0.0h</span>
                    )}
                  </td>
                  <td className="py-4 px-3 font-bold">{room.totalHours}h</td>
                  <td className="py-4 px-5">
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

