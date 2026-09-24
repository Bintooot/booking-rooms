import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  DoorOpen,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  CalendarCheck,
  Users,
} from "lucide-react";

function Login() {
  const { theme } = useTheme();
  const { login, logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("confe_remembered_email") || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("confe_remembered_email") !== null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      await login(email, password, rememberMe);

      if (rememberMe) {
        localStorage.setItem("confe_remembered_email", email);
      } else {
        localStorage.removeItem("confe_remembered_email");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* Left column / Hero brand panel */}
        <div
          className={`lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-white ${
            theme
              ? "bg-linear-to-br from-blue-900 via-indigo-950 to-slate-900"
              : "bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900"
          }`}
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-[1.02]">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group-hover:bg-white/20 transition">
                <DoorOpen size={22} className="text-blue-300" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Space<span className="text-blue-300">Sync</span>
              </h1>
            </Link>

            <div className="mt-8 space-y-3">
              <h2 className="text-2xl font-semibold leading-tight">
                Modern Workspace & Room Reservation
              </h2>
              <p className="text-blue-100/75 text-sm leading-relaxed">
                Streamline meeting schedules, optimize workspace occupancy, and prevent room double-bookings in real-time.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-center gap-3 text-xs text-blue-100/90">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <CalendarCheck size={14} />
              </div>
              <span>Interactive calendar with conflict-free scheduling</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-blue-100/90">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Building2 size={14} />
              </div>
              <span>Live room availability & amenity management</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-blue-100/90">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Users size={14} />
              </div>
              <span>Role-based team access & audit log tracking</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-blue-200/60 flex items-center justify-between">
            <span>Enterprise Suite v1.2</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} /> Secured
            </span>
          </div>
        </div>

        {/* Right column / Login form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Back to Home Link */}
            <div className="mb-6">
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition ${
                  theme ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-blue-600"
                }`}
              >
                <ArrowLeft size={14} />
                <span>Back to Homepage</span>
              </Link>
            </div>

            {/* Active Session Notice */}
            {isAuthenticated && (
              <div
                className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  theme
                    ? "bg-blue-950/40 border-blue-800/60 text-blue-300"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <div className="text-xs">
                  <span className="font-medium">Active Session:</span> {user?.name} ({user?.role})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={logout}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      theme
                        ? "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                        : "border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    Sign Out
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 transition shadow-xs"
                  >
                    <span>Dashboard</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}

            <div>
              <h2
                className={`text-2xl font-semibold tracking-tight ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Welcome back
              </h2>
              <p
                className={`text-sm mt-1.5 ${
                  theme ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Sign in to manage room bookings and team schedules.
              </p>
            </div>

            {error && (
              <div className="mt-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label
                  className={`block text-xs font-medium mb-2 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      theme ? "text-gray-500" : "text-slate-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition ${
                      theme
                        ? "bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`text-xs font-medium ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Please contact system administrator to reset password or use demo accounts.")}
                    className="text-xs text-blue-500 hover:text-blue-600 transition"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      theme ? "text-gray-500" : "text-slate-400"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full rounded-xl border py-3 pl-11 pr-11 text-sm outline-none transition ${
                      theme
                        ? "bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                        : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition ${
                      theme ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className={`text-xs select-none cursor-pointer ${
                    theme ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  Remember me on this browser
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
