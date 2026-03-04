import axios from "axios";
import { useAuth } from "../store/auth";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // օրինակ՝ http://127.0.0.1:8000/api
});

// attach Bearer token
api.interceptors.request.use((config) => {
    const token = useAuth.getState().token;
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Strict mode: if token expires or backend blocks, force clean logout.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        useAuth.getState().clear();
      } catch {}
      // hard redirect to reset in-memory state (query caches, stale UI)
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);
// global auth fail handler
api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error?.response?.status === 401) {
            try {
                useAuth.getState().clear();
            } catch {
                // ignore
            }
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
