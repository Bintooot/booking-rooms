import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

function Theme() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`absolute hover:scale-110 duration-200 bottom-6 right-6 w-12 h-12 cursor-pointer flex items-center justify-center ${
        theme ? "bg-blue-900" : "bg-blue-300"
      } rounded-full ${theme ? "text-white" : "text-blue-900"}`}
      onClick={toggleTheme}
    >
      {theme ? <Sun /> : <Moon />}
    </div>
  );
}

export default Theme;
