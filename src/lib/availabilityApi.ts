// src/lib/availabilityApi.ts
import { api } from "./api";

export type Slot = { starts_at: string; ends_at: string };

export async function fetchAvailabilityDay(params: {
    service_id: number;
    staff_id: number;
    date: string;
}) {
    const token = localStorage.getItem("token");

    const r = await api.get<Slot[]>("/availability", {
        params: { ...params, _t: Date.now() },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined, // ✅ force
    });

    return Array.isArray(r.data) ? r.data : [];
}
