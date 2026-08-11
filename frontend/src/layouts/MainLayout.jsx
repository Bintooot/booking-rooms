import { Outlet, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useState } from "react";

const mockUser = {
  id: 1,
  name: "Ben Aniasco",
  email: "bbaniasco@hijoresources.com",
  role: "user",
};

function MainLayout() {
  const [user, setUser] = useState("");

  return (
    <div>
      {user ? (
        <nav>
          <h2>{user ? `Hi, ${user.name}` : "Guest"}</h2>
          <div>
            <Link to="/rooms">Check Rooms</Link>
            <Link to="/bookings">Booked a Room</Link>
          </div>
        </nav>
      ): "Login First"}

      <Outlet context={{ user, setUser }} />
    </div>
  );
}

export default MainLayout;
