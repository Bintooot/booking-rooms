import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

function Theme() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`fixed hover:scale-105 z-20 duration-200 bottom-6 right-6 w-11 h-11 cursor-pointer flex items-center justify-center rounded-2xl shadow-lg border backdrop-blur-md transition-all ${
        theme
          ? "bg-slate-900/90 border-slate-700 text-amber-400 hover:text-amber-300 shadow-black/40"
          : "bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 shadow-slate-200/50"
      }`}
      onClick={toggleTheme}
      title={theme ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {theme ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default Theme;
