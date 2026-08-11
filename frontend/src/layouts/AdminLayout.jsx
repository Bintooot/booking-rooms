import Sidebar from "../components/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

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
      <main className="bg-gray-100/50 flex">
        <Sidebar theme={theme} />
        <div className={`flex-1 p-5 ${theme ? "bg-slate-900" : `bg-white`}`}>
          <Outlet context={{ theme, toggleTheme }} />
        </div>
      </main>
    </>
  );
}

export default AdminLayout;
