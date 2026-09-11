import { useState, useEffect } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  Bell,
  CalendarDays,
  AlertTriangle,
  UserPlus,
  Trash2,
  Check,
} from "lucide-react";
import {
  getNotifications,
  markAllAsRead as apiMarkAllRead,
  clearAllNotifications,
  toggleNotificationRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from "../../services/notificationService.js";

function Notifications() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
  }, []);

  const markAllAsRead = () => {
    apiMarkAllRead();
    setNotifications(getNotifications());
    showToast("All notifications marked as read");
  };

  const clearAll = () => {
    if (notifications.length === 0) return;
    clearAllNotifications();
    setNotifications([]);
    showToast("All notifications cleared");
  };

  const toggleRead = (id) => {
    toggleNotificationRead(id);
    setNotifications(getNotifications());
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Notifications" theme={theme} />

      {/* Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Notification Center
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            System alerts, meeting reminders, and room status updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllAsRead}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              theme
                ? "bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700"
                : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50"
            }`}
          >
            <Check size={14} /> Mark All Read
          </button>

          <button
            type="button"
            onClick={clearAll}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold text-red-500 transition ${
              theme
                ? "bg-slate-800 border-slate-700 hover:bg-red-500/10"
                : "bg-white border-gray-200 hover:bg-red-50"
            }`}
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mt-6">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : theme
                ? "bg-slate-800 text-gray-400 hover:text-white"
                : "bg-gray-100 text-slate-600 hover:bg-gray-200"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === "unread"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : theme
                ? "bg-slate-800 text-gray-400 hover:text-white"
                : "bg-gray-100 text-slate-600 hover:bg-gray-200"
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications list */}
      <div className="mt-4 space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleRead(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              item.read
                ? theme
                  ? "bg-slate-800/60 border-slate-700/60 text-gray-400"
                  : "bg-white/60 border-gray-200/60 text-gray-500"
                : theme
                  ? "bg-slate-800 border-slate-600 shadow-md"
                  : "bg-white border-blue-200 shadow-sm"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                item.type === "booking"
                  ? "bg-blue-500/15 text-blue-500"
                  : item.type === "maintenance"
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-purple-500/15 text-purple-500"
              }`}
            >
              {item.type === "booking" && <CalendarDays size={18} />}
              {item.type === "maintenance" && <AlertTriangle size={18} />}
              {item.type === "user" && <UserPlus size={18} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    item.read
                      ? theme ? "text-gray-300" : "text-slate-700"
                      : theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {item.title}
                </h4>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
              <p className="text-xs mt-1 leading-relaxed">{item.message}</p>
            </div>

            {!item.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            className={`p-12 text-center rounded-3xl border ${
              theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            }`}
          >
            <Bell size={32} className="mx-auto text-gray-400 mb-2" />
            <h4
              className={`text-sm font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              No notifications
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              You are all caught up on alerts and updates!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;

