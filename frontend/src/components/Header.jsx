import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { getUnreadCount, NOTIFICATIONS_UPDATED_EVENT } from "../services/notificationService.js";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  CalendarPlus,
  DoorOpen,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/room-management": "Room Management",
  "/room-creation": "Create Room",
  "/booking-management": "Booking Management",
  "/schedule": "Schedule Calendar",
  "/user-management": "User Management",
  "/user-creation": "Create User",
  "/reports": "Usage Reports",
  "/notifications": "Notifications",
  "/audit-logs": "Audit Logs",
  "/roles-permissions": "Roles & Permissions",
  "/settings": "System Settings",
};

function Header({ onToggleMobileSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount(user));

  useEffect(() => {
    setUnreadCount(getUnreadCount(user));
  }, [user]);

  useEffect(() => {
    const handleNotifUpdate = () => setUnreadCount(getUnreadCount(user));
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotifUpdate);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotifUpdate);
  }, [user]);

  const currentTitle = useMemo(() => {
    const match = ROUTE_TITLES[location.pathname];
    if (match) return match;
    for (const [path, title] of Object.entries(ROUTE_TITLES)) {
      if (path !== "/" && location.pathname.startsWith(path)) return title;
    }
    return settings?.systemName || "SpaceSync";
  }, [location.pathname]);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header
      className={`h-16 px-4 sm:px-6 border-b shrink-0 flex items-center justify-between transition-colors z-30 ${
        theme
          ? "bg-slate-900/95 border-slate-800/90 backdrop-blur-md"
          : "bg-white/95 border-slate-200/90 backdrop-blur-md shadow-2xs"
      }`}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
          className={`lg:hidden p-2 rounded-xl transition cursor-pointer ${
            theme
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            to="/dashboard"
            className={`font-medium transition hover:text-blue-500 hidden sm:inline-flex items-center gap-1.5 ${
              theme ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {settings.systemName || "SpaceSync"}
          </Link>
          <ChevronRight
            size={14}
            className={`hidden sm:inline-block ${theme ? "text-slate-600" : "text-slate-400"}`}
          />
          <span
            className={`font-semibold tracking-tight text-sm ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            {currentTitle}
          </span>
        </nav>

        {/* Active Campus/Building Pill */}
        {settings.buildingName && (
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ml-2 ${
              theme
                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
            }`}
          >
            <Building2 size={12} className="text-blue-500" />
            <span className="truncate max-w-[160px]">{settings.buildingName}</span>
          </span>
        )}
      </div>

      {/* Right: Quick Actions, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Booking Button */}
        <Link
          to="/booking-management"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition active:scale-[0.98]"
        >
          <CalendarPlus size={14} />
          <span className="hidden sm:inline">Book Space</span>
        </Link>

        {/* Notifications Icon Button */}
        <Link
          to="/notifications"
          title="Notifications"
          className={`relative p-2 rounded-xl transition cursor-pointer ${
            theme
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Modern Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
          className={`p-2 rounded-xl transition cursor-pointer ${
            theme
              ? "text-amber-400 hover:bg-slate-800 hover:text-amber-300"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {theme ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Divider */}
        <div className={`h-6 w-px ${theme ? "bg-slate-800" : "bg-slate-200"}`} />

        {/* User Profile Pill */}
        <Link
          to="/settings"
          title="Manage Account"
          className={`flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-xl transition cursor-pointer ${
            theme
              ? "hover:bg-slate-800 text-slate-200"
              : "hover:bg-slate-100 text-slate-800"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs ${
              theme
                ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white"
                : "bg-linear-to-br from-blue-600 to-indigo-700 text-white"
            }`}
          >
            {userInitials}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold truncate max-w-[110px]">
              {user?.name || "Administrator"}
            </span>
            <span className={`text-[10px] ${theme ? "text-slate-400" : "text-slate-500"}`}>
              {user?.role || "Employee"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Header;
