import { useOutletContext, useNavigate } from "react-router-dom";
import Banner from "../components/Banner.jsx";
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
} from "lucide-react";
import { useMemo, useState } from "react";

function RoomManagement() {
  const { theme, toggleTheme } = useOutletContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);

  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: "Conference Room A",
      location: "2nd Floor",
      capacity: 12,
      status: "Available",
      description: "Large conference room suitable for presentations and team meetings.",
      amenities: ["WiFi", "Projector", "Display"],
    },
    {
      id: 2,
      name: "Huddle Room 1",
      location: "1st Floor",
      capacity: 6,
      status: "Occupied",
      description: "Small private room for quick meetings and team discussions.",
      amenities: ["WiFi", "Display"],
    },
    {
      id: 3,
      name: "The Boardroom",
      location: "3rd Floor",
      capacity: 20,
      status: "Available",
      description: "Premium meeting room designed for executive and management meetings.",
      amenities: ["WiFi", "Projector", "Display"],
    },
    {
      id: 4,
      name: "Meeting Room B",
      location: "2nd Floor",
      capacity: 8,
      status: "Maintenance",
      description: "Medium-sized meeting room currently undergoing maintenance.",
      amenities: ["WiFi", "Display"],
    },
    {
      id: 5,
      name: "Training Room",
      location: "1st Floor",
      capacity: 30,
      status: "Available",
      description: "Spacious room designed for training sessions and workshops.",
      amenities: ["WiFi", "Projector", "Display"],
    },
    {
      id: 6,
      name: "Executive Room",
      location: "3rd Floor",
      capacity: 8,
      status: "Available",
      description: "Quiet executive meeting space for private discussions.",
      amenities: ["WiFi", "Display"],
    },
  ]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || room.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter]);

  const getStatusStyle = (status) => {
    if (status === "Available") {
      return theme
        ? "bg-green-500/10 text-green-400 border-green-500/20"
        : "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "Occupied") {
      return theme
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-red-50 text-red-700 border-red-200";
    }

    return theme
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-orange-50 text-orange-700 border-orange-200";
  };

  const toggleRoomStatus = (id) => {
    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id === id
          ? {
              ...room,
              status:
                room.status === "Available"
                  ? "Maintenance"
                  : "Available",
            }
          : room
      )
    );

    setOpenMenu(null);
  };

  const deleteRoom = (id) => {
    const room = rooms.find((item) => item.id === id);

    const confirmed = window.confirm(
      `Delete "${room?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setRooms((currentRooms) =>
      currentRooms.filter((room) => room.id !== id)
    );

    setOpenMenu(null);
  };

  return (
    <main className="w-full min-h-screen">
      <Banner
        header="Room Management"
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Page Header */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-semibold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Manage Rooms
          </h2>

          <p
            className={`text-sm mt-1 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Create, update, and manage your conference rooms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/room-creation")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
        >
          <Plus size={17} />
          Create Room
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
            className={`rounded-xl border p-4 ${
              theme
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  theme
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.icon}
              </div>

              <span
                className={`text-2xl font-bold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {item.value}
              </span>
            </div>

            <p
              className={`text-xs mt-3 ${
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
        className={`mt-6 rounded-xl border p-4 ${
          theme
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                theme ? "text-gray-500" : "text-gray-400"
              }`}
            />

            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition ${
                theme
                  ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  : "bg-gray-50 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-400"
              }`}
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg border px-4 py-2.5 text-sm outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-gray-50 border-gray-200 text-slate-700"
            }`}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </section>

      {/* Room Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {filteredRooms.map((room) => (
          <article
            key={room.id}
            className={`group rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
              theme
                ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                : "bg-white border-gray-200 hover:border-blue-200"
            }`}
          >
            {/* Room visual */}
            <div
              className={`h-28 relative overflow-hidden ${
                theme
                  ? "bg-linear-to-br from-slate-700 to-slate-900"
                  : "bg-linear-to-br from-blue-50 to-slate-100"
              }`}
            >
              {/* Decorative room structure */}
              <div
                className={`absolute left-8 right-8 bottom-5 h-12 rounded-t-lg border-2 ${
                  theme
                    ? "border-slate-600 bg-slate-800/70"
                    : "border-blue-100 bg-white/70"
                }`}
              />

              <div
                className={`absolute left-12 bottom-9 w-8 h-5 rounded border ${
                  theme
                    ? "border-slate-500 bg-slate-700"
                    : "border-blue-200 bg-blue-50"
                }`}
              />

              <div
                className={`absolute right-12 bottom-8 w-10 h-2 rounded-full ${
                  theme ? "bg-slate-600" : "bg-blue-100"
                }`}
              />

              {/* Status */}
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${getStatusStyle(
                  room.status
                )}`}
              >
                {room.status}
              </span>

              {/* Menu */}
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu(
                      openMenu === room.id ? null : room.id
                    )
                  }
                  className={`p-2 rounded-lg ${
                    theme
                      ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                      : "text-gray-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <MoreVertical size={17} />
                </button>

                {openMenu === room.id && (
                  <div
                    className={`absolute right-0 top-10 z-20 w-44 rounded-lg border shadow-xl overflow-hidden ${
                      theme
                        ? "bg-slate-900 border-slate-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left ${
                        theme
                          ? "text-gray-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      <Pencil size={14} />
                      Edit Room
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleRoomStatus(room.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left ${
                        theme
                          ? "text-gray-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      <Power size={14} />
                      {room.status === "Maintenance"
                        ? "Set Available"
                        : "Set Maintenance"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/schedule")}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left ${
                        theme
                          ? "text-gray-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-gray-50"
                      }`}
                    >
                      <CalendarDays size={14} />
                      View Schedule
                    </button>

                    <div
                      className={`border-t ${
                        theme
                          ? "border-slate-700"
                          : "border-gray-100"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => deleteRoom(room.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10 text-left"
                    >
                      <Trash2 size={14} />
                      Delete Room
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    className={`font-semibold ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {room.name}
                  </h3>

                  <p
                    className={`text-xs mt-1 ${
                      theme ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {room.location}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1 text-xs ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Users size={13} />
                  {room.capacity}
                </div>
              </div>

              <p
                className={`text-xs leading-5 mt-4 ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {room.description}
              </p>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mt-4">
                {room.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] ${
                      theme
                        ? "bg-slate-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {amenity === "WiFi" && <Wifi size={11} />}
                    {amenity === "Projector" && <Monitor size={11} />}
                    {amenity === "Display" && <Monitor size={11} />}

                    {amenity}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div
                className={`flex items-center gap-2 mt-5 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => navigate("/schedule")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition ${
                    theme
                      ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                  }`}
                >
                  <CalendarDays size={14} />
                  Schedule
                </button>

                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Empty state */}
      {filteredRooms.length === 0 && (
        <div
          className={`mt-6 rounded-xl border p-12 text-center ${
            theme
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <DoorOpen
            size={35}
            className={`mx-auto ${
              theme ? "text-gray-600" : "text-gray-300"
            }`}
          />

          <h3
            className={`mt-4 font-semibold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            No rooms found
          </h3>

          <p
            className={`text-sm mt-1 ${
              theme ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Try changing your search or filter.
          </p>
        </div>
      )}
    </main>
  );
}

export default RoomManagement;