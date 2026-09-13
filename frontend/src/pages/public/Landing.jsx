import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getRooms } from "../../api/rooms.js";
import {
  DoorOpen,
  CalendarCheck,
  Users,
  ShieldCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
  FileText,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  HelpCircle,
  LogIn,
  Check,
  Layers,
} from "lucide-react";

// Featured fallback rooms for instant showcase
const FALLBACK_ROOMS = [
  {
    id: 101,
    name: "Apex Executive Boardroom",
    type: "Boardroom",
    capacity: 18,
    location: "Level 4 • Executive Wing",
    status: "Available",
    amenities: ["4K Video Conferencing", "Dual Display", "High-Speed WiFi", "Coffee Station", "Smart Whiteboard"],
    description: "Premium boardroom equipped for high-stakes leadership meetings, presentations, and hybrid calls.",
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: 102,
    name: "Design Sprint ThinkTank",
    type: "Meeting Room",
    capacity: 8,
    location: "Level 2 • Innovation Hub",
    status: "Available",
    amenities: ["Interactive Screen", "High-Speed WiFi", "Acoustic Panels", "Mobile Whiteboards"],
    description: "Collaborative breakout hub designed for agile sprint sessions, brainstorming, and cross-team workshops.",
    gradient: "from-purple-600/20 via-pink-600/10 to-transparent",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: 103,
    name: "Quiet Focus Pod Alpha",
    type: "Focus Pod",
    capacity: 2,
    location: "Level 3 • Quiet Zone",
    status: "Available",
    amenities: ["Noise Cancellation", "High-Speed WiFi", "Ergonomic Chairs", "Power Hub"],
    description: "Soundproof compact enclave tailored for 1-on-1 performance reviews, client interviews, and deep work.",
    gradient: "from-cyan-600/20 via-blue-600/10 to-transparent",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: 104,
    name: "Global Town Hall Auditorium",
    type: "Boardroom",
    capacity: 45,
    location: "Level 1 • Main Pavilion",
    status: "Available",
    amenities: ["Studio Audio System", "Triple Projector", "Wireless Mics", "Live Stream Ready"],
    description: "Large-capacity auditorium for company all-hands, product launches, investor briefings, and hybrid events.",
    gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
];

const FAQS = [
  {
    q: "How does SpaceSync prevent double bookings?",
    a: "SpaceSync runs real-time millisecond overlap validation on both client and server tiers. Any requested time window is strictly compared against confirmed reservations and pending blocks for that specific space, completely eliminating double-bookings.",
  },
  {
    q: "Can administrators customize booking policies and advance limits?",
    a: "Yes. System administrators can configure maximum meeting duration (e.g., up to 8 hours), advance booking horizons (e.g., up to 30 days ahead), buffer windows between sessions, and enforce strict conflict rules from the central Settings panel.",
  },
  {
    q: "What roles and permissions are supported?",
    a: "SpaceSync features multi-tier Role-Based Access Control (RBAC): Administrators retain full governance over rooms, users, system settings, and audit logs; Managers have access to reservations, analytics, and reports; and Employees can seamlessly book, view schedules, and manage their own reservations.",
  },
  {
    q: "Can we track who booked or modified a room or workspace?",
    a: "Every booking creation, time modification, approval, and cancellation is immutably recorded in the Live Audit Log with timestamps, user identities, action targets, and one-click CSV export for enterprise compliance.",
  },
  {
    q: "Is SpaceSync responsive for tablets and mobile devices?",
    a: "Yes. The entire application is built with a mobile-first responsive layout, ensuring staff can reserve rooms, check live schedules, and manage meetings on smartphones, tablets, or boardroom wall displays.",
  },
];

function Landing() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rooms, setRooms] = useState(FALLBACK_ROOMS);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeFaq, setActiveFaq] = useState(0);

  // Fetch live rooms if available, otherwise keep fallback
  useEffect(() => {
    let isMounted = true;
    async function loadRooms() {
      try {
        const liveData = await getRooms();
        if (isMounted && Array.isArray(liveData) && liveData.length > 0) {
          const formatted = liveData.slice(0, 6).map((r, i) => ({
            id: r.id || i,
            name: r.name || `Room ${r.id}`,
            type: r.type || (r.capacity > 12 ? "Boardroom" : r.capacity <= 3 ? "Focus Pod" : "Meeting Room"),
            capacity: r.capacity || 6,
            location: r.location || "Main Tower",
            status: r.status || "Available",
            amenities: Array.isArray(r.amenities) && r.amenities.length > 0
              ? r.amenities
              : ["WiFi", "Screen Display", "Whiteboard"],
            description: r.description || "Fully equipped collaborative room with modern audiovisual equipment.",
            gradient:
              i % 3 === 0
                ? "from-blue-600/20 via-indigo-600/10 to-transparent"
                : i % 3 === 1
                ? "from-purple-600/20 via-pink-600/10 to-transparent"
                : "from-cyan-600/20 via-blue-600/10 to-transparent",
            badgeColor:
              r.status === "Maintenance"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          }));
          setRooms(formatted);
        }
      } catch {
        // Fallback already in state
      }
    }
    loadRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRooms = rooms.filter((r) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Boardrooms") return r.type?.toLowerCase().includes("board");
    if (selectedFilter === "Meeting Rooms") return r.type?.toLowerCase().includes("meet");
    if (selectedFilter === "Focus Pods") return r.type?.toLowerCase().includes("focus") || r.capacity <= 3;
    return true;
  });

  const handleRoomAction = (room) => {
    if (isAuthenticated) {
      navigate(`/booking-management?roomId=${room.id}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 selection:bg-blue-500 selection:text-white ${
        theme ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* 1. STICKY TOP NAVBAR */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
          theme ? "bg-slate-950/80 border-slate-800/80" : "bg-white/80 border-slate-200/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <DoorOpen size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight flex items-center gap-1.5">
                Space<span className="text-blue-600 dark:text-blue-400">Sync</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  v1.2
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 font-medium hidden sm:block">
                Workspace Reservation Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Features
            </a>
            <a
              href="#rooms"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Rooms & Spaces
            </a>
            <a
              href="#how-it-works"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Benefits
            </a>
            <a
              href="#faq"
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              FAQ
            </a>
          </nav>

          {/* Right Header CTAs & Theme Switcher */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                theme
                  ? "bg-slate-900 border-slate-700 text-yellow-400 hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {theme ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold leading-none">{user?.name || "User"}</span>
                  <span className="text-[10px] text-blue-500 font-medium">{user?.role || "Member"}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 transition"
                >
                  <span>Dashboard</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition ${
                    theme
                      ? "border-slate-700 hover:border-slate-600 text-slate-200 hover:bg-slate-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-95 transition"
                >
                  <span>Get Started</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl border transition ${
                theme ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden px-4 pt-3 pb-6 border-b space-y-3 ${
              theme ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-blue-500"
            >
              Features
            </a>
            <a
              href="#rooms"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-blue-500"
            >
              Rooms & Spaces
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-blue-500"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-blue-500"
            >
              Benefits
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-blue-500"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white"
              >
                {isAuthenticated ? "Open Dashboard" : "Sign In / Launch Portal"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle Background Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[680px] h-96 sm:h-[480px] bg-blue-500/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-6">
              <Sparkles size={14} className="animate-pulse" />
              <span>Smart Space & Room Reservation Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6">
              Seamless Room Booking.{" "}
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Zero Scheduling Conflicts.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-9 leading-relaxed max-w-2xl mx-auto">
              Empower your teams to discover, reserve, and manage collaborative spaces with instant conflict checks,
              real-time occupancy tracking, and enterprise role permissions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-xl shadow-blue-500/25 active:scale-95 transition"
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Access Booking Portal"}</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#rooms"
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-base border transition ${
                  theme
                    ? "bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                <Building2 size={18} className="text-blue-500" />
                <span>Explore Available Rooms</span>
              </a>
            </div>

            {/* Metric / Value Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div
                className={`p-4 rounded-2xl border ${
                  theme ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Conflict-Free Guarantee
                </div>
              </div>
              <div
                className={`p-4 rounded-2xl border ${
                  theme ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">&lt; 30s</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Average Reservation</div>
              </div>
              <div
                className={`p-4 rounded-2xl border ${
                  theme ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">3-Tier</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">RBAC & Audit Trail</div>
              </div>
              <div
                className={`p-4 rounded-2xl border ${
                  theme ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">Live</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Real-Time Sync</div>
              </div>
            </div>
          </div>

          {/* Interactive UI Mockup Card Preview */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div
              className={`rounded-3xl border shadow-2xl overflow-hidden p-4 sm:p-6 transition-all ${
                theme ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">portal.spacesync.internal/schedule</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time Engine Active</span>
                </div>
              </div>

              {/* Mockup Schedule Matrix Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    theme ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Boardroom A</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">Executive Boardroom</h4>
                  <p className="text-xs text-slate-500 mb-3">Capacity: 18 • Level 4</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-between">
                      <span className="font-semibold">09:00 - 10:30</span>
                      <span>Product Roadmap</span>
                    </div>
                    <div className="p-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center">
                      + Open for Booking
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    theme ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hub 204</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      In Use
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">Design ThinkTank</h4>
                  <p className="text-xs text-slate-500 mb-3">Capacity: 8 • Level 2</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-between">
                      <span className="font-semibold">10:00 - 11:30</span>
                      <span>UX Brainstorm</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-between">
                      <span className="font-semibold">14:00 - 15:00</span>
                      <span>Sprint Review</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    theme ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pod 03</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Available
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">Quiet Focus Pod</h4>
                  <p className="text-xs text-slate-500 mb-3">Capacity: 2 • Level 3</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center">
                      + Free All Day
                    </div>
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span className="font-semibold">16:00 - 17:00</span>
                      <span>1-on-1 Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ROOMS & SPACES SHOWCASE SECTION */}
      <section id="rooms" className={`py-20 border-t ${theme ? "border-slate-800/80 bg-slate-900/40" : "border-slate-200 bg-slate-100/40"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-3">
                <Building2 size={14} />
                <span>Flexible Corporate Facilities</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Explore Available Rooms & Spaces
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl">
                From executive boardrooms to acoustic 1-on-1 focus pods, explore our curated spaces ready for instant reservation.
              </p>
            </div>

            {/* Filter Tabs */}
            <div
              className={`flex items-center p-1 rounded-xl border self-start md:self-auto ${
                theme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              {["All", "Boardrooms", "Meeting Rooms", "Focus Pods"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFilter === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  theme ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Decorative Banner / Header */}
                  <div
                    className={`h-28 p-5 bg-linear-to-br ${room.gradient || "from-blue-600/20 to-indigo-600/5"} relative flex items-start justify-between border-b border-slate-200/50 dark:border-slate-800/50`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400 border border-white/20">
                      <DoorOpen size={24} />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        room.badgeColor || "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  {/* Room Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span className="font-medium">{room.location}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Users size={14} /> Up to {room.capacity} people
                      </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight mb-2">{room.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {room.amenities.slice(0, 4).map((amenity, idx) => (
                        <span
                          key={idx}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                            theme
                              ? "bg-slate-800/80 border-slate-700/80 text-slate-300"
                              : "bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span
                          className={`text-[11px] font-medium px-2 py-1 rounded-lg border ${
                            theme ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}
                        >
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => handleRoomAction(room)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition cursor-pointer"
                  >
                    <span>{isAuthenticated ? "Book This Space" : "Sign In to Reserve"}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to={isAuthenticated ? "/room-management" : "/login"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View full room registry & live availability matrix</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES GRID SECTION */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-4">
            <Layers size={14} />
            <span>Enterprise Feature Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Engineered for Modern Enterprise Workspaces
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            From intuitive calendar booking to strict policy enforcement, SpaceSync keeps your company&apos;s physical spaces optimized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div
            className={`p-7 rounded-3xl border transition-all hover:shadow-lg ${
              theme ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Conflict-Free Scheduling</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time validation checks every single millisecond. Overlapping reservations are automatically detected and blocked before they happen.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className={`p-7 rounded-3xl border transition-all hover:shadow-lg ${
              theme ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Multi-Tier RBAC Security</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Granular permission matrix distinguishing Administrators, Managers, and Employees. Sensitive settings and user creation stay protected.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className={`p-7 rounded-3xl border transition-all hover:shadow-lg ${
              theme ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20">
              <Sliders size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Custom Reservation Policies</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforce enterprise rules like maximum meeting length, advance booking limits, buffer cleaning windows, and automatic cancellation triggers.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            className={`p-7 rounded-3xl border transition-all hover:shadow-lg ${
              theme ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Live Compliance Audit Trail</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track every room creation, user modification, and schedule change with timestamped audit logs and instant one-click CSV export.
            </p>
          </div>

          {/* Feature 5 */}
          <div
            className={`p-7 rounded-3xl border transition-all hover:shadow-lg ${
              theme ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Peak Demand Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Identify your most popular meeting rooms, peak hours of the day, busiest days of the week, and calculate total meeting hours with ease.
            </p>
          </div>

          {/* Feature 6 */}
          <div
            className={`p-7 rounded-3xl border transition-all hover:shadow-lg ${
              theme ? "bg-slate-900/60 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 border border-rose-500/20">
              <Bell size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Real-Time Alerts & Center</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Stay informed with real-time notification badges for newly assigned bookings, schedule reschedules, and room maintenance status updates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS 3-STEP FLOW */}
      <section
        id="how-it-works"
        className={`py-20 border-y ${theme ? "border-slate-800/80 bg-slate-900/30" : "border-slate-200 bg-slate-100/30"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
              <Zap size={14} />
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              How SpaceSync Operates
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Reserve your ideal workspace in less than thirty seconds without coordination headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div
              className={`p-8 rounded-3xl border relative ${
                theme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="text-5xl font-black text-blue-500/20 mb-4">01</div>
              <h3 className="text-xl font-bold mb-2">Discover Space</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Filter rooms by attendee capacity, location wing, and required amenities like 4K screens, video setups, or whiteboards.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-8 rounded-3xl border relative ${
                theme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="text-5xl font-black text-indigo-500/20 mb-4">02</div>
              <h3 className="text-xl font-bold mb-2">Instant Conflict Check</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Select your meeting start and end times. The system performs instant cross-checks against verified bookings and confirms slot availability.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-8 rounded-3xl border relative ${
                theme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <div className="text-5xl font-black text-emerald-500/20 mb-4">03</div>
              <h3 className="text-xl font-bold mb-2">Collaborate & Track</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive instant confirmation, review in the interactive timeline schedule, and monitor updates directly from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. KEY BENEFITS / VALUE PROPOSITION */}
      <section id="benefits" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CheckCircle2 size={14} />
              <span>Proven Organizational Impact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Designed to Eliminate Meeting Friction Across Your Company
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Traditional spreadsheets and chaotic chat channels cause interrupted meetings and empty ghost rooms.
              SpaceSync gives facilities managers and team leads total control over rooms and shared spaces.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Zero Wasted Staff Time</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Eliminate an estimated 4+ hours per employee every month spent hunting for free spaces.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Maximized Space Utilization</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analyze room usage patterns to reallocate underutilized rooms and plan future office expansions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Full Audit Transparency</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complete records of who reserved rooms, meeting durations, and cancellations for compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div
              className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
                theme
                  ? "bg-linear-to-br from-blue-950/40 via-indigo-950/20 to-slate-900 border-slate-800"
                  : "bg-linear-to-br from-blue-50 via-indigo-50/50 to-white border-slate-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-6">Why Teams Choose SpaceSync</h3>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    theme ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">Fast Turnkey Setup</span>
                    <span className="text-xs font-semibold text-blue-500">Immediate</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Ready-to-use demo accounts for Admins & Managers allow you to test every workflow immediately.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    theme ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">Automated Conflict Detection</span>
                    <span className="text-xs font-semibold text-emerald-500">100% Real-time</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    No more double booked boardrooms during important client presentations.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    theme ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">Dark & Light Mode Built-in</span>
                    <span className="text-xs font-semibold text-purple-500">Modern UX</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Fluid design optimized for desktop monitors, mobile devices, and boardroom kiosk screens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE FAQ SECTION */}
      <section
        id="faq"
        className={`py-20 border-t ${theme ? "border-slate-800/80 bg-slate-900/40" : "border-slate-200 bg-slate-100/40"}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-3">
              <HelpCircle size={14} />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">Got Questions? We&apos;ve Got Answers.</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Everything you need to know about setting up and using the SpaceSync platform.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all ${
                    theme ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm sm:text-base">{faq.q}</span>
                    <span className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM CONVERSION CTA BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden text-white shadow-2xl ${
            theme
              ? "bg-linear-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800/40"
              : "bg-linear-to-r from-blue-600 via-indigo-700 to-blue-800"
          }`}
        >
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Ready to Modernize Your Room Reservations?
            </h2>
            <p className="text-blue-100/80 text-sm sm:text-base mb-8 leading-relaxed">
              Launch the workspace management portal today or try our pre-configured administrator and manager demo accounts in one click.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-lg active:scale-95 transition"
              >
                Launch Booking Portal
              </Link>
              <a
                href="#rooms"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md active:scale-95 transition"
              >
                Browse Room Catalog
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PUBLIC FOOTER */}
      <footer
        className={`border-t py-12 transition-colors ${
          theme ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/80">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <DoorOpen size={20} />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Space<span className="text-blue-600 dark:text-blue-400">Sync</span>
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
              <a href="#features" className="hover:text-blue-500 transition">
                Features
              </a>
              <a href="#rooms" className="hover:text-blue-500 transition">
                Rooms
              </a>
              <a href="#how-it-works" className="hover:text-blue-500 transition">
                How It Works
              </a>
              <a href="#benefits" className="hover:text-blue-500 transition">
                Benefits
              </a>
              <a href="#faq" className="hover:text-blue-500 transition">
                FAQ
              </a>
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Portal Sign In
              </Link>
            </div>

            {/* System Status Pill */}
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} SpaceSync Technologies Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-blue-500" />
              <span>Enterprise Grade Security & Conflict-Free Guarantee</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
