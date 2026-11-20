import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getSettings,
  fetchSettings,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
  DEFAULT_SETTINGS,
} from "../services/settingsService.js";

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => getSettings());

  const refreshSettings = useCallback(async () => {
    const fresh = await fetchSettings();
    if (fresh) {
      setSettings(fresh);
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    const handleUpdate = (e) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        setSettings(getSettings());
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    };
  }, [refreshSettings]);

  const updateSettings = useCallback(async (newPartialSettings) => {
    const updated = await saveSettings({ ...settings, ...newPartialSettings });
    setSettings(updated);
    return updated;
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    return { settings: DEFAULT_SETTINGS, updateSettings: async () => {}, refreshSettings: async () => {} };
  }
  return context;
}
