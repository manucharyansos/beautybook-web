// src/admin/services/adminLogsApi.ts
import { adminApi } from "./adminApi";
import type { AdminLog } from "../types/admin.types";

export const adminLogsApi = {
    list: (params?: any) => adminApi.get<{ data: AdminLog[] }>("/logs", { params }),

    get: (id: number) => adminApi.get<{ data: AdminLog }>(`/logs/${id}`),

    getAdminLogs: (adminId: number) => adminApi.get(`/logs/admin/${adminId}`),

    summary: () => adminApi.get("/logs/summary"),

    clear: (days: number) => adminApi.post("/logs/clear", { days }),
};