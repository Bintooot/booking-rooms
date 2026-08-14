import Sidebar from "../components/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function AdminLayout() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme ? "dark" : "light");
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => !prev);
  }

  return (
    <>
      <main className="bg-gray-100/50 flex h-screen relative">
        <div className="h-full">
          <Sidebar theme={theme} />
        </div>
        <div className={`flex-1 overflow-auto scrollbar-hide h-screen p-5 ${theme ? "bg-slate-900" : `bg-white`}`}>
          <Outlet context={{ theme, toggleTheme }} />
        </div>
        <div
          className={`absolute hover:scale-110  duration-200 bottom-6 right-6 w-12 h-12 cursor-pointer flex items-center justify-center ${theme ? "bg-blue-900" : "bg-blue-300"} rounded-full ${theme ? "text-white" : "text-blue-900"}`}
          onClick={toggleTheme}
        >
          {theme ? <Sun /> : <Moon />}
        </div>
      </main>
    </>
  );
}

export default AdminLayout;
