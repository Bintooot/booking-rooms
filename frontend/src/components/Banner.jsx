import { useEffect, useState } from "react";
import { Clock, Calendar, MapPin, Building2, Sparkles } from "lucide-react";
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

  const formattedTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`relative w-full rounded-3xl p-6 sm:p-7 overflow-hidden transition-all shadow-sm ${
        theme
          ? "bg-linear-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 text-white"
          : "bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md shadow-blue-500/10"
      }`}
    >
      {/* Soft Ambient Background Glows */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Page Title & Meta Information */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-xs">
              {header}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white/90 backdrop-blur-xs">
              <Sparkles size={11} /> Live Workspace
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-100/85">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar size={13} className="text-blue-300" />
              {formattedDate}
            </span>

            {settings.buildingName && (
              <>
                <span className="text-blue-300/40">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin size={13} className="text-blue-300" />
                  {settings.buildingName}
                </span>
              </>
            )}

            {settings.orgName && (
              <>
                <span className="text-blue-300/40">•</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Building2 size={13} className="text-blue-300" />
                  {settings.orgName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Live Digital Clock Card */}
        <div className="self-start md:self-auto flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
          <Clock size={16} className="text-blue-200" />
          <span className="font-mono text-sm sm:text-base font-semibold tracking-wider text-white">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Banner;
