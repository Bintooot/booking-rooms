import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner.jsx";
import {
  Plus,
  Users,
  Monitor,
  DoorOpen,
  X,
  House,
  MapPin,
  FileText,
} from "lucide-react";
import { useState } from "react";

function RoomCreation() {
  const { theme, toggleTheme } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    roomName: "",
    roomType: "",
    capacity: "",
    location: "",
    description: "",
  });

  const rooms = [
    {
      id: 1,
      name: "Conference Room A",
      type: "Conference",
      capacity: 12,
      status: "Available",
      size: "large",
    },
    {
      id: 2,
      name: "Huddle Room 1",
      type: "Huddle",
      capacity: 6,
      status: "Occupied",
      size: "small",
    },
    {
      id: 3,
      name: "Boardroom",
      type: "Meeting",
      capacity: 16,
      status: "Available",
      size: "large",
    },
    {
      id: 4,
      name: "Meeting Room B",
      type: "Meeting",
      capacity: 8,
      status: "Available",
      size: "medium",
    },
    {
      id: 5,
      name: "Meeting Room D",
      type: "Meeting",
      capacity: 20,
      status: "Available",
      size: "large",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("New room:", formData);

    setShowForm(false);

    setFormData({
      roomName: "",
      roomType: "",
      capacity: "",
      location: "",
      description: "",
    });
  };

  const inputClass = `w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen">
      <Banner
        header="Room Creation"
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Page introduction */}
      <div className="mt-6 mb-6">
        <h2
          className={`text-lg font-semibold ${
            theme ? "text-white" : "text-slate-900"
          }`}
        >
          Room Layout
        </h2>

        <p
          className={`text-sm mt-1 ${
            theme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Select an available space to create a new room.
        </p>
      </div>

      {/* Floor grid */}
      <section
        className={`relative rounded-2xl border p-6 overflow-hidden ${
          theme
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Decorative grid */}
        <div
          className={`absolute inset-0 opacity-[0.04] pointer-events-none ${
            theme ? "bg-white" : "bg-slate-900"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 min-h-107.5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`relative rounded-xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                theme
                  ? "bg-slate-900/90 border-slate-700 hover:border-blue-500/50"
                  : "bg-gray-50 border-gray-200 hover:border-blue-300"
              } ${
                room.size === "large"
                  ? "lg:row-span-2"
                  : room.size === "medium"
                    ? "lg:row-span-1"
                    : ""
              }`}
            >
              {/* Room door indicator */}
              <div
                className={`absolute top-0 right-6 w-8 h-1 rounded-b ${
                  theme ? "bg-slate-600" : "bg-gray-300"
                }`}
              />

              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2.5 rounded-lg ${
                      theme
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <House size={18} />
                  </div>

                  <span
                    className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                      room.status === "Occupied"
                        ? theme
                          ? "bg-orange-500/10 text-orange-400"
                          : "bg-orange-50 text-orange-600"
                        : theme
                          ? "bg-green-500/10 text-green-400"
                          : "bg-green-50 text-green-600"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="mt-auto">
                  <h3
                    className={`font-semibold text-sm ${
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
                    {room.type}
                  </p>

                  <div
                    className={`flex items-center gap-1.5 text-xs mt-4 ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Users size={13} />
                    {room.capacity} people
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* CREATE ROOM TILE */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`group relative rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center transition-all duration-300 ${
              theme
                ? "border-slate-600 hover:border-blue-400 hover:bg-blue-500/5"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                theme
                  ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                  : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
              }`}
            >
              <Plus size={26} />
            </div>

            <h3
              className={`mt-4 text-sm font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Create Room
            </h3>

            <p
              className={`text-xs mt-1 text-center ${
                theme ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Add a new room to the layout
            </p>
          </button>
        </div>
      </section>

      {/* Bottom information */}
      <div
        className={`mt-4 flex items-center gap-2 text-xs ${
          theme ? "text-gray-500" : "text-gray-400"
        }`}
      >
        <DoorOpen size={14} />
        Click the dashed space to create a new room.
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close form"
            onClick={() => setShowForm(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <section
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
              theme
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Modal header */}
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <div>
                <h2
                  className={`text-lg font-semibold ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  Create New Room
                </h2>

                <p
                  className={`text-sm mt-1 ${
                    theme ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Configure the details for your new room.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`p-2 rounded-lg transition ${
                  theme
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-400 hover:text-slate-900 hover:bg-gray-100"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Room Name */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Room Name
                  </label>

                  <div className="relative">
                    <House
                      size={17}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type="text"
                      name="roomName"
                      value={formData.roomName}
                      onChange={handleChange}
                      placeholder="Conference Room C"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Room Type */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Room Type
                  </label>

                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select room type</option>
                    <option value="Conference Room">
                      Conference Room
                    </option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Huddle Room">Huddle Room</option>
                    <option value="Training Room">Training Room</option>
                    <option value="Boardroom">Boardroom</option>
                    <option value="Private Office">
                      Private Office
                    </option>
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Capacity
                  </label>

                  <div className="relative">
                    <Users
                      size={17}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="10"
                      min="1"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Location
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="2nd Floor"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Description
                </label>

                <div className="relative">
                  <FileText
                    size={17}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the room or its equipment..."
                    className={`${inputClass} pl-10 resize-none`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-5 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
                    theme
                      ? "text-gray-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                >
                  Create Room
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default RoomCreation;