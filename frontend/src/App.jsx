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
        <Route
          path="/room-creation"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <RoomCreation />
            </ProtectedRoute>
          }
        />
        <Route path="/booking-management" element={<BookingManagement />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-creation"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <UserCreation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Administrator", "Manager"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <RolesPermissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/unavailable" element={<Unavailable />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
