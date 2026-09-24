import { Link } from "react-router-dom";
import maintenance from "../../assets/maintenance.svg";

function Unavailable() {
  return (
    <main className="h-screen flex flex-col gap-5 items-center justify-center text-center">
      <div className="flex flex-col gap-2 items-center justify-center">
        <img
          width={320}
          className="mb-5"
          src={maintenance}
          alt="Page unavailable"
        />
        <h1 className="text-4xl text-blue-500 font-bold">Coming Soon</h1>
        <p className="text-slate-400 text-sm mt-1">
          This system module is currently undergoing planned upgrades.
        </p>

        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-md shadow-blue-600/20 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default Unavailable;
