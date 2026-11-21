import { useState, useEffect, useRef, useCallback } from "react";
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
  Laptop,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Layers,
  DollarSign,
  Music,
  Mic,
  Hotel,
} from "lucide-react";
import {
  getSettings,
  fetchSettings,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
  VENUE_PRESETS,
} from "../../services/settingsService.js";
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

const SETTINGS_SECTIONS = [
  { id: "business", label: "Business & Venue Mode", icon: <Layers size={14} /> },
  { id: "branding", label: "Branding & Identity", icon: <Sparkles size={14} /> },
  { id: "organization", label: "Organization & Contact", icon: <Building size={14} /> },
  { id: "policy", label: "Booking Policies", icon: <Clock size={14} /> },
  { id: "security", label: "Account Security", icon: <KeyRound size={14} /> },
];

function Settings() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState(() => getSettings());
  const [activeTab, setActiveTab] = useState("all");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const faviconInputRef = useRef(null);
  const logoInputRef = useRef(null);

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
    setIsDirty(true);
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
      setIsDirty(true);
      setSettings((prev) => ({
        ...prev,
        [field]: reader.result,
      }));
      showToast(`${field === "faviconUrl" ? "Favicon" : "Logo"} loaded into preview! Click Save to apply.`);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (presetKey) => {
    const preset = VENUE_PRESETS[presetKey];
    if (!preset) return;

    setIsDirty(true);
    setSettings((prev) => ({
      ...prev,
      venueType: preset.id,
      systemName: preset.systemName,
      systemTagline: preset.systemTagline,
      pricingEnabled: preset.pricingEnabled,
      currencySymbol: preset.currencySymbol,
    }));
    showToast(`Applied preset for ${preset.label}! Remember to click Save.`);
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(settings);
      setIsDirty(false);

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
  }, [settings, user?.name, showToast]);

  // Keyboard shortcut: Ctrl + S / Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

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
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
      : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
  }`;

  return (
    <div className="w-full pb-16">
      <Banner header="System Settings" theme={theme} />

      {/* Header bar & Section Filter Tabs */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800 border-slate-200">
        <div>
          <h2
            className={`text-lg font-bold tracking-tight ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            System & Brand Configuration
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Manage dynamic branding, facility identity, booking policies, and security credentials.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border dark:border-slate-700/80 border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeTab === "all"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Settings
          </button>
          {SETTINGS_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveTab(sec.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === sec.id
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {sec.icon}
              <span className="hidden md:inline">{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modern 2-Column Responsive Grid Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Forms (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 0. VENUE TYPE & INDUSTRY PRESETS */}
            {(activeTab === "all" || activeTab === "business") && (
              <section
                id="business"
                className={`rounded-3xl border p-6 sm:p-7 transition-all ${
                  theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          theme ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Business & Venue Mode Presets
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Adapt this booking platform to your business: KTV lounges, hotels, studios, or corporate spaces.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    1-Click Presets
                  </span>
                </div>

                {/* Industry Preset Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(VENUE_PRESETS).map((preset) => {
                    const isCurrent = (settings.venueType || "general") === preset.id;
                    const presetIcons = {
                      ktv: "🎤",
                      hotel: "🏨",
                      corporate: "🏢",
                      studio: "🎵",
                      general: "🌐",
                    };
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border transition text-left cursor-pointer relative ${
                          isCurrent
                            ? theme
                              ? "bg-purple-950/30 border-purple-500/60 ring-2 ring-purple-500/30"
                              : "bg-purple-50/70 border-purple-400 ring-2 ring-purple-400/20"
                            : theme
                            ? "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{presetIcons[preset.id] || "🏢"}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                              <Check size={11} /> Active
                            </span>
                          )}
                        </div>
                        <h4 className={`text-xs font-bold ${theme ? "text-white" : "text-slate-900"}`}>
                          {preset.label}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>{preset.pricingEnabled ? `Paid (${preset.currencySymbol})` : "Internal / Free"}</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">Apply →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial & Pricing Settings */}
                <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    <h4 className={`text-xs font-bold ${theme ? "text-white" : "text-slate-900"}`}>
                      Commercial Pricing & Currency
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Enable Pricing Toggle */}
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl border dark:border-slate-800 border-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <input
                        type="checkbox"
                        name="pricingEnabled"
                        checked={Boolean(settings.pricingEnabled)}
                        onChange={handleChange}
                        className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className={`font-semibold block ${theme ? "text-white" : "text-slate-900"}`}>
                          Enable Room Pricing & Rates
                        </span>
                        <span className={theme ? "text-gray-400" : "text-slate-500"}>
                          Display and compute hourly/nightly rates with total bill calculation on bookings.
                        </span>
                      </div>
                    </label>

                    {/* Currency Symbol */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${theme ? "text-gray-300" : "text-slate-700"}`}>
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        name="currencySymbol"
                        value={settings.currencySymbol || "$"}
                        onChange={handleChange}
                        placeholder="e.g. $, ₱, €, £, ¥"
                        maxLength={6}
                        className={inputClass}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Shown across room listings, booking checkout, and reports.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 1. BRANDING & VISUAL IDENTITY */}
            {(activeTab === "all" || activeTab === "branding") && (
              <section
                id="branding"
                className={`rounded-3xl border p-6 sm:p-7 transition-all ${
                  theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          theme ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Branding & Visual Identity
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Customize system name, slogans, favicon, and visual logos in real-time.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Live System Wide
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* System Name */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
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
                      Displayed on Navbar, Login, Sidebar, and Page Titles.
                    </p>
                  </div>

                  {/* System Tagline */}
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
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
                      Appears on browser tabs, login page, and hero banners.
                    </p>
                  </div>
                </div>

                {/* Favicon Configuration */}
                <div className="mt-5 pt-5 border-t border-slate-200/70 dark:border-slate-800">
                  <label
                    className={`block text-xs font-semibold mb-2 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Browser Tab Favicon
                  </label>

                  {/* Preset Favicons */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[11px] text-gray-400 mr-1">Quick Presets:</span>
                    {PRESET_FAVICONS.map((p) => {
                      const isSelected = (settings.faviconUrl || "/favicon.svg") === p.url;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setIsDirty(true);
                            setSettings((prev) => ({ ...prev, faviconUrl: p.url }));
                          }}
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
                          ? "bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Upload size={14} /> Upload Icon
                    </button>
                  </div>
                </div>

                {/* Custom Logo URL / Upload */}
                <div className="mt-5 pt-5 border-t border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className={`block text-xs font-semibold ${
                        theme ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      Custom Logo Image
                    </label>
                    {settings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDirty(true);
                          setSettings((prev) => ({ ...prev, logoUrl: "" }));
                        }}
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
                      placeholder="Optional logo image URL (e.g. https://... or uploaded image)"
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
                          ? "bg-slate-800 border-slate-700 text-gray-200 hover:bg-slate-700"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Upload size={14} /> Upload Logo
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 2. ORGANIZATION & SUPPORT INFORMATION */}
            {(activeTab === "all" || activeTab === "organization") && (
              <section
                id="organization"
                className={`rounded-3xl border p-6 sm:p-7 transition-all ${
                  theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Building size={18} />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        theme ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Organization & Facility Details
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Company metadata, campus address, and support desk contact channels.
                    </p>
                  </div>
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
                      value={settings.orgName || ""}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corporation"
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
                      Building / Campus Facility
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
                      className={`block text-xs font-semibold mb-1.5 ${
                        theme ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      Support / Helpdesk Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={settings.contactEmail || ""}
                      onChange={handleChange}
                      placeholder="support@company.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
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
            )}

            {/* 3. BOOKING POLICIES & CONSTRAINTS */}
            {(activeTab === "all" || activeTab === "policy") && (
              <section
                id="policy"
                className={`rounded-3xl border p-6 sm:p-7 transition-all ${
                  theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        theme ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Booking Window & Duration Policy
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Govern maximum reservation horizons, duration quotas, and turnover buffers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
                        theme ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      Advance Horizon (Days)
                    </label>
                    <input
                      type="number"
                      name="maxBookingDays"
                      min={1}
                      max={365}
                      value={settings.maxBookingDays}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Days ahead staff can book.</p>
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
                      min={1}
                      max={24}
                      value={settings.maxDurationHours}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Maximum hours per single session.</p>
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
                      min={0}
                      max={60}
                      value={settings.bufferMinutes}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Room reset & cleanup window.</p>
                  </div>
                </div>

                {/* System Rules & Conflict Strictness */}
                <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
                  <h4 className={`text-xs font-semibold ${theme ? "text-gray-300" : "text-slate-700"}`}>
                    Automations & Safeguards
                  </h4>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border dark:border-slate-800 border-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <input
                      type="checkbox"
                      name="emailReminders"
                      checked={settings.emailReminders}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${theme ? "text-white" : "text-slate-900"}`}>
                        Automated Reminder Notifications
                      </span>
                      <span className={theme ? "text-gray-400" : "text-slate-500"}>
                        Transmit alert notifications to meeting organizers 15 minutes before scheduled start time.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border dark:border-slate-800 border-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <input
                      type="checkbox"
                      name="conflictStrict"
                      checked={settings.conflictStrict}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className={`font-semibold block ${theme ? "text-white" : "text-slate-900"}`}>
                        Strict Conflict Exclusion
                      </span>
                      <span className={theme ? "text-gray-400" : "text-slate-500"}>
                        Enforce PostgreSQL exclusion constraints to strictly prohibit overlapping room reservations.
                      </span>
                    </div>
                  </label>
                </div>
              </section>
            )}

            {/* Mobile / Inline Save Button */}
            <div className="flex items-center justify-between pt-2 lg:hidden">
              <span className="text-xs text-gray-400">
                {isDirty ? "Unsaved changes pending" : "All changes up to date"}
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Save size={15} />
                <span>{saving ? "Saving..." : "Save Configuration"}</span>
              </button>
            </div>
          </form>

          {/* 4. ACCOUNT SECURITY & PASSWORD CHANGE */}
          {(activeTab === "all" || activeTab === "security") && (
            <section
              id="security"
              className={`rounded-3xl border p-6 sm:p-7 transition-all ${
                theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Administrative Account Security
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Update your personal password and manage secure access credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
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
                          ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-rose-400"
                          : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-rose-500"
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
                      className={`block text-xs font-semibold mb-1.5 ${
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
                            ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-rose-400"
                            : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-rose-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
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
                            ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-rose-400"
                            : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-rose-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <KeyRound size={15} />
                    <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* Right Column: Sticky Live Preview & Actions Panel (5 cols on lg, 4 cols on xl) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* 1. REALISTIC BROWSER MOCKUP (LIVE BRAND PREVIEW) */}
          <div
            className={`rounded-3xl border overflow-hidden shadow-md transition-all ${
              theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            {/* Mockup Browser Window Header */}
            <div className="px-4 py-3 bg-slate-200/70 dark:bg-slate-950/80 border-b border-slate-300/60 dark:border-slate-800 flex items-center justify-between">
              {/* Traffic light dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              </div>

              {/* URL Address Bar */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 dark:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-400 font-mono border border-slate-300/40 dark:border-slate-800 truncate max-w-[190px]">
                <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                <span className="truncate">https://app.company.com</span>
              </div>

              <div className="w-8" />
            </div>

            {/* Active Browser Tab Simulator */}
            <div className="px-4 pt-2 pb-1 bg-slate-100 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/80">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-white dark:bg-slate-900 border-t border-x border-slate-300/70 dark:border-slate-800 text-xs shadow-xs max-w-full">
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
                <span className="truncate max-w-[170px] text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {settings.systemName || "SpaceSync"} — {settings.systemTagline || "Workspace"}
                </span>
              </div>
            </div>

            {/* In-Browser Application Canvas Preview */}
            <div className="p-5 space-y-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Navbar Representation
              </div>

              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  theme ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      className="w-8 h-8 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <DoorOpen size={17} />
                    </div>
                  )}
                  <div className="truncate min-w-0">
                    <p className={`text-xs font-bold truncate ${theme ? "text-white" : "text-slate-900"}`}>
                      {settings.systemName || "SpaceSync"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {settings.buildingName || "Main Facility"}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                  Live
                </span>
              </div>

              {/* Tagline Banner Preview */}
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  theme ? "bg-blue-950/20 border-blue-900/40 text-blue-300" : "bg-blue-50/80 border-blue-200/80 text-blue-900"
                }`}
              >
                <span className="font-semibold block text-[11px] mb-0.5">Portal Subtitle</span>
                <span>{settings.systemTagline || "Modern Workspace & Room Reservation"}</span>
              </div>
            </div>
          </div>

          {/* 2. STICKY ACTION & STATUS PANEL */}
          <div
            className={`rounded-3xl border p-5 space-y-4 shadow-sm transition-all ${
              theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-tight">Configuration Status</span>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isDirty
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  }`}
                />
                {isDirty ? "Unsaved Changes" : "Up to Date"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b dark:border-slate-800 border-slate-100">
                <span className="text-gray-400">Database Engine</span>
                <span className="font-medium font-mono text-[11px]">PostgreSQL (Neon)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b dark:border-slate-800 border-slate-100">
                <span className="text-gray-400">Advance Limit</span>
                <span className="font-medium">{settings.maxBookingDays} days</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b dark:border-slate-800 border-slate-100">
                <span className="text-gray-400">Max Meeting</span>
                <span className="font-medium">{settings.maxDurationHours} hours</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-400">Conflict Guard</span>
                <span className="font-medium">{settings.conflictStrict ? "Strict Mode" : "Relaxed"}</span>
              </div>
            </div>

            {/* Primary Save Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} />
                <span>{saving ? "Saving Changes..." : "Save Configuration"}</span>
              </button>

              <div className="text-center text-[10px] text-gray-400">
                Quick save with <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Ctrl + S</kbd>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Settings;
