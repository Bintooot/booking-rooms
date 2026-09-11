import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
// Purge legacy mock data stored in browser localStorage
try {
  const legacyRooms = localStorage.getItem("confe_rooms");
  if (legacyRooms && legacyRooms.includes("Conference Room A")) {
    localStorage.removeItem("confe_rooms");
  }
  const legacyBookings = localStorage.getItem("confe_bookings");
  if (legacyBookings && legacyBookings.includes("Quarterly Strategy Review")) {
    localStorage.removeItem("confe_bookings");
  }
} catch {
  // Ignore
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
