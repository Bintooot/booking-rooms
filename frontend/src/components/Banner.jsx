import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getSettings, SETTINGS_UPDATED_EVENT } from "../services/settingsService.js";

function Banner({ header, theme }) {
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    const handleSettingsUpdate = (e) => {
      if (e.detail) setSettings(e.detail);
      else setSettings(getSettings());
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
    };
  }, []);

  return (
    <>
      <div
        className={`w-full h-25 bg-linear-to-r ${theme ? "from-blue-600 to-blue-400 border-2 border-violet-300/50" : `from-blue-900 to-blue-700 border-2 border-violet-300/50`}  rounded content-center px-5 relative overflow-hidden`}
      >
        <div className="flex items-baseline justify-between pr-24">
          <h1 className="text-white text-2xl sm:text-3xl font-semibold tracking-wide">
            {header}
          </h1>
          {settings.buildingName && (
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/15 text-white/90 backdrop-blur-xs">
              📍 {settings.buildingName}
            </span>
          )}
        </div>
        <p className="text-white/80 text-sm mt-0.5">
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
          {settings.orgName && ` · ${settings.orgName}`}
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
