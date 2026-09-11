import { useState, useEffect } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import { Search, Download, Trash2 } from "lucide-react";
import {
  getAuditLogs,
  clearAuditLogs,
  exportAuditLogsCSV,
  AUDIT_UPDATED_EVENT,
} from "../../services/auditService.js";

function AuditLogs() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [logs, setLogs] = useState(() => getAuditLogs());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const handleUpdate = () => {
      setLogs(getAuditLogs());
    };
    window.addEventListener(AUDIT_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(AUDIT_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all audit logs? This cannot be undone.")) {
      clearAuditLogs();
      setLogs([]);
      showToast("Audit logs cleared successfully.", "info");
    }
  };

  const handleExport = () => {
    exportAuditLogsCSV();
    showToast("Audit trail exported as CSV.");
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Audit Logs" theme={theme} />

      {/* Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            System Activity Log
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Chronological record of administrative actions and security events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={logs.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              theme
                ? "bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700"
                : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50"
            } disabled:opacity-40 cursor-pointer`}
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={logs.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold text-red-500 transition ${
              theme
                ? "bg-slate-800 border-slate-700 hover:bg-red-500/10"
                : "bg-white border-gray-200 hover:bg-red-50"
            } disabled:opacity-40 cursor-pointer`}
          >
            <Trash2 size={14} /> Clear Logs
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <section
        className={`mt-6 rounded-2xl border p-4 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                theme ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs outline-none transition ${
                theme
                  ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  : "bg-gray-50 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-400"
              }`}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`rounded-xl border px-3 py-2 text-xs font-medium outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-gray-50 border-gray-200 text-slate-700"
            }`}
          >
            <option value="all">All Event Types</option>
            <option value="booking">Bookings</option>
            <option value="room">Rooms</option>
            <option value="user">Users</option>
            <option value="auth">Authentication</option>
          </select>
        </div>
      </section>

      {/* Logs Table */}
      <section
        className={`mt-6 rounded-3xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
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
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="transition hover:bg-blue-500/5">
                  <td className="py-4 px-5 text-gray-400 font-mono text-[11px]">
                    {log.displayTime || log.timestamp}
                  </td>
                  <td className="py-4 px-4 font-semibold">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.type === "room"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : log.type === "booking"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : log.type === "user"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-slate-700 text-gray-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">
                    <span className={theme ? "text-white" : "text-slate-900"}>
                      {log.actor}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400 font-medium">
                    {log.target}
                  </td>
                  <td className="py-4 px-5 text-right text-gray-400 font-mono text-[11px]">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-xs text-gray-400">
            No audit logs found matching your criteria.
          </div>
        )}
      </section>
    </main>
  );
}

export default AuditLogs;

