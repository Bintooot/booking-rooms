import Sidebar from "../components/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import Theme from "../components/Theme.jsx";

function AdminLayout() {
  const { theme } = useTheme();

  return (
    <main className={`flex h-screen relative ${theme ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className="h-full">
        <Sidebar theme={theme} />
      </div>
      <div
        className={`flex-1 overflow-auto scrollbar-hide h-screen p-5 ${theme ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <Outlet />
        <Theme />
      </div>
    </main>
  );
}

export default AdminLayout;