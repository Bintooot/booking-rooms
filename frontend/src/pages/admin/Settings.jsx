import { useState } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import { Save, Building, Clock, Shield } from "lucide-react";
import { getSettings, saveSettings } from "../../services/settingsService.js";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";

function Settings() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [settings, setSettings] = useState(() => getSettings());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings(settings);

    logAuditEvent({
      action: "Settings Updated",
      actor: "Administrator",
      target: "System Policy Configuration",
      type: "settings",
    });

    addNotification({
      title: "System Configuration Updated",
      message: `Updated booking policy: Max duration ${settings.maxDurationHours}h, advance window ${settings.maxBookingDays} days.`,
      type: "maintenance",
    });

    showToast("Settings updated and applied system-wide!");
  };

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-xs outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="System Settings" theme={theme} />

      <div className="mt-6">
        <h2
          className={`text-lg font-bold ${
            theme ? "text-white" : "text-slate-900"
          }`}
        >
          General Configuration
        </h2>
        <p
          className={`text-xs mt-0.5 ${
            theme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Manage organizational policies, booking constraints, and system behaviors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-3xl">
        {/* Organization Information */}
        <section
          className={`rounded-3xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building size={18} className="text-blue-500" />
            <h3
              className={`text-sm font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Organization Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Organization Name
              </label>
              <input
                type="text"
                name="orgName"
                value={settings.orgName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Building / Facility Name
              </label>
              <input
                type="text"
                name="buildingName"
                value={settings.buildingName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>
        </section>

        {/* Booking Constraints */}
        <section
          className={`rounded-3xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-blue-500" />
            <h3
              className={`text-sm font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Booking Window & Duration Policy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Max Advance Days
              </label>
              <input
                type="number"
                name="maxBookingDays"
                value={settings.maxBookingDays}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Max Meeting Duration (Hours)
              </label>
              <input
                type="number"
                name="maxDurationHours"
                value={settings.maxDurationHours}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Buffer Interval (Minutes)
              </label>
              <input
                type="number"
                name="bufferMinutes"
                value={settings.bufferMinutes}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>
        </section>

        {/* System Rules */}
        <section
          className={`rounded-3xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-blue-500" />
            <h3
              className={`text-sm font-bold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Automation & Policies
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="emailReminders"
                checked={settings.emailReminders}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span
                className={`text-xs font-medium ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Send automatic email reminder 15 minutes before scheduled meetings
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="conflictStrict"
                checked={settings.conflictStrict}
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span
                className={`text-xs font-medium ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Strictly prohibit overlapping bookings without administrative override
              </span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
        >
          <Save size={16} /> Save Configuration
        </button>
      </form>
    </main>
  );
}

export default Settings;

