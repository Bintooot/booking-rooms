import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useState } from "react";

function Sidebar({ theme }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  function toggleShrink() {
    setIsCollapsed((prev) => !prev);
  }

  const navSections = [
    {
      title: "Overview",
      items: [
        {
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
          label: "Dashboard",
        },
      ],
    },

    {
      title: "Rooms",
      items: [
        {
          icon: <DoorOpen size={20} />,
          path: "/room-management",
          label: "Room Management",
        },
        {
          icon: <HousePlus size={20} />,
          path: "/room-creation",
          label: "Room Creation",
        },
      ],
    },

    {
      title: "Bookings",
      items: [
        {
          icon: <CalendarDays size={20} />,
          path: "/bookings",
          label: "Booking Management",
        },
        {
          icon: <ClipboardList size={20} />,
          path: "/schedule",
          label: "Schedule",
        },
      ],
    },

    {
      title: "Users",
      items: [
        {
          icon: <Users size={20} />,
          path: "/users",
          label: "User Management",
        },
        {
          icon: <UserPlus size={20} />,
          path: "/user-creation",
          label: "User Creation",
        },
      ],
    },

    {
      title: "Reports",
      items: [
        {
          icon: <BarChart3 size={20} />,
          path: "/reports",
          label: "Usage Reports",
        },
      ],
    },

    {
      title: "Administration",
      items: [
        {
          icon: <Bell size={20} />,
          path: "/notifications",
          label: "Notifications",
        },
        {
          icon: <History size={20} />,
          path: "/audit-logs",
          label: "Audit Logs",
        },
        {
          icon: <ShieldCheck size={20} />,
          path: "/roles",
          label: "Roles & Permissions",
        },
        {
          icon: <Settings size={20} />,
          path: "/settings",
          label: "Settings",
        },
      ],
    },
  ];

  return (
    <section
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } py-5 px-3 flex flex-col duration-200 overflow-hidden   h-screen shrink-0 ${
        theme ? "bg-slate-800" : "bg-blue-50"
      }`}
    >
      {/* Logo / Header */}
      <div
        className={`mb-8 ${
          isCollapsed
            ? "flex justify-center"
            : "flex justify-between items-center"
        }`}
      >
        <h1
          className={`${
            isCollapsed ? "hidden" : "block"
          } text-xl font-bold tracking-tight ${
            theme ? "text-white" : "text-blue-900"
          }`}
        >
          Confe
          <span className={theme ? "text-blue-400" : "text-blue-500"}>
            Book
          </span>
        </h1>

        <button
          type="button"
          onClick={toggleShrink}
          className={`p-1 rounded-lg transition ${
            theme
              ? "text-white hover:bg-slate-700"
              : "text-blue-900 hover:bg-blue-100"
          }`}
        >
          <PanelLeftClose
            size={21}
            className={`duration-200 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto  scrollbar-hide pr-1">
        <div className="flex flex-col gap-6">
          {navSections.map((section) => (
            <div key={section.title}>
              {/* Section title */}
              {!isCollapsed && (
                <p
                  className={`px-2 mb-2 text-[10px] font-bold uppercase tracking-widest ${
                    theme ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {section.title}
                </p>
              )}

              <ul className="flex flex-col gap-1.5">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`);

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-lg transition-all duration-200 ${
                          isCollapsed
                            ? "justify-center p-2.5"
                            : "gap-3 px-3 py-2.5"
                        } ${
                          isActive
                            ? theme
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                              : "bg-blue-900 text-white shadow-md shadow-blue-500/20"
                            : theme
                              ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                              : "text-slate-600 hover:bg-white hover:text-blue-600"
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 w-1 h-6 rounded-r-full bg-white/80" />
                        )}

                        <span
                          className={`shrink-0 transition-transform duration-200 ${
                            !isActive ? "group-hover:scale-110" : ""
                          }`}
                        >
                          {item.icon}
                        </span>

                        {!isCollapsed && (
                          <span className="text-sm font-medium truncate">
                            {item.label}
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
        className={`mt-5 pt-4 border-t ${
          theme ? "border-slate-700" : "border-blue-100"
        }`}
      >
        {isCollapsed ? (
          <div
            title="Administrator"
            className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
              theme
                ? "bg-blue-500/10 text-blue-400"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            AD
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                theme
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              AD
            </div>

            <div className="min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Administrator
              </p>

              <p
                className={`text-xs truncate ${
                  theme ? "text-gray-500" : "text-gray-400"
                }`}
              >
                System Admin
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Sidebar;
