import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: inject auth token from localStorage or sessionStorage
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 token expirations gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/login");
      if (!isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("confe_user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("confe_user");
        window.dispatchEvent(new CustomEvent("confe_auth_expired"));
      }
    }
    return Promise.reject(error);
  }
);
