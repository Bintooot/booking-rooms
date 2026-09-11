import { useState, useEffect, useCallback } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getRooms, createRoom } from "../../api/rooms.js";
import { useToast } from "../../components/Toast.jsx";
import {
  Plus,
  Users,
  DoorOpen,
  X,
  House,
  MapPin,
  FileText,
  Check,
  Building,
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

function RoomCreation() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    roomName: "",
    roomType: "Conference Room",
    capacity: 8,
    location: "2nd Floor",
    description: "",
    amenities: ["WiFi", "Display"],
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newRoom = await createRoom({
        name: formData.roomName,
        capacity: Number(formData.capacity),
        location: formData.location,
        description: formData.description,
        amenities: formData.amenities,
        type: formData.roomType,
      });

      setRooms((prev) => [newRoom, ...prev]);
      showToast(`Room "${formData.roomName}" created successfully!`);
      setShowForm(false);
      setFormData({
        roomName: "",
        roomType: "Conference Room",
        capacity: 8,
        location: "2nd Floor",
        description: "",
        amenities: ["WiFi", "Display"],
      });
    } catch {
      showToast("Failed to create room. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Room Creation" theme={theme} />

      {/* Page introduction */}
      <div className="mt-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Interactive Floor Layout
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Visual layout of current facilities. Click the dashed slot to provision a new room.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <Plus size={16} />
          Create New Room
        </button>
      </div>

      {/* Floor grid */}
      <section
        className={`relative rounded-3xl border p-6 overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Decorative architectural grid background */}
        <div
          className={`absolute inset-0 opacity-[0.03] pointer-events-none ${
            theme ? "bg-white" : "bg-slate-900"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading floor layout...</div>
        ) : (
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-96">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  theme
                    ? "bg-slate-900/90 border-slate-700 hover:border-blue-500/50"
                    : "bg-gray-50/80 border-gray-200 hover:border-blue-300"
                } ${
                  room.size === "large" || room.capacity > 15
                    ? "lg:row-span-2"
                    : ""
                }`}
              >
                {/* Room doorway indicator accent */}
                <div
                  className={`absolute top-0 right-6 w-8 h-1 rounded-b ${
                    theme ? "bg-slate-600" : "bg-gray-300"
                  }`}
                />

                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-2.5 rounded-xl ${
                          theme
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <House size={18} />
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          room.status === "Occupied"
                            ? theme
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                            : room.status === "Maintenance"
                              ? theme
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-red-50 text-red-700 border-red-200"
                              : theme
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {room.status || "Available"}
                      </span>
                    </div>

                    <h3
                      className={`font-bold text-sm mt-4 ${
                        theme ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {room.name}
                    </h3>

                    <p
                      className={`text-xs mt-0.5 ${
                        theme ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {room.type || "Meeting Space"}
                    </p>

                    <p
                      className={`text-[11px] mt-1 text-blue-500 flex items-center gap-1`}
                    >
                      <MapPin size={11} />
                      {room.location || "Main Floor"}
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-between pt-4 mt-4 border-t border-gray-200/50 dark:border-slate-800 text-xs ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users size={13} />
                      {room.capacity} seats
                    </span>

                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                      {room.size || "medium"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* CREATE ROOM INTERACTIVE TILE */}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`group relative rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center transition-all duration-300 min-h-60 hover:-translate-y-1 ${
                theme
                  ? "border-slate-700 hover:border-blue-400 hover:bg-blue-500/5"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  theme
                    ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                    : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                }`}
              >
                <Plus size={26} />
              </div>

              <h3
                className={`mt-4 text-sm font-bold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Provision New Room
              </h3>

              <p
                className={`text-xs mt-1 text-center max-w-xs ${
                  theme ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Click here to add another room to this floor layout
              </p>
            </button>
          </div>
        )}
      </section>

      {/* Bottom information */}
      <div
        className={`mt-4 flex items-center gap-2 text-xs font-medium ${
          theme ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <DoorOpen size={14} className="text-blue-500" />
        All created rooms are instantly synchronized with the booking calendar and management index.
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowForm(false)}
          />

          <section
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl shadow-2xl ${
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
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Building size={20} />
                </div>
                <div>
                  <h2
                    className={`text-base font-bold ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Create New Room
                  </h2>
                  <p
                    className={`text-xs mt-0.5 ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Set specifications, capacity, and equipment.
                  </p>
                </div>
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
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Name */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Room Name
                  </label>
                  <div className="relative">
                    <House
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="text"
                      name="roomName"
                      value={formData.roomName}
                      onChange={handleChange}
                      placeholder="e.g. Innovation Hub"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Room Type */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Room Classification
                  </label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="Conference Room">Conference Room</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Huddle Room">Huddle Room</option>
                    <option value="Training Room">Training Room</option>
                    <option value="Boardroom">Boardroom</option>
                    <option value="Private Office">Private Office</option>
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Seating Capacity
                  </label>
                  <div className="relative">
                    <Users
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="8"
                      min="1"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      theme ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Floor / Wing Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. 2nd Floor, East Wing"
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Description & Usage Guidelines
                </label>
                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3.5 top-3 text-gray-400"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe equipment, room capabilities, or guidelines..."
                    className={`${inputClass} pl-10 resize-none`}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Included Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
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

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save & Provision"}
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
