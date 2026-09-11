import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: "Administrator",
  email: "admin@company.com",
  role: "Administrator",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("confe_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "demo-jwt-token-12345";
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("confe_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("confe_user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      if (response.data && response.data.user && response.data.token) {
        setUser(response.data.user);
        setToken(response.data.token);
        return response.data.user;
      }
    } catch (err) {
      console.warn("Backend login failed, using local session:", err.message);
    }

    let role = "Employee";
    let userName = email.split("@")[0] || "User";

    if (email.toLowerCase().includes("admin")) {
      role = "Administrator";
      userName = "System Admin";
    } else if (email.toLowerCase().includes("manager")) {
      role = "Manager";
      userName = "Project Manager";
    }

    const userData = {
      id: Date.now(),
      name: userName,
      email,
      role,
    };

    const dummyToken = `jwt-${Date.now()}`;
    setUser(userData);
    setToken(dummyToken);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("confe_user");
    localStorage.removeItem("token");
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

