import { api } from "./api";

export type Service = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export async function fetchServices(): Promise<Service[]> {
    const res = await api.get("/services");
    return res.data.data ?? [];
}

export async function createService(payload: {
    name: string;
    duration_minutes: number;
    price?: number | null;
    is_active?: boolean;
}) {
    const res = await api.post("/services", payload);
    return res.data.data as Service;
}

export async function updateService(id: number, payload: Partial<{
    name: string;
    duration_minutes: number;
    price: number | null;
    is_active: boolean;
}>) {
    const res = await api.put(`/services/${id}`, payload);
    return res.data.data as Service;
}

export async function deleteService(id: number) {
    await api.delete(`/services/${id}`);
    return true;
}
