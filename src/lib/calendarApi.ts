// src/lib/calendarApi.ts
import { api } from "./api";

export type BookingStatus =
    | "pending"
    | "confirmed"
    | "in_progress"
    | "done"
    | "completed"
    | "cancelled"
    | "no_show";

export type Booking = {
    id: number;
    business_id?: number;
    service_id: number;
    staff_id: number | null;

    client_name: string | null;
    client_phone: string | null;
    notes: string | null;

    status: BookingStatus;

    // Backend returns either "YYYY-MM-DD HH:mm:ss" or ISO; UI handles both.
    starts_at: string;
    ends_at: string;

    // Optional multi-service items
    items?: Array<{
        id: number;
        service_id: number;
        position?: number | null;
        duration_minutes?: number | null;
        price?: number | null;
        currency?: string | null;
        service?: { id: number; name: string; duration_minutes: number; price: number | null };
        // staff_id optional if backend stores per-item staff
        staff_id?: number | null;
    }>;
};

export type CreateBookingPayload = {
    // single booking
    service_id: number;
    staff_id: number;
    starts_at: string; // "YYYY-MM-DD HH:mm"
    client_name: string;
    client_phone: string;
    notes?: string | null;
    status?: "pending" | "confirmed";
};

export async function fetchBookings(from: string, to: string): Promise<Booking[]> {
    const r = await api.get("/calendar", { params: { from, to } });
    return (r.data?.data ?? []) as Booking[];
}

export async function createBooking(payload: CreateBookingPayload) {
    const r = await api.post("/bookings", payload);
    return r.data?.data ?? r.data;
}

export async function createMultiBooking(payload: {
    starts_at: string; // "YYYY-MM-DD HH:mm"
    client_name: string;
    client_phone: string;
    notes?: string | null;
    status?: "pending" | "confirmed";
    lines: Array<{ service_id: number; staff_id: number }>;
}) {
    const r = await api.post("/bookings/multi", payload);
    return r.data?.data ?? r.data;
}

export async function cancelBooking(id: number) {
    const r = await api.patch(`/bookings/${id}/cancel`);
    return r.data?.data ?? r.data;
}

export async function doneBooking(id: number) {
    const r = await api.patch(`/bookings/${id}/done`);
    return r.data?.data ?? r.data;
}

export async function confirmBooking(id: number) {
    const r = await api.patch(`/bookings/${id}/confirm`);
    return r.data?.data ?? r.data;
}

export async function updateBookingTime(id: number, payload: { starts_at: string; ends_at: string }) {
    const r = await api.patch(`/bookings/${id}/time`, payload);
    return r.data?.data ?? r.data;
}