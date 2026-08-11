import Banner from "../components/Banner.jsx";
import { DoorOpen } from "lucide-react";

function Dashboard() {
  return (
    <>
      <main className="w-full">
        <Banner header="Dashbaoard" />
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
          <div className="bg-linear-to-r from-gray-100 shadow to-gray-300 border border-gray-300 rounded-lg p-5">
            <h3 className="text-blue-700 text-2xl font-semibold">3</h3>
            <p className="text-blue-400 text-sm">Active Rooms</p>
          </div>

          <div className="bg-linear-to-r from-gray-100 shadow to-gray-300 border border-gray-300 rounded-lg p-5">
            <h3 className="text-blue-700 text-2xl font-semibold">3</h3>
            <p className="text-blue-400 text-sm">Bookings Today</p>
          </div>
          <div className="bg-linear-to-r from-gray-100 shadow to-gray-300 border border-gray-300 rounded-lg p-5">
            <h3 className="text-blue-700 text-2xl font-semibold">3</h3>
            <p className="text-blue-400 text-sm">Total Request</p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
