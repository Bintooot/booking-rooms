import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
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
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}