// src/admin/services/adminBusinessesApi.ts
import { adminApi } from "./adminApi";
import type { Business, BusinessDetailsResponse } from "../types/admin.types";

export const adminBusinessesApi = {
    list: (params?: any) => adminApi.get<{ data: Business[] }>("/businesses", { params }),

    get: (id: number) => adminApi.get<{ data: BusinessDetailsResponse }>(`/businesses/${id}`),

    suspend: (id: number) => adminApi.post(`/businesses/${id}/suspend`),

    restore: (id: number) => adminApi.post(`/businesses/${id}/restore`),

    updatePlan: (id: number, planCode: string) =>
        adminApi.patch(`/businesses/${id}/plan`, { plan_code: planCode }),

    extendTrial: (id: number, days: number) =>
        adminApi.patch(`/businesses/${id}/trial`, { days }),
};