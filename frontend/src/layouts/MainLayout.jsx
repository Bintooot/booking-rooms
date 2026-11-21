import Theme from "../components/Theme.jsx";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

function MainLayout() {
  const { theme } = useTheme();

  return (
    <main
      className={`min-h-screen w-full flex flex-col relative overflow-y-auto transition-colors duration-200 ${
        theme
          ? "bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"
          : "bg-slate-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.12),rgba(255,255,255,0))]"
      }`}
    >
      <div className="flex-1 flex flex-col justify-center">
        <Outlet />
      </div>
      <Theme />
    </main>
  );
}

export default MainLayout;
