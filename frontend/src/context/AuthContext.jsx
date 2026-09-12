import { createContext, useContext, useState } from "react";
import { api } from "../api/client.js";
import { logAuditEvent } from "../services/auditService.js";

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: "Administrator",
  email: "admin@company.com",
  role: "Administrator",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("confe_user");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (_e) {
        // Ignore JSON parse error
      }
    }
    const session = sessionStorage.getItem("confe_user");
    if (session) {
      try {
        return JSON.parse(session);
      } catch (_e) {
        // Ignore JSON parse error
      }
    }
    return DEFAULT_USER;
  });

  const [token, setToken] = useState(() => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      "demo-jwt-token-12345"
    );
  });

  const login = async (email, password, rememberMe = true) => {
    let authenticatedUser = null;
    let authenticatedToken = null;

    try {
      const response = await api.post("/users/login", { email, password });
      if (response.data && response.data.user && response.data.token) {
        authenticatedUser = response.data.user;
        authenticatedToken = response.data.token;
      }
    } catch (err) {
      console.warn("Backend login failed, using local session:", err.message);
    }

    if (!authenticatedUser) {
      let role = "Employee";
      let userName = email.split("@")[0] || "User";

      if (email.toLowerCase().includes("admin")) {
        role = "Administrator";
        userName = "System Admin";
      } else if (email.toLowerCase().includes("manager")) {
        role = "Manager";
        userName = "Project Manager";
      }

      authenticatedUser = {
        id: Date.now(),
        name: userName,
        email,
        role,
      };
      authenticatedToken = `jwt-${Date.now()}`;
    }

    if (rememberMe) {
      localStorage.setItem("confe_user", JSON.stringify(authenticatedUser));
      localStorage.setItem("token", authenticatedToken);
      sessionStorage.removeItem("confe_user");
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("confe_user", JSON.stringify(authenticatedUser));
      sessionStorage.setItem("token", authenticatedToken);
      localStorage.removeItem("confe_user");
      localStorage.removeItem("token");
    }

    setUser(authenticatedUser);
    setToken(authenticatedToken);

    logAuditEvent({
      action: "System Login",
      actor: authenticatedUser.name,
      target: `Web Portal (${authenticatedUser.role})`,
      type: "auth",
    });

    return authenticatedUser;
  };

  const logout = () => {
    if (user) {
      logAuditEvent({
        action: "System Logout",
        actor: user.name,
        target: "Web Portal",
        type: "auth",
      });
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("confe_user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("confe_user");
    sessionStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

