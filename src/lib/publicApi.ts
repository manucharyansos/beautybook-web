// src/lib/publicApi.ts
import { api } from "./api";

export type PublicBusiness = {
    id: number;
    name: string;
    slug: string;
    business_type: 'beauty' | 'dental';
    work_start: string | null;
    work_end: string | null;
    timezone: string | null;
    settings?: {
        has_rooms: boolean;
        has_patients: boolean;
    };
};

export type PublicService = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | null;
    currency: string;
    is_active: boolean;
};

export type PublicStaff = {
    id: number;
    name: string;
    role: string;
};

export type Slot = {
    starts_at: string;
    ends_at: string;
    available_rooms?: any[];
};

export async function fetchPublicBusiness(slug: string): Promise<PublicBusiness> {
    const { data } = await api.get(`/public/businesses/${slug}`);
    return data;
}

// GET /public/businesses/{slug}/services
export async function fetchPublicServices(slug: string): Promise<PublicService[]> {
    const { data } = await api.get(`/public/businesses/${slug}/services`);
    return data.data || data;
}

// GET /public/businesses/{slug}/staff
export async function fetchPublicStaff(slug: string): Promise<PublicStaff[]> {
    const { data } = await api.get(`/public/businesses/${slug}/staff`);
    return data.data || data;
}

// GET /public/businesses/{slug}/availability
export async function fetchPublicAvailability(params: {
    slug: string;
    service_id: number;
    date: string;
    staff_id?: number;
}): Promise<Slot[]> {
    const { slug, ...query } = params;
    const { data } = await api.get(`/public/businesses/${slug}/availability`, { params: query });
    return data.data || data;
}

// POST /public/businesses/{slug}/bookings
export async function createPublicBooking(payload: {
    slug: string;
    service_id: number;
    staff_id?: number;
    starts_at: string;
    client_name: string;
    client_phone: string;
    notes?: string | null;
    room_id?: number;
}): Promise<any> {
    const { slug, ...body } = payload;
    const { data } = await api.post(`/public/businesses/${slug}/bookings`, body);
    return data;
}