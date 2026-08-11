import { Routes, Route } from "react-router-dom";
import RoomPage from "./pages/RoomPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RoomCreation from "./pages/RoomCreation.jsx";
import UserCreation from "./pages/UserCreation.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/rooms" element={<RoomPage />} />
          <Route path="/bookings" element={<BookingPage />} />
        </Route>

        {/* Admin Portal */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room-creation" element={<RoomCreation />} />
          <Route path="/user-creation" element={<UserCreation />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
