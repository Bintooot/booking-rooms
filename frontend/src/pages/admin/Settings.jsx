import { useState, useEffect } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import { Save, Building, Clock, Shield, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { getSettings, fetchSettings, saveSettings, SETTINGS_UPDATED_EVENT } from "../../services/settingsService.js";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";
import { changePassword } from "../../api/users.js";

function Settings() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    fetchSettings().then((fresh) => {
      if (fresh) setSettings(fresh);
    });

    const handleUpdate = (e) => {
      if (e.detail) setSettings(e.detail);
      else setSettings(getSettings());
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
  }, []);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      targetRoles: ["Administrator", "Manager"],
    });

    showToast("Settings updated and applied system-wide!");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      logAuditEvent({
        action: "Password Changed",
        actor: user?.name || "User",
        target: "Account Security Credentials",
        type: "user",
      });

      addNotification({
        title: "Password Updated",
        message: "Your personal login password was updated successfully.",
        type: "security",
        targetUserId: user?.id,
        targetEmail: user?.email,
      });

      showToast("Your password was updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Failed to update password.", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-xs outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="System Settings" theme={theme} />

      <div className="mt-6">
        <h2
          className={`text-lg font-semibold ${
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
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building size={18} className="text-blue-500" />
            <h3
              className={`text-sm font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Organization Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
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
                className={`block text-xs font-medium mb-1.5 ${
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
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-blue-500" />
            <h3
              className={`text-sm font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Booking Window & Duration Policy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
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
                className={`block text-xs font-medium mb-1.5 ${
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
                className={`block text-xs font-medium mb-1.5 ${
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
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-blue-500" />
            <h3
              className={`text-sm font-semibold ${
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
                className={`text-xs font-normal ${
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
                className={`text-xs font-normal ${
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
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition cursor-pointer"
        >
          <Save size={16} /> Save Configuration
        </button>
      </form>

      {/* Account Security & Password Change */}
      <div className="mt-12 max-w-3xl">
        <h2
          className={`text-lg font-semibold ${
            theme ? "text-white" : "text-slate-900"
          }`}
        >
          Account Security
        </h2>
        <p
          className={`text-xs mt-0.5 ${
            theme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Update your personal password and safeguard your administrative credentials.
        </p>

        <section
          className={`mt-4 rounded-3xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={18} className="text-amber-500" />
            <h3
              className={`text-sm font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Change Your Password
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Current Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className={`w-full rounded-xl border pl-10 pr-10 py-2.5 text-xs outline-none transition ${
                    theme
                      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-amber-400"
                      : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none transition ${
                      theme
                        ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-amber-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-amber-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none transition ${
                      theme
                        ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-amber-400"
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-amber-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <KeyRound size={15} />
                <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Settings;

