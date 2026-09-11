// Centralized Role-Based Access Control and Permission Matrix

export const INITIAL_PERMISSIONS = [
  { id: "book_room", name: "Reserve Conference Room", admin: true, manager: true, employee: true },
  { id: "cancel_own", name: "Cancel Own Bookings", admin: true, manager: true, employee: true },
  { id: "cancel_any", name: "Cancel / Override Any Booking", admin: true, manager: true, employee: false },
  { id: "create_room", name: "Create & Provision Rooms", admin: true, manager: false, employee: false },
  { id: "edit_room", name: "Edit Room & Change Status", admin: true, manager: true, employee: false },
  { id: "delete_room", name: "Delete Rooms", admin: true, manager: false, employee: false },
  { id: "manage_users", name: "Create & Manage Users", admin: true, manager: false, employee: false },
  { id: "view_reports", name: "Access Usage Reports & Export", admin: true, manager: true, employee: false },
];

const PERMISSIONS_STORAGE_KEY = "confe_permissions";

export function normalizeRoleKey(role) {
  if (!role) return "employee";
  const lower = String(role).toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("manager")) return "manager";
  return "employee";
}

export function getPermissions() {
  const saved = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fall through to initial
    }
  }
  return INITIAL_PERMISSIONS;
}

export function savePermissions(permissions) {
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
  window.dispatchEvent(new CustomEvent("confe_permissions_updated", { detail: permissions }));
}

export function resetPermissions() {
  localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("confe_permissions_updated", { detail: INITIAL_PERMISSIONS }));
  return INITIAL_PERMISSIONS;
}

export function hasPermission(role, permissionId) {
  const roleKey = normalizeRoleKey(role);
  // Administrator always has full permission by default as safety net
  if (roleKey === "admin") return true;

  const permissions = getPermissions();
  const rule = permissions.find((p) => p.id === permissionId);
  if (!rule) return false;
  return Boolean(rule[roleKey]);
}

/**
 * Checks if a given role can navigate to a specific path
 */
export function canAccessRoute(role, path) {
  const roleKey = normalizeRoleKey(role);
  if (roleKey === "admin") return true;

  const cleanPath = path.split("?")[0].split("#")[0];

  switch (cleanPath) {
    case "/dashboard":
    case "/schedule":
    case "/notifications":
    case "/unavailable":
      return true;

    case "/booking-management":
      return hasPermission(role, "book_room");

    case "/room-management":
      return hasPermission(role, "edit_room") || hasPermission(role, "create_room");

    case "/room-creation":
      return hasPermission(role, "create_room");

    case "/reports":
      return hasPermission(role, "view_reports");

    case "/user-management":
    case "/user-creation":
      return hasPermission(role, "manage_users");

    case "/audit-logs":
    case "/roles":
    case "/settings":
      return roleKey === "admin";

    default:
      return true;
  }
}

