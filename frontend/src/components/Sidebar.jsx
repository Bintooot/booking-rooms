import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HousePlus,
  UserPlus,
  PanelLeftClose,
  DoorOpen,
  CalendarDays,
  ClipboardList,
  Users,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { canAccessRoute } from "../utils/permissions.js";
import { getUnreadCount, NOTIFICATIONS_UPDATED_EVENT } from "../services/notificationService.js";

function Sidebar({ theme, mobileOpen = false, setMobileOpen = () => {} }) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [permVersion, setPermVersion] = useState(0);
  const [unreadCount, setUnreadCount] = useState(() => getUnreadCount(user));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setUnreadCount(getUnreadCount(user));
  }, [user]);

  useEffect(() => {
    const handlePermUpdate = () => setPermVersion((v) => v + 1);
    const handleNotifUpdate = () => setUnreadCount(getUnreadCount(user));

    window.addEventListener("confe_permissions_updated", handlePermUpdate);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotifUpdate);

    return () => {
      window.removeEventListener("confe_permissions_updated", handlePermUpdate);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotifUpdate);
    };
  }, [user]);

  // Close mobile drawer when route changes
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  function toggleShrink() {
    setIsCollapsed((prev) => !prev);
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navSections = [
    {
      title: "Overview",
      items: [
        {
          icon: <LayoutDashboard size={18} />,
          path: "/dashboard",
          label: "Dashboard",
        },
      ],
    },
    {
      title: "Rooms",
      items: [
        {
          icon: <DoorOpen size={18} />,
          path: "/room-management",
          label: "Room Management",
        },
        {
          icon: <HousePlus size={18} />,
          path: "/room-creation",
          label: "Room Creation",
        },
      ],
    },
    {
      title: "Bookings",
      items: [
        {
          icon: <ClipboardList size={18} />,
          path: "/booking-management",
          label: "Booking Management",
        },
        {
          icon: <CalendarDays size={18} />,
          path: "/schedule",
          label: "Schedule Calendar",
        },
      ],
    },
    {
      title: "Users",
      items: [
        {
          icon: <Users size={18} />,
          path: "/user-management",
          label: "User Management",
        },
        {
          icon: <UserPlus size={18} />,
          path: "/user-creation",
          label: "User Creation",
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          icon: <BarChart3 size={18} />,
          path: "/reports",
          label: "Usage Reports",
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          icon: <Bell size={18} />,
          path: "/notifications",
          label: "Notifications",
        },
        {
          icon: <History size={18} />,
          path: "/audit-logs",
          label: "Audit Logs",
        },
        {
          icon: <ShieldCheck size={18} />,
          path: "/roles-permissions",
          label: "Roles & Permissions",
        },
        {
          icon: <Settings size={18} />,
          path: "/settings",
          label: "System Settings",
        },
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => canAccessRoute(user?.role, item.path)),
      }))
      .filter((section) => section.items.length > 0);
  }, [user?.role, permVersion]);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col duration-200 overflow-hidden select-none transition-all ${
        isCollapsed ? "w-20" : "w-64"
      } ${
        theme
          ? "bg-slate-900 border-r border-slate-800 text-slate-200"
          : "bg-white border-r border-slate-200/90 text-slate-800 shadow-xs"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 px-4 border-b shrink-0 flex items-center justify-between ${
          theme ? "border-slate-800/80" : "border-slate-100"
        }`}
      >
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "mx-auto" : ""}`}
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.systemName || "Logo"}
              className="w-9 h-9 rounded-xl object-contain bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <DoorOpen size={20} className="stroke-[2.2]" />
            </div>
          )}

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span
                className={`text-base font-bold tracking-tight truncate max-w-[140px] leading-tight ${
                  theme ? "text-white" : "text-slate-900"
                }`}
                title={settings.systemName || "SpaceSync"}
              >
                {settings.systemName || "SpaceSync"}
              </span>
              <span className={`text-[10px] font-medium truncate max-w-[140px] ${theme ? "text-slate-400" : "text-slate-500"}`}>
                {settings.systemTagline || "Reservation Suite"}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={toggleShrink}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden lg:flex p-1.5 rounded-lg transition cursor-pointer ${
            theme
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <PanelLeftClose
            size={18}
            className={`duration-200 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className={`lg:hidden p-1.5 rounded-lg transition cursor-pointer ${
            theme ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <p
                className={`px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                  theme ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {section.title}
              </p>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(`${item.path}/`));

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative flex items-center rounded-xl transition-all duration-150 ${
                        isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                      } ${
                        isActive
                          ? theme
                            ? "bg-blue-500/15 text-blue-400 font-semibold border-l-3 border-blue-500"
                            : "bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600 shadow-xs"
                          : theme
                          ? "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <span
                        className={`shrink-0 transition-transform duration-150 relative ${
                          !isActive ? "group-hover:scale-105" : ""
                        }`}
                      >
                        {item.icon}
                        {isCollapsed && item.path === "/notifications" && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </span>

                      {!isCollapsed && (
                        <span className="text-xs font-medium truncate flex-1">
                          {item.label}
                        </span>
                      )}

                      {!isCollapsed && item.path === "/notifications" && unreadCount > 0 && (
                        <span
                          className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                          }`}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Session Footer */}
      <div
        className={`p-3 border-t shrink-0 ${
          theme ? "border-slate-800/80 bg-slate-900/50" : "border-slate-100 bg-slate-50/50"
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.name || "Administrator"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                theme
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {userInitials}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className={`p-2 rounded-xl transition cursor-pointer ${
                theme
                  ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              }`}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                    theme
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {userInitials}
                </div>
                {/* Online indicator dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div className="min-w-0 flex flex-col leading-tight">
                <p
                  className={`text-xs font-semibold truncate ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {user?.name || "Administrator"}
                </p>
                <p
                  className={`text-[11px] truncate ${
                    theme ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {user?.role || "System Admin"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                theme
                  ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              }`}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-over drawer */}
          <div className="relative z-10 w-72 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
