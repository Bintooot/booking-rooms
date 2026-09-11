import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { getUsers, updateUser, deleteUser as apiDeleteUser } from "../../api/users.js";
import { useToast } from "../../components/Toast.jsx";
import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  Mail,
  Pencil,
  Trash2,
  X,
  UserCheck,
  Briefcase,
} from "lucide-react";

function UserManagement() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Edit User Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    role: "Employee",
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = u.name || "";
      const email = u.email || "";
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || u.role?.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const openEdit = (user) => {
    setEditingUser(user);
    setEditData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Employee",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updated = await updateUser(editingUser.id, editData);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updated } : u))
      );
      showToast(`User "${editData.name}" updated successfully`);
      setEditingUser(null);
    } catch {
      showToast("Failed to update user", "error");
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Remove user "${user.name}"?`);
    if (!confirmed) return;

    try {
      await apiDeleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`User "${user.name}" removed`);
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  const adminCount = users.filter((u) => u.role?.toLowerCase().includes("admin")).length;
  const managerCount = users.filter((u) => u.role?.toLowerCase().includes("manager")).length;
  const employeeCount = users.filter((u) => u.role?.toLowerCase().includes("employee")).length;

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-xs outline-none transition ${
    theme
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-gray-500 focus:border-blue-400"
      : "bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="User Management" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Team Members & Roles
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Review accounts, configure permissions, and manage organization access.
          </p>
        </div>

        <Link
          to="/user-creation"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <UserPlus size={16} />
          Create Team Member
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Members", value: users.length, icon: <Users size={18} /> },
          { label: "Administrators", value: adminCount, icon: <ShieldCheck size={18} /> },
          { label: "Managers", value: managerCount, icon: <Briefcase size={18} /> },
          { label: "Employees", value: employeeCount, icon: <UserCheck size={18} /> },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-2xl border p-4 ${
              theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  theme ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}
              >
                {kpi.icon}
              </div>
              <span
                className={`text-2xl font-black ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {kpi.value}
              </span>
            </div>
            <p
              className={`text-xs mt-3 font-medium ${
                theme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {kpi.label}
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                theme ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search by user name or email address..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-medium outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-gray-50 border-gray-200 text-slate-700"
            }`}
          >
            <option value="All">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Manager">Manager</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </section>

      {/* User Table */}
      <section
        className={`mt-6 rounded-3xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading members...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    theme
                      ? "border-slate-700 bg-slate-900/40 text-gray-400"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}
                >
                  <th className="py-3.5 px-5">Member</th>
                  <th className="py-3.5 px-4">Role & Access</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {filteredUsers.map((user) => {
                  const initials = user.name
                    ? user.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "U";

                  return (
                    <tr key={user.id} className="transition hover:bg-blue-500/5">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              theme
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`font-bold ${
                                theme ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {user.name}
                            </p>
                            <p
                              className={`text-[11px] flex items-center gap-1 mt-0.5 ${
                                theme ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <Mail size={11} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            user.role?.toLowerCase().includes("admin")
                              ? theme
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                              : user.role?.toLowerCase().includes("manager")
                                ? theme
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                                : theme
                                  ? "bg-slate-700 text-gray-300 border-slate-600"
                                  : "bg-gray-100 text-slate-700 border-gray-200"
                          }`}
                        >
                          <ShieldCheck size={11} />
                          {user.role || "Employee"}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-500 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      </td>

                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "Active"}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            title="Edit User"
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            title="Remove User"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition"
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
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="py-12 text-center text-xs text-gray-400">
            No team members match your filter criteria.
          </div>
        )}
      </section>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setEditingUser(null)}
          />

          <section
            className={`relative w-full max-w-md rounded-3xl shadow-2xl ${
              theme
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <h3
                className={`text-base font-bold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Edit Team Member
              </h3>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className={`p-1.5 rounded-lg transition ${
                  theme ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-slate-900"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
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
                  Role & Permissions
                </label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  className={inputClass}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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

export default UserManagement;

