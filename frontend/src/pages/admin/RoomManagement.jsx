import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { getRooms, updateRoom, deleteRoom as apiDeleteRoom } from "../../api/rooms.js";
import { useToast } from "../../components/Toast.jsx";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";
import {
  Search,
  Plus,
  MoreVertical,
  Users,
  Monitor,
  Wifi,
  CalendarDays,
  Pencil,
  Trash2,
  Power,
  DoorOpen,
  X,
  MapPin,
  Check,
  LayoutGrid,
  List,
} from "lucide-react";

const AVAILABLE_AMENITIES = [
  "WiFi",
  "Projector",
  "Display",
  "Whiteboard",
  "Video Conference",
  "Sound System",
  "Air Conditioning",
  "Coffee Machine",
];

function RoomManagement() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("confe_room_view_mode") || "grid"
  );

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("confe_room_view_mode", mode);
  };

  // Edit Modal State
  const [editingRoom, setEditingRoom] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    capacity: 4,
    location: "",
    description: "",
    status: "Available",
    amenities: [],
  });

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(data || []);
    } catch {
      showToast("Failed to load rooms", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const name = room.name || "";
      const loc = room.location || "";
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        loc.toLowerCase().includes(search.toLowerCase());

      const roomStatus = room.status || (room.is_active === false ? "Maintenance" : "Available");
      const matchesStatus =
        statusFilter === "All" || roomStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter]);

  const getStatusStyle = (status) => {
    const s = status || "Available";
    if (s === "Available") {
      return theme
        ? "bg-green-500/15 text-green-400 border-green-500/30"
        : "bg-green-50 text-green-700 border-green-200";
    }

    if (s === "Occupied") {
      return theme
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200";
    }

    return theme
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const handleToggleStatus = async (room) => {
    const currentStatus = room.status || (room.is_active === false ? "Maintenance" : "Available");
    const nextStatus = currentStatus === "Maintenance" ? "Available" : "Maintenance";
    try {
      await updateRoom(room.id, { status: nextStatus, is_active: nextStatus !== "Maintenance" });
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: nextStatus, is_active: nextStatus !== "Maintenance" } : r))
      );

      logAuditEvent({
        action: "Room Status Changed",
        actor: user?.name || "Administrator",
        target: `${room.name} (${nextStatus})`,
        type: "room",
      });

      addNotification({
        title: `Room Status: ${room.name}`,
        message: `"${room.name}" was marked as ${nextStatus}.`,
        type: "maintenance",
      });

      showToast(`"${room.name}" marked as ${nextStatus}`);
    } catch {
      showToast("Failed to update status", "error");
    }
    setOpenMenu(null);
  };

  const handleDelete = async (room) => {
    const confirmed = window.confirm(
      `Delete room "${room.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await apiDeleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));

      logAuditEvent({
        action: "Room Deleted",
        actor: user?.name || "Administrator",
        target: room.name,
        type: "room",
      });

      addNotification({
        title: "Room Removed",
        message: `Room "${room.name}" was deleted from the facility list.`,
        type: "maintenance",
      });

      showToast(`Room "${room.name}" deleted successfully`);
    } catch {
      showToast("Failed to delete room", "error");
    }
    setOpenMenu(null);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setEditFormData({
      name: room.name || "",
      capacity: room.capacity || 4,
      location: room.location || "",
      description: room.description || "",
      status: room.status || "Available",
      amenities: Array.isArray(room.amenities) ? [...room.amenities] : [],
    });
    setOpenMenu(null);
  };

  const toggleAmenity = (amenity) => {
    setEditFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      const updated = await updateRoom(editingRoom.id, {
        name: editFormData.name,
        capacity: Number(editFormData.capacity),
        location: editFormData.location,
        description: editFormData.description,
        status: editFormData.status,
        amenities: editFormData.amenities,
      });

      setRooms((prev) =>
        prev.map((r) => (r.id === editingRoom.id ? { ...r, ...updated } : r))
      );

      logAuditEvent({
        action: "Room Updated",
        actor: user?.name || "Administrator",
        target: editFormData.name,
        type: "room",
      });

      showToast(`Updated "${editFormData.name}" successfully!`);
      setEditingRoom(null);
    } catch {
      showToast("Failed to save room updates", "error");
    }
  };

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Room Management" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Manage Rooms & Spaces
          </h2>

          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Configure capacity, amenities, maintenance status, and schedules.
          </p>
        </div>

        {hasPermission(user?.role, "create_room") && (
          <Link
            to="/room-creation"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
          >
            <Plus size={16} />
            Create Room
          </Link>
        )}
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: "Total Rooms",
            value: rooms.length,
            icon: <DoorOpen size={18} />,
          },
          {
            label: "Available",
            value: rooms.filter((r) => r.status === "Available").length,
            icon: <Power size={18} />,
          },
          {
            label: "Occupied",
            value: rooms.filter((r) => r.status === "Occupied").length,
            icon: <Users size={18} />,
          },
          {
            label: "Maintenance",
            value: rooms.filter((r) => r.status === "Maintenance").length,
            icon: <Monitor size={18} />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 ${
              theme
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  theme
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-2xl font-black ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {item.value}
              </span>
            </div>

            <p
              className={`text-xs mt-3 font-medium ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <section
        className={`mt-6 rounded-2xl border p-4 ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                theme ? "text-gray-500" : "text-gray-400"
              }`}
            />

            <input
              type="text"
              placeholder="Search by room name or floor location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs outline-none transition ${
                theme
                  ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  : "bg-gray-50 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-400"
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-medium outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-gray-50 border-gray-200 text-slate-700"
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* View Toggle (Cards / Table) */}
          <div
            className={`flex items-center p-1 rounded-xl border shrink-0 ${
              theme
                ? "bg-slate-900 border-slate-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => handleViewChange("grid")}
              title="Card view"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-sm"
                  : theme
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("table")}
              title="Table view"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : theme
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-slate-900"
              }`}
            >
              <List size={15} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </section>

      {/* Rooms Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">
          Loading rooms...
        </div>
      ) : filteredRooms.length === 0 ? null : viewMode === "grid" ? (
        /* Room Cards Grid */
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {filteredRooms.map((room) => (
            <article
              key={room.id}
              className={`group rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                openMenu === room.id ? "relative z-30" : "relative z-10"
              } ${
                theme
                  ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                  : "bg-white border-gray-200 hover:border-blue-200"
              }`}
            >
              {/* Room Header Banner */}
              <div
                className={`h-24 relative rounded-t-2xl p-3 flex justify-between items-start ${
                  theme
                    ? "bg-linear-to-br from-slate-700 to-slate-900"
                    : "bg-linear-to-br from-blue-50 to-slate-100"
                }`}
              >
                <span
                  className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                    room.status || (room.is_active === false ? "Maintenance" : "Available"),
                  )}`}
                >
                  {room.status || (room.is_active === false ? "Maintenance" : "Available")}
                </span>

                {/* Dropdown Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === room.id ? null : room.id)
                    }
                    className={`p-1.5 rounded-lg transition relative z-50 ${
                      theme
                        ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                        : "text-gray-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <MoreVertical size={17} />
                  </button>

                  {openMenu === room.id && (
                    <>
                      {/* Invisible backdrop to close menu on click outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div
                        className={`absolute right-0 top-9 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden ${
                          theme
                            ? "bg-slate-900 border-slate-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                      <button
                        type="button"
                        onClick={() => openEditModal(room)}
                        className={`w-full flex items-center gap-2 px-3.5 z-50 py-2.5 text-xs text-left ${
                          theme
                            ? "text-gray-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-gray-50"
                        }`}
                      >
                        <Pencil size={14} />
                        Edit Details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(room)}
                        className={`w-full flex items-center gap-2 px-3.5 z-50 py-2.5 text-xs text-left ${
                          theme
                            ? "text-gray-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-gray-50"
                        }`}
                      >
                        <Power size={14} />
                        {(room.status || (room.is_active === false ? "Maintenance" : "Available")) === "Maintenance"
                          ? "Mark Available"
                          : "Mark Maintenance"}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/schedule")}
                        className={`w-full flex items-center gap-2 px-3.5 z-50 py-2.5 text-xs text-left ${
                          theme
                            ? "text-gray-300 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-gray-50"
                        }`}
                      >
                        <CalendarDays size={14} />
                        View Schedule
                      </button>

                      <div
                        className={`border-t ${
                          theme ? "border-slate-800" : "border-gray-100"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => handleDelete(room)}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-500/10 text-left"
                      >
                        <Trash2 size={14} />
                        Delete Room
                      </button>
                    </div>
                  </>
                )}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 z-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className={`font-bold text-sm ${
                        theme ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {room.name}
                    </h3>

                    <p
                      className={`text-xs mt-0.5 flex items-center gap-1 ${
                        theme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <MapPin size={12} />
                      {room.location || "Office Space"}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      theme
                        ? "bg-slate-700 text-gray-200"
                        : "bg-gray-100 text-slate-700"
                    }`}
                  >
                    <Users size={13} />
                    {room.capacity} seats
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed mt-3 line-clamp-2 ${
                    theme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {room.description || "Fully equipped room ready for collaboration."}
                </p>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5 mt-4 min-h-12 content-start">
                  {(room.amenities || ["WiFi"]).map((amenity) => (
                    <span
                      key={amenity}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        theme
                          ? "bg-slate-700/80 text-gray-300"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {amenity === "WiFi" && <Wifi size={10} />}
                      {amenity === "Projector" && <Monitor size={10} />}
                      {amenity === "Display" && <Monitor size={10} />}
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Quick actions row */}
                <div
                  className={`flex items-center gap-2 mt-4 pt-4 border-t ${
                    theme ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/schedule")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                      theme
                        ? "bg-slate-700 text-gray-200 hover:bg-slate-600"
                        : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                    }`}
                  >
                    <CalendarDays size={14} />
                    Schedule
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        /* Room Table View */
        <section
          className={`mt-6 rounded-3xl border overflow-hidden shadow-sm ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    theme
                      ? "border-slate-700 bg-slate-900/40 text-gray-400"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  <th className="py-3.5 px-5">Room Details</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Capacity & Size</th>
                  <th className="py-3.5 px-4">Amenities</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {filteredRooms.map((room) => {
                  const roomStatus = room.status || (room.is_active === false ? "Maintenance" : "Available");
                  return (
                    <tr
                      key={room.id}
                      className={`transition ${
                        theme ? "hover:bg-slate-700/40" : "hover:bg-blue-50/40"
                      }`}
                    >
                      {/* Room Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              theme
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <DoorOpen size={16} />
                          </div>
                          <div>
                            <span
                              className={`font-bold text-xs block ${
                                theme ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {room.name}
                            </span>
                            <span
                              className={`text-[10px] ${
                                theme ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {room.type || "Meeting Room"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${
                            theme ? "text-gray-300" : "text-slate-700"
                          }`}
                        >
                          <MapPin size={13} className="text-gray-400 shrink-0" />
                          {room.location || "Office Space"}
                        </span>
                      </td>

                      {/* Capacity & Size */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              theme ? "text-gray-300" : "text-slate-700"
                            }`}
                          >
                            {room.capacity} seats
                          </span>
                          <span
                            className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              room.size === "large"
                                ? theme
                                  ? "bg-purple-500/15 text-purple-400"
                                  : "bg-purple-50 text-purple-700"
                                : room.size === "medium"
                                  ? theme
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-blue-50 text-blue-700"
                                  : theme
                                    ? "bg-slate-700 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {room.size || "medium"}
                          </span>
                        </div>
                      </td>

                      {/* Amenities */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(room.amenities || []).slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                theme
                                  ? "bg-slate-700/80 text-gray-300"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {amenity === "WiFi" && <Wifi size={10} />}
                              {amenity === "Projector" && <Monitor size={10} />}
                              {amenity === "Display" && <Monitor size={10} />}
                              {amenity}
                            </span>
                          ))}
                          {(room.amenities || []).length > 3 && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                                theme
                                  ? "text-gray-400 bg-slate-700/60"
                                  : "text-gray-500 bg-gray-100"
                              }`}
                            >
                              +{(room.amenities || []).length - 3}
                            </span>
                          )}
                          {(!room.amenities || room.amenities.length === 0) && (
                            <span className="text-gray-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                            roomStatus
                          )}`}
                        >
                          {roomStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate("/schedule")}
                            title="View Schedule"
                            className={`p-2 rounded-xl transition ${
                              theme
                                ? "text-gray-400 hover:text-white hover:bg-slate-700"
                                : "text-slate-500 hover:text-slate-900 hover:bg-gray-100"
                            }`}
                          >
                            <CalendarDays size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(room)}
                            title={
                              roomStatus === "Maintenance"
                                ? "Mark Available"
                                : "Mark Maintenance"
                            }
                            className={`p-2 rounded-xl transition ${
                              roomStatus === "Maintenance"
                                ? "text-amber-500 hover:bg-amber-500/15"
                                : theme
                                  ? "text-gray-400 hover:text-white hover:bg-slate-700"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-gray-100"
                            }`}
                          >
                            <Power size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            title="Edit Details"
                            className={`p-2 rounded-xl transition ${
                              theme
                                ? "text-blue-400 hover:bg-blue-400/15"
                                : "text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(room)}
                            title="Delete Room"
                            className="p-2 rounded-xl text-red-500 hover:bg-red-500/15 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredRooms.length === 0 && (
        <div
          className={`mt-6 rounded-2xl border p-12 text-center ${
            theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
        >
          <DoorOpen
            size={36}
            className={`mx-auto ${theme ? "text-gray-600" : "text-gray-300"}`}
          />
          <h3
            className={`mt-3 text-sm font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            No rooms match your criteria
          </h3>
          <p
            className={`text-xs mt-1 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Try adjusting your search query or clear the status filter.
          </p>
        </div>
      )}

      {/* EDIT ROOM MODAL */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setEditingRoom(null)}
          />

          <section
            className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl shadow-2xl ${
              theme
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <div>
                <h2
                  className={`text-base font-bold ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  Edit Room: {editingRoom.name}
                </h2>
                <p
                  className={`text-xs mt-0.5 ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Update room capacity, location, and equipment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className={`p-2 rounded-lg transition ${
                  theme
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-400 hover:text-slate-900 hover:bg-gray-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Room Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.capacity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, capacity: e.target.value })
                    }
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Current Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Floor / Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, location: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Amenities Selector */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Select Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected = editFormData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : theme
                              ? "bg-slate-900 border-slate-700 text-gray-300 hover:border-slate-500"
                              : "bg-gray-50 border-gray-200 text-slate-700 hover:border-gray-300"
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    theme
                      ? "text-gray-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default RoomManagement;
