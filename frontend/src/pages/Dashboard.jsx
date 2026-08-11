import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner.jsx";
import { DoorOpen, Moon, Sun } from "lucide-react";

function Dashboard() {
  const { theme, toggleTheme } = useOutletContext();

  return (
    <>
      <main className="w-full h-full">
        <Banner header="Dashboard" theme={theme} toggleTheme={toggleTheme} />

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
          <div
            className={`${
              theme
                ? "bg-slate-800 border-slate-600"
                : "bg-gray-100  border-gray-200"
            } shadow border rounded-lg p-5`}
          >
            <h3
              className={`${theme ? "text-white" : "text-blue-700"} text-2xl font-semibold`}
            >
              3
            </h3>
            <p
              className={`${theme ? "text-gray-400" : "text-blue-400"} text-sm`}
            >
              Active Rooms
            </p>
          </div>

          <div
            className={`${
              theme
                ? "bg-slate-800 border-slate-600"
                : "bg-gray-100  border-gray-200"
            } shadow border rounded-lg p-5`}
          >
            <h3
              className={`${theme ? "text-white" : "text-blue-700"} text-2xl font-semibold`}
            >
              1
            </h3>
            <p
              className={`${theme ? "text-gray-400" : "text-blue-400"} text-sm`}
            >
              Available Room
            </p>
          </div>
          <div
            className={`${
              theme
                ? "bg-slate-800 border-slate-600"
                : "bg-gray-100  border-gray-200"
            } shadow border rounded-lg p-5`}
          >
            <h3
              className={`${theme ? "text-white" : "text-blue-700"} text-2xl font-semibold`}
            >
              3
            </h3>
            <p
              className={`${theme ? "text-gray-400" : "text-blue-400"} text-sm`}
            >
              Request Pending
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
