import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "./Toast.jsx";
import { canAccessRoute, normalizeRoleKey } from "../utils/permissions.js";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  let hasAccess = canAccessRoute(user?.role, location.pathname);

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleKey = normalizeRoleKey(user?.role);
    const normalizedAllowed = allowedRoles.map((r) => normalizeRoleKey(r));
    if (!normalizedAllowed.includes(userRoleKey)) {
      hasAccess = false;
    }
  }

  useEffect(() => {
    if (isAuthenticated && !hasAccess) {
      showToast("Access Denied: You do not have permission to view that page.", "error");
    }
  }, [isAuthenticated, hasAccess, location.pathname, showToast]);

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;

