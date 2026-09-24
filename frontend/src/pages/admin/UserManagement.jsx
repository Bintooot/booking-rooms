import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getUsers, updateUser, deleteUser as apiDeleteUser } from "../../api/users.js";
import { useToast } from "../../components/Toast.jsx";
import { logAuditEvent } from "../../services/auditService.js";
import { addNotification } from "../../services/notificationService.js";
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
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

function UserManagement() {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
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
    password: "",
  });

  // Change Password Modal
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      password: "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const payload = {
        name: editData.name,
        email: editData.email,
        role: editData.role,
      };
      if (editData.password && editData.password.trim().length > 0) {
        if (editData.password.trim().length < 6) {
          showToast("Password must be at least 6 characters.", "error");
          return;
        }
        payload.password = editData.password.trim();
      }

      const updated = await updateUser(editingUser.id, payload);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...updated } : u))
      );

      logAuditEvent({
        action: "User Updated",
        actor: currentUser?.name || "Administrator",
        target: editData.name,
        type: "user",
      });

      showToast(`User "${editData.name}" updated successfully`);
      setEditingUser(null);
    } catch {
      showToast("Failed to update user", "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (!newPassword || newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      await updateUser(passwordUser.id, { password: newPassword });

      logAuditEvent({
        action: "Password Reset",
        actor: currentUser?.name || "Administrator",
        target: `${passwordUser.name} (${passwordUser.email})`,
        type: "user",
      });

      addNotification({
        title: "User Password Reset",
        message: `Password for "${passwordUser.name}" was reset by Administrator.`,
        type: "security",
        targetUserId: passwordUser.id,
        targetEmail: passwordUser.email,
        targetRoles: ["Administrator"],
      });

      showToast(`Password for "${passwordUser.name}" updated successfully!`);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("Failed to reset password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Remove user "${user.name}"?`);
    if (!confirmed) return;

    try {
      await apiDeleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));

      logAuditEvent({
        action: "User Deleted",
        actor: currentUser?.name || "Administrator",
        target: user.name,
        type: "user",
      });

      addNotification({
        title: "User Account Removed",
        message: `Account for "${user.name}" was deleted.`,
        type: "user",
        targetRoles: ["Administrator"],
      });

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
      : "bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500"
  }`;

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="User Management" theme={theme} />

      {/* Page Header */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-semibold ${
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm"
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
              theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
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
                className={`text-2xl font-bold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                {kpi.value}
              </span>
            </div>
            <p
              className={`text-xs mt-3 font-normal ${
                theme ? "text-gray-400" : "text-slate-500"
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
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                theme ? "text-gray-500" : "text-slate-400"
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
                  : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400"
              }`}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-normal outline-none ${
              theme
                ? "bg-slate-900 border-slate-700 text-gray-200"
                : "bg-white border-slate-200 text-slate-700"
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
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-xs"
        }`}
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading members...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-medium uppercase tracking-wider ${
                    theme
                      ? "border-slate-700 bg-slate-900/40 text-gray-400"
                      : "border-slate-200 bg-slate-50/80 text-slate-600"
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
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-medium text-xs shrink-0 ${
                              theme
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`font-medium ${
                                theme ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {user.name}
                            </p>
                            <p
                              className={`text-[11px] flex items-center gap-1 mt-0.5 ${
                                theme ? "text-gray-400" : "text-slate-500"
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
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
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
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <ShieldCheck size={11} />
                          {user.role || "Employee"}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "Active"}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordUser(user);
                              setNewPassword("");
                              setConfirmPassword("");
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition"
                          >
                            <KeyRound size={15} />
                          </button>

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
                : "bg-white border border-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <h3
                className={`text-base font-semibold ${
                  theme ? "text-white" : "text-slate-900"
                }`}
              >
                Edit Team Member
              </h3>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className={`p-1.5 rounded-lg transition ${
                  theme ? "text-gray-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
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
                  className={`block text-xs font-medium mb-1.5 ${
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
                  className={`block text-xs font-medium mb-1.5 ${
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

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  New Password <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={editData.password || ""}
                  onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className={inputClass}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Only fill this out if you wish to reset this user&apos;s password.
                </p>
              </div>

              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    theme
                      ? "text-gray-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* DEDICATED RESET PASSWORD MODAL */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setPasswordUser(null)}
          />

          <section
            className={`relative w-full max-w-md rounded-3xl shadow-2xl ${
              theme
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                theme ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3
                    className={`text-base font-semibold ${
                      theme ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Reset Password
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    For {passwordUser.name} ({passwordUser.email})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPasswordUser(null)}
                className={`p-1.5 rounded-lg transition ${
                  theme ? "text-gray-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className={`w-full rounded-xl border pl-10 pr-10 py-2.5 text-xs outline-none transition ${
                      theme
                        ? "bg-slate-900 border-slate-700 text-white focus:border-amber-400"
                        : "bg-white border-slate-300 text-slate-800 focus:border-amber-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    theme ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs outline-none transition ${
                      theme
                        ? "bg-slate-900 border-slate-700 text-white focus:border-amber-400"
                        : "bg-white border-slate-300 text-slate-800 focus:border-amber-500"
                    }`}
                  />
                </div>
              </div>

              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  theme ? "border-slate-700" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    theme
                      ? "text-gray-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-sm transition disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
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

