import { Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import RoomCreation from "./pages/admin/RoomCreation.jsx";
import UserCreation from "./pages/admin/UserCreation.jsx";
import Schedule from "./pages/admin/Schedule.jsx";
import RoomManagement from "./pages/admin/RoomManagement.jsx";
import Unavailable from "./pages/admin/Unavailable.jsx";
import Login from "./pages/public/Login.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/rooms" element={<RoomPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Portal */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room-creation" element={<RoomCreation />} />
          <Route path="/user-creation" element={<UserCreation />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/room-management" element={<RoomManagement />} />
          <Route path="/unavailable" element={<Unavailable />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
