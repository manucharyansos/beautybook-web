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