import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function Banner({ header, theme, toggleTheme }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={`w-full h-25 bg-linear-to-r ${theme ? "from-blue-600 to-blue-400 border-2 border-violet-300/50" : `from-blue-900 to-blue-700 border-2 border-violet-300/50`}  rounded content-center px-5 relative overflow-hidden`}
      >
        <h1 className="text-white text-3xl font-bold tracking-wider">
          {header}
        </h1>
        <p className="text-white/80 text-sm">
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
          {" · "}
          {now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div
          className={`absolute -top-3 -right-5 text-gray-100/50 cursor-pointer ${theme ? "rotate-180" : "rotate-0"} duration-200`}
        >
          <Sun size={105} strokeWidth={1.7} />
          <Moon size={105} strokeWidth={1.7} />
        </div>
      </div>
    </>
  );
}

export default Banner;
