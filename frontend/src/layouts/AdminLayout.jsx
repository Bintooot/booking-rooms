import Sidebar from "../components/Sidebar.jsx";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <>
      <main className="bg-gray-100/50 flex">
        <Sidebar />
        <div className="flex-1 p-5">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default AdminLayout;
