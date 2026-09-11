import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  DoorOpen,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  CalendarCheck,
  Users,
} from "lucide-react";

function Login() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword("password123");
    login(roleEmail, "password123");
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Left column / Hero brand panel */}
        <div
          className={`lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-white ${
            theme
              ? "bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900"
              : "bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900"
          }`}
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <DoorOpen size={22} className="text-blue-300" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Confe<span className="text-blue-300">Book</span>
              </h1>
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-2xl font-bold leading-tight">
                Modern Conference & Room Reservation
              </h2>
              <p className="text-blue-100/75 text-sm leading-relaxed">
                Streamline meeting schedules, optimize space occupancy, and prevent room double-bookings in real-time.
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
            <span>Enterprise Suite v1.0</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} /> Secured
            </span>
          </div>
        </div>

        {/* Right column / Login form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div>
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Welcome back
              </h2>
              <p
                className={`text-sm mt-1.5 ${
                  theme ? "text-gray-400" : "text-gray-500"
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
                  className={`block text-xs font-semibold mb-2 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      theme ? "text-gray-500" : "text-gray-400"
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
                        : "bg-gray-50/80 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`text-xs font-semibold ${
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
                      theme ? "text-gray-500" : "text-gray-400"
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
                        : "bg-gray-50/80 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition ${
                      theme ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-slate-900"
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

            {/* Quick Demo Access */}
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-slate-700">
              <p
                className={`text-[11px] font-semibold uppercase tracking-wider mb-3 text-center ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Quick Demo Sign-In
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@company.com")}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition text-center hover:-translate-y-0.5 ${
                    theme
                      ? "bg-slate-900/50 border-slate-700 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
                      : "bg-gray-50 border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  👑 Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("manager@company.com")}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition text-center hover:-translate-y-0.5 ${
                    theme
                      ? "bg-slate-900/50 border-slate-700 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400"
                      : "bg-gray-50 border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200"
                  }`}
                >
                  💼 Manager Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
