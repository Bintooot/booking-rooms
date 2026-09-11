import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import Login from "./pages/public/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import RoomManagement from "./pages/admin/RoomManagement.jsx";
import RoomCreation from "./pages/admin/RoomCreation.jsx";
import BookingManagement from "./pages/admin/BookingManagement.jsx";
import Schedule from "./pages/admin/Schedule.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import UserCreation from "./pages/admin/UserCreation.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Notifications from "./pages/admin/Notifications.jsx";
import AuditLogs from "./pages/admin/AuditLogs.jsx";
import RolesPermissions from "./pages/admin/RolesPermissions.jsx";
import Settings from "./pages/admin/Settings.jsx";
import Unavailable from "./pages/admin/Unavailable.jsx";
import NotFound from "./pages/public/NotFound.jsx";

function App() {
  return (
    <Routes>
      {/* Public Portal */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Login />} />
      </Route>

      {/* Admin Portal (Protected) */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room-management" element={<RoomManagement />} />
        <Route path="/room-creation" element={<RoomCreation />} />
        <Route path="/booking-management" element={<BookingManagement />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/user-creation" element={<UserCreation />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/roles" element={<RolesPermissions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/unavailable" element={<Unavailable />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
