import { useState, useEffect, useRef } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import {
  Save,
  Building,
  Clock,
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Upload,
  Image,
  Phone,
  Mail,
  HelpCircle,
  Check,
  DoorOpen,
} from "lucide-react";
import { getSettings, fetchSettings, saveSettings, SETTINGS_UPDATED_EVENT } from "../../services/settingsService.js";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";
import { changePassword } from "../../api/users.js";

const PRESET_FAVICONS = [
  { label: "Default", url: "/favicon.svg", icon: "🚪" },
  { label: "Building", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏢</text></svg>", icon: "🏢" },
  { label: "Calendar", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📅</text></svg>", icon: "📅" },
  { label: "Rocket", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>", icon: "🚀" },
  { label: "Briefcase", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>", icon: "💼" },
  { label: "Lightning", url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>", icon: "⚡" },
];

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

  const [saving, setSaving] = useState(false);

  const faviconInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Selected image must be under 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSettings((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
      showToast(`${field === "faviconUrl" ? "Favicon" : "Logo"} loaded into preview! Click Save to apply.`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(settings);

      logAuditEvent({
        action: "Settings Updated",
        actor: user?.name || "Administrator",
        target: "System Branding & Policy Configuration",
        type: "settings",
      });

      addNotification({
        title: "System Branding & Settings Updated",
        message: `System name updated to "${settings.systemName || "SpaceSync"}". Changes applied across all client interfaces.`,
        type: "maintenance",
        targetRoles: ["Administrator", "Manager"],
      });

      showToast("Branding & system configuration updated successfully!");
    } catch (_err) {
      showToast("Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
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
        {/* Brand Identity & Visual Appearance */}
        <section
          className={`rounded-3xl border p-6 ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500" />
              <h3
                className={`text-sm font-semibold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Branding & Visual Identity
              </h3>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Live Dynamic Branding
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* System Name */}
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                System Name (Brand)
              </label>
              <input
                type="text"
                name="systemName"
                value={settings.systemName || ""}
                onChange={handleChange}
                placeholder="e.g. SpaceSync or Acme Portal"
                className={inputClass}
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Reflected in Navbar, Login, Sidebar, and Page Titles.
              </p>
            </div>

            {/* System Tagline */}
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                System Tagline
              </label>
              <input
                type="text"
                name="systemTagline"
                value={settings.systemTagline || ""}
                onChange={handleChange}
                placeholder="e.g. Workspace & Room Reservation"
                className={inputClass}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Appears in hero banners, browser tabs, and emails.
              </p>
            </div>
          </div>

          {/* Favicon Configuration */}
          <div className="mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
            <label
              className={`block text-xs font-medium mb-2 ${
                theme ? "text-gray-300" : "text-slate-700"
              }`}
            >
              Browser Tab Favicon
            </label>

            {/* Preset Favicons */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] text-gray-400 mr-1">Presets:</span>
              {PRESET_FAVICONS.map((p) => {
                const isSelected = (settings.faviconUrl || "/favicon.svg") === p.url;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, faviconUrl: p.url }))}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : theme
                        ? "bg-slate-900 border-slate-700 text-gray-300 hover:border-slate-500"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  name="faviconUrl"
                  value={settings.faviconUrl || ""}
                  onChange={handleChange}
                  placeholder="Paste image/icon URL (https://... or SVG Data URL)"
                  className={inputClass}
                />
              </div>

              <input
                type="file"
                ref={faviconInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "faviconUrl")}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer shrink-0 ${
                  theme
                    ? "bg-slate-900 border-slate-700 text-gray-200 hover:bg-slate-800"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Upload size={14} /> Upload Icon
              </button>
            </div>
          </div>

          {/* Custom Logo URL / Upload */}
          <div className="mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <label
                className={`block text-xs font-medium ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Custom Logo URL
              </label>
              {settings.logoUrl && (
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, logoUrl: "" }))}
                  className="text-[11px] text-red-400 hover:text-red-500 transition cursor-pointer"
                >
                  Reset to default icon
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                name="logoUrl"
                value={settings.logoUrl || ""}
                onChange={handleChange}
                placeholder="Optional logo image URL (e.g. https://... or uploaded logo)"
                className={inputClass}
              />

              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "logoUrl")}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer shrink-0 ${
                  theme
                    ? "bg-slate-900 border-slate-700 text-gray-200 hover:bg-slate-800"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Upload size={14} /> Upload Logo
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div
            className={`mt-5 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              theme ? "bg-slate-900/80 border-slate-700/80" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-sm">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <DoorOpen size={20} />
                )}
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>{settings.systemName || "SpaceSync"}</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                    Live Preview
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {settings.systemTagline || "Workspace & Room Reservation"}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] ${
                theme ? "bg-slate-800 border-slate-700 text-gray-300" : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <span className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                {settings.faviconUrl && settings.faviconUrl.startsWith("data:image/svg+xml") ? (
                  <span className="text-xs">
                    {PRESET_FAVICONS.find((p) => p.url === settings.faviconUrl)?.icon || "🏢"}
                  </span>
                ) : settings.faviconUrl ? (
                  <img src={settings.faviconUrl} alt="Favicon" className="w-3.5 h-3.5 object-contain" />
                ) : (
                  <span>🚪</span>
                )}
              </span>
              <span className="truncate max-w-[140px] font-medium">
                {settings.systemName || "SpaceSync"} — Tab
              </span>
            </div>
          </div>
        </section>

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
              Organization & Support Information
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
                value={settings.orgName || ""}
                onChange={handleChange}
                placeholder="e.g. Acme Corporation"
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
                value={settings.buildingName || ""}
                onChange={handleChange}
                placeholder="e.g. Headquarters Tower A"
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
                Support / Admin Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail || ""}
                onChange={handleChange}
                placeholder="admin@company.com"
                className={inputClass}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
                  theme ? "text-gray-300" : "text-slate-700"
                }`}
              >
                Support Hotline / Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone || ""}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
                className={inputClass}
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
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium shadow-sm transition cursor-pointer"
        >
          <Save size={16} /> {saving ? "Saving Changes..." : "Save Configuration"}
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

