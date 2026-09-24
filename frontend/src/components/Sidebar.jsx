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
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { canAccessRoute } from "../utils/permissions.js";
import { getUnreadCount, NOTIFICATIONS_UPDATED_EVENT } from "../services/notificationService.js";

function Sidebar({ theme }) {
  const { user, logout } = useAuth();
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
          icon: <LayoutDashboard size={19} />,
          path: "/dashboard",
          label: "Dashboard",
        },
      ],
    },
    {
      title: "Rooms",
      items: [
        {
          icon: <DoorOpen size={19} />,
          path: "/room-management",
          label: "Room Management",
        },
        {
          icon: <HousePlus size={19} />,
          path: "/room-creation",
          label: "Room Creation",
        },
      ],
    },
    {
      title: "Bookings",
      items: [
        {
          icon: <ClipboardList size={19} />,
          path: "/booking-management",
          label: "Booking Management",
        },
        {
          icon: <CalendarDays size={19} />,
          path: "/schedule",
          label: "Schedule Calendar",
        },
      ],
    },
    {
      title: "Users",
      items: [
        {
          icon: <Users size={19} />,
          path: "/user-management",
          label: "User Management",
        },
        {
          icon: <UserPlus size={19} />,
          path: "/user-creation",
          label: "User Creation",
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          icon: <BarChart3 size={19} />,
          path: "/reports",
          label: "Usage Reports",
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          icon: <Bell size={19} />,
          path: "/notifications",
          label: "Notifications",
        },
        {
          icon: <History size={19} />,
          path: "/audit-logs",
          label: "Audit Logs",
        },
        {
          icon: <ShieldCheck size={19} />,
          path: "/roles",
          label: "Roles & Permissions",
        },
        {
          icon: <Settings size={19} />,
          path: "/settings",
          label: "Settings",
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

  return (
    <section
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } py-5 px-3 flex flex-col duration-200 overflow-hidden h-screen shrink-0 ${
        theme ? "bg-slate-800" : "bg-blue-50/70"
      }`}
    >
      {/* Logo / Header */}
      <div
        className={`mb-6 ${
          isCollapsed
            ? "flex justify-center"
            : "flex justify-between items-center px-1"
        }`}
      >
        <Link to="/dashboard" className={`${isCollapsed ? "hidden" : "flex items-center gap-2"}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-medium">
            <DoorOpen size={18} />
          </div>
          <h1
            className={`text-xl font-bold tracking-tight ${
              theme ? "text-white" : "text-blue-950"
            }`}
          >
            Space
            <span className={theme ? "text-blue-400" : "text-blue-600"}>
              Sync
            </span>
          </h1>
        </Link>

        <button
          type="button"
          onClick={toggleShrink}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`p-1.5 rounded-lg transition ${
            theme
              ? "text-gray-400 hover:text-white hover:bg-slate-700"
              : "text-blue-900 hover:bg-blue-100"
          }`}
        >
          <PanelLeftClose
            size={20}
            className={`duration-200 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        <div className="flex flex-col gap-5">
          {filteredSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <p
                  className={`px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest ${
                    theme ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {section.title}
                </p>
              )}

              <ul className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/" && location.pathname.startsWith(`${item.path}/`));

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                          isCollapsed
                            ? "justify-center p-2.5"
                            : "gap-3 px-3 py-2"
                        } ${
                          isActive
                            ? theme
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium"
                              : "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-medium"
                            : theme
                              ? "text-gray-400 hover:bg-slate-700/60 hover:text-white"
                              : "text-slate-600 hover:bg-white hover:text-blue-600"
                        }`}
                      >
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 w-1 h-5 rounded-r-full bg-white" />
                        )}

                        <span
                          className={`shrink-0 transition-transform duration-200 relative ${
                            !isActive ? "group-hover:scale-110" : ""
                          }`}
                        >
                          {item.icon}
                          {isCollapsed && item.path === "/notifications" && unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-slate-800" />
                          )}
                        </span>

                        {!isCollapsed && (
                          <span className="text-xs font-medium truncate flex-1">
                            {item.label}
                          </span>
                        )}

                        {!isCollapsed && item.path === "/notifications" && unreadCount > 0 && (
                          <span
                            className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              isActive
                                 ? "bg-white text-blue-600"
                                 : "bg-blue-600 text-white"
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
        </div>
      </nav>

      {/* Admin profile/footer */}
      <div
        className={`mt-4 pt-4 border-t ${
          theme ? "border-slate-700" : "border-blue-100"
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.name || "Administrator"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium ${
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
              className={`p-2 rounded-lg transition ${
                theme
                  ? "text-gray-400 hover:text-red-400 hover:bg-slate-700"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium shrink-0 ${
                  theme
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {userInitials}
              </div>

              <div className="min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {user?.name || "Administrator"}
                </p>
                <p
                  className={`text-[11px] truncate ${
                    theme ? "text-gray-400" : "text-gray-500"
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
              className={`p-2 rounded-lg transition shrink-0 ${
                theme
                  ? "text-gray-400 hover:text-red-400 hover:bg-slate-700"
                  : "text-slate-400 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Sidebar;

