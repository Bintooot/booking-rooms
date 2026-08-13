import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HousePlus,
  UserPlus,
  PanelLeftClose,
} from "lucide-react";
import { useState } from "react";

function Sidebar({ theme }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  function toggleShrink() {
    setIsCollapsed((prev) => !prev);
  }

  const navlink = [
    { icon: <LayoutDashboard />, path: "/dashboard", label: "Dashboard" },
    { icon: <HousePlus />, path: "/room-creation", label: "Room Creation" },
    { icon: <UserPlus />, path: "/user-creation", label: "User Creation" },
  ];

  return (
    <>
      <section
        className={`${isCollapsed ? "w-20" : "w-60"} py-5 px-3 flex flex-col gap-10 duration-200 overflow-hidden cursor-pointer h-screen ${theme ? `bg-slate-800` : `bg-blue-50`}`}
      >
        <div
          className={
            isCollapsed
              ? `flex justify-center`
              : `flex justify-between items-center`
          }
        >
          <h1
            className={`${isCollapsed ? "hidden" : "block"} text-xl font-bold tracking-tight ${
              theme ? "text-white" : "text-blue-900"
            }`}
          >
            Confe
            <span className={theme ? "text-blue-400" : "text-blue-500"}>
              Book
            </span>
          </h1>
          <PanelLeftClose
            className={`${
              isCollapsed
                ? `rotate-180 duration-200 hover:text-blue-500 hover:translate-x-2`
                : `hover:text-blue-500 hover:-translate-x-2 duration-200`
            } ${theme ? "text-white" : "text-blue-900"}`}
            onClick={toggleShrink}
          />
        </div>
        <div>
          <ul className="flex flex-col gap-4">
            {navlink.map((item) => {
              const isActive = location.pathname === item.path;
              const style = `border-2 border-blue-400 ${isActive ? "scale-105" : ""} hover:scale-105 duration-100 rounded-lg overflow-hidden`;

              return (
                <li key={item.path} className={style}>
                  {isCollapsed ? (
                    <Link
                      className={`text-white flex items-center justify-center p-1.5 bg-linear-to-r from-blue-400 to-blue-600 ${isActive ? "scale-80" : "hover:scale-80"}  duration-200 rounded`}
                      to={item.path}
                    >
                      {item.icon}
                    </Link>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex gap-2 items-center text-sm font-semibold ${isActive ? "m-1" : "hover:m-1"}  p-1.5 bg-linear-to-r from-blue-400 to-blue-600 cursor-pointers hover:scale-100 duration-200 text-white rounded `}
                    >
                      {item.icon}
                      <span className="border border-gray-300 h-5"></span>
                      <p>{item.label}</p>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}

export default Sidebar;
