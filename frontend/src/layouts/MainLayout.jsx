import Sidebar from "../components/Sidebar.jsx";
import Theme from "../components/Theme.jsx";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

function AdminLayout() {
  const { theme } = useTheme();

  return (
    <main
      className={`h-screen flex ${
        theme
          ? "bg-slate-900 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size[32px_32px]"
          : "bg-gray-100/50 bg-[linear-gradient(to_right,s#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-size[32px_32px]"
      }`}
    >
      <div className="flex-1 p-3">
        <Outlet />
      </div>
      <Theme />
    </main>
  );
}

export default AdminLayout;
