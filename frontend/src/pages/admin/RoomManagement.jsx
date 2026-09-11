import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getRooms, updateRoom, deleteRoom as apiDeleteRoom } from "../../api/rooms.js";
import { useToast } from "../../components/Toast.jsx";
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
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);

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

      const matchesStatus =
        statusFilter === "All" || room.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter]);

  const getStatusStyle = (status) => {
    if (status === "Available") {
      return theme
        ? "bg-green-500/15 text-green-400 border-green-500/30"
        : "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Occupied") {
      return theme
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200";
    }

    return theme
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const handleToggleStatus = async (room) => {
    const nextStatus = room.status === "Maintenance" ? "Available" : "Maintenance";
    try {
      await updateRoom(room.id, { status: nextStatus, is_active: nextStatus !== "Maintenance" });
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: nextStatus } : r))
      );
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

        <Link
          to="/room-creation"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <Plus size={16} />
          Create Room
        </Link>
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
        </div>
      </section>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">
          Loading rooms...
        </div>
      ) : (
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
                    ? "bg-gradient-to-br from-slate-700 to-slate-900"
                    : "bg-gradient-to-br from-blue-50 to-slate-100"
                }`}
              >
                <span
                  className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(
                    room.status,
                  )}`}
                >
                  {room.status}
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
                        {room.status === "Maintenance"
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
