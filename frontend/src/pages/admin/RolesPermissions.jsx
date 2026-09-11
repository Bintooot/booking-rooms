import { useState } from "react";
import Banner from "../../components/Banner.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import { Save, RotateCcw } from "lucide-react";
import { getPermissions, savePermissions, resetPermissions } from "../../utils/permissions.js";

function RolesPermissions() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [permissions, setPermissions] = useState(() => getPermissions());

  const toggle = (id, role) => {
    // Admin permissions remain true to prevent accidental lockout
    if (role === "admin") return;

    setPermissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [role]: !item[role] } : item))
    );
  };

  const saveSettings = () => {
    savePermissions(permissions);
    showToast("Roles and access permissions saved successfully!");
  };

  const handleReset = () => {
    const defaults = resetPermissions();
    setPermissions(defaults);
    showToast("Reset all permissions to system defaults.", "info");
  };

  return (
    <main className="w-full min-h-screen pb-12">
      <Banner header="Roles & Permissions" theme={theme} />

      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            className={`text-lg font-bold ${
              theme ? "text-white" : "text-slate-900"
            }`}
          >
            Access Control Matrix
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              theme ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Define authorization boundaries and room scheduling privileges by role.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              theme
                ? "border-slate-700 bg-slate-800 text-gray-300 hover:bg-slate-700"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={saveSettings}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20"
          >
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>

      <section
        className={`mt-6 rounded-3xl border overflow-hidden ${
          theme ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
        }`}
      >
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
                <th className="py-4 px-6">System Privilege</th>
                <th className="py-4 px-6 text-center">Administrator</th>
                <th className="py-4 px-6 text-center">Manager</th>
                <th className="py-4 px-6 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
              {permissions.map((perm) => (
                <tr key={perm.id} className="transition hover:bg-blue-500/5">
                  <td className="py-4 px-6 font-semibold">
                    <span className={theme ? "text-gray-200" : "text-slate-800"}>
                      {perm.name}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      title="Administrator permissions are always granted"
                      className="w-4 h-4 rounded text-blue-600 opacity-60 cursor-not-allowed"
                    />
                  </td>

                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={perm.manager}
                      onChange={() => toggle(perm.id, "manager")}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </td>

                  <td className="py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={perm.employee}
                      onChange={() => toggle(perm.id, "employee")}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default RolesPermissions;

