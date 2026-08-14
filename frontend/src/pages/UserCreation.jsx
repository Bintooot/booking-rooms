import { useOutletContext } from "react-router-dom";
import Banner from "../components/Banner";
import {
  Plus,
  X,
  UserPlus,
  Users,
  ShieldCheck,
  Mail,
  User,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

function UserCreation() {
  const { theme, toggleTheme } = useOutletContext();

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    status: "Active",
  });

  const users = [
    {
      id: 1,
      name: "Jane Doe",
      email: "jane.doe@company.com",
      role: "Administrator",
      department: "IT",
      status: "Active",
      initials: "JD",
    },
    {
      id: 2,
      name: "Mark Reyes",
      email: "mark.reyes@company.com",
      role: "Employee",
      department: "Marketing",
      status: "Active",
      initials: "MR",
    },
    {
      id: 3,
      name: "Ana Cruz",
      email: "ana.cruz@company.com",
      role: "Employee",
      department: "Finance",
      status: "Active",
      initials: "AC",
    },
    {
      id: 4,
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Manager",
      department: "Operations",
      status: "Inactive",
      initials: "JS",
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

    console.log("New user:", formData);

    setShowForm(false);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      department: "",
      status: "Active",
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
        header="User Creation"
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              className={`text-lg font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Team Members
            </h2>

            <p
              className={`text-sm mt-1 ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Manage users who can access the room booking system.
            </p>
          </div>

          <div
            className={`hidden sm:flex items-center gap-2 text-sm ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Users size={17} />
            {users.length} users
          </div>
        </div>
      </div>

      {/* User grid */}
      <section
        className={`relative rounded-2xl border p-6 overflow-hidden ${
          theme
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Background decoration */}
        <div
          className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl ${
            theme ? "bg-blue-500/5" : "bg-blue-100/60"
          }`}
        />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

          {/* CREATE USER CARD */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`group min-h-62.5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              theme
                ? "border-slate-600 hover:border-blue-400 hover:bg-blue-500/5"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                theme
                  ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                  : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
              }`}
            >
              <UserPlus size={27} />

              <span
                className={`absolute -right-1 -bottom-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  theme
                    ? "bg-slate-800 border-slate-800 text-blue-400"
                    : "bg-white border-white text-blue-600"
                }`}
              >
                <Plus size={14} />
              </span>
            </div>

            <h3
              className={`mt-5 text-sm font-semibold ${
                theme ? "text-white" : "text-slate-900"
              }`}
            >
              Add New User
            </h3>

            <p
              className={`text-xs text-center mt-2 max-w-45 ${
                theme ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Create an account and assign access permissions.
            </p>
          </button>

          {/* EXISTING USERS */}
          {users.map((user) => (
            <div
              key={user.id}
              className={`group min-h-62.5 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                theme
                  ? "bg-slate-900/60 border-slate-700 hover:border-slate-600"
                  : "bg-gray-50/50 border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Avatar */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold ${
                    theme
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {user.initials}
                </div>

                {/* Status */}
                <span
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
                    user.status === "Active"
                      ? theme
                        ? "bg-green-500/10 text-green-400"
                        : "bg-green-50 text-green-600"
                      : theme
                        ? "bg-gray-500/10 text-gray-400"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status === "Active"
                        ? "bg-green-400"
                        : "bg-gray-400"
                    }`}
                  />
                  {user.status}
                </span>
              </div>

              <div className="mt-6">
                <h3
                  className={`font-semibold ${
                    theme ? "text-white" : "text-slate-900"
                  }`}
                >
                  {user.name}
                </h3>

                <p
                  className={`text-xs mt-1 truncate ${
                    theme ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {user.email}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={14}
                    className={
                      theme ? "text-blue-400" : "text-blue-500"
                    }
                  />

                  <span
                    className={`text-xs ${
                      theme ? "text-gray-300" : "text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase
                    size={14}
                    className={
                      theme ? "text-gray-500" : "text-gray-400"
                    }
                  />

                  <span
                    className={`text-xs ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {user.department}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <div
        className={`mt-4 flex items-center gap-2 text-xs ${
          theme ? "text-gray-500" : "text-gray-400"
        }`}
      >
        <UserPlus size={14} />
        Select "Add New User" to create a new account.
      </div>

      {/* CREATE USER MODAL */}
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
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    theme
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <UserPlus size={20} />
                </div>

                <div>
                  <h2
                    className={`text-lg font-semibold ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Create New User
                  </h2>

                  <p
                    className={`text-sm mt-1 ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Add a new member to your organization.
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
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User
                    size={16}
                    className={theme ? "text-blue-400" : "text-blue-500"}
                  />

                  <h3
                    className={`text-sm font-semibold ${
                      theme ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Mail
                    size={16}
                    className={theme ? "text-blue-400" : "text-blue-500"}
                  />

                  <h3
                    className={`text-sm font-semibold ${
                      theme ? "text-gray-200" : "text-slate-700"
                    }`}
                  >
                    Account Information
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme ? "text-gray-300" : "text-slate-700"
                      }`}
                    >
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane.doe@company.com"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Role */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme ? "text-gray-300" : "text-slate-700"
                        }`}
                      >
                        Role
                      </label>

                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Select role</option>
                        <option value="Administrator">
                          Administrator
                        </option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>

                    {/* Department */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          theme ? "text-gray-300" : "text-slate-700"
                        }`}
                      >
                        Department
                      </label>

                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Select department</option>
                        <option value="IT">IT</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">
                          Human Resources
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Account Status
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {["Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        formData.status === status
                          ? theme
                            ? "border-blue-400 bg-blue-500/10 text-blue-400"
                            : "border-blue-500 bg-blue-50 text-blue-600"
                          : theme
                            ? "border-slate-700 text-gray-400 hover:bg-slate-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {formData.status === status && (
                        <CheckCircle2 size={15} />
                      )}

                      {status}
                    </button>
                  ))}
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                >
                  <UserPlus size={16} />
                  Create User
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default UserCreation;