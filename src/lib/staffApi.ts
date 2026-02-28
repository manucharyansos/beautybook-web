import { api } from "./api";

export type StaffRole = "owner" | "manager" | "staff" | "super_admin";

export type StaffUser = {
    id: number;
    name: string;
    email: string;
    role: StaffRole;
    business_id: number | null;
    is_active: boolean;
    deactivated_at: string | null;
};

export async function fetchStaff() {
    const res = await api.get("/staff?only_active=false");
    return res.data.data as StaffUser[];
}

export async function createStaff(payload: {
    name: string;
    email: string;
    password: string;
    role?: "staff" | "manager";
}) {
    const res = await api.post("/staff", payload);
    return res.data.data as StaffUser;
}

// backend routes: /api/staff/{id}/deactivate  and /api/staff/{id}/activate
export async function deactivateStaff(id: number) {
    const res = await api.post(`/staff/${id}/deactivate`);
    return res.data;
}

export async function activateStaff(id: number) {
    const res = await api.post(`/staff/${id}/activate`);
    return res.data;
}
