import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { DoorClosed, Home } from "lucide-react";

function NotFound() {
  const { theme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div
        className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
          theme ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"
        }`}
      >
        <DoorClosed size={40} />
      </div>

      <h1
        className={`text-5xl font-bold tracking-tight ${
          theme ? "text-white" : "text-slate-900"
        }`}
      >
        404
      </h1>

      <h2
        className={`text-lg font-medium mt-2 ${
          theme ? "text-gray-200" : "text-slate-800"
        }`}
      >
        Room Not Found
      </h2>

      <p
        className={`text-xs mt-2 max-w-sm ${
          theme ? "text-gray-400" : "text-gray-500"
        }`}
      >
        The page or resource you are looking for has been moved, occupied, or does not exist.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-md transition"
        >
          <Home size={15} /> Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default NotFound;

