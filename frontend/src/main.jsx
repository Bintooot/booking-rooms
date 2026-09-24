import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
// Purge any legacy application data stored in browser localStorage
try {
  const dataKeysToPurge = [
    "confe_rooms",
    "confe_bookings",
    "confe_users",
    "confe_audit_logs",
    "confe_notifications",
    "confe_settings",
    "confe_permissions",
  ];
  dataKeysToPurge.forEach((key) => {
    localStorage.removeItem(key);
  });
} catch {
  // Ignore storage access errors
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
