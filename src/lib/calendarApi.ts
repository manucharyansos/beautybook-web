import { api } from "./api";

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export type Booking = {
    id: number;
    business_id?: number;
    service_id: number;
    staff_id: number | null;

    client_name: string;
    client_phone: string;
    notes: string | null;

    status: BookingStatus;

    starts_at: string; // "YYYY-MM-DD HH:mm:ss"
    ends_at: string;   // "YYYY-MM-DD HH:mm:ss"
};

export type CreateBookingPayload = {
    service_id: number;
    staff_id: number;
    starts_at: string; // "YYYY-MM-DD HH:mm"
    client_name: string;
    client_phone: string;
    notes?: string | null;
    status?: "pending" | "confirmed";
};

export async function fetchBookings(from: string, to: string) {
    const r = await api.get("/calendar", { params: { from, to } });
    return r.data.data;
}

export async function createBooking(payload: CreateBookingPayload) {
    const r = await api.post("/bookings", payload);
    return r.data?.data ?? r.data;
}

export async function cancelBooking(id: number) {
    const r = await api.patch<Booking>(`/bookings/${id}/cancel`);
    return r.data;
}

export async function doneBooking(id: number) {
    const r = await api.patch<Booking>(`/bookings/${id}/done`);
    return r.data;
}

export async function confirmBooking(id: number) {
    const r = await api.patch<Booking>(`/bookings/${id}/confirm`);
    return r.data;
}

export async function updateBookingTime(id: number, payload: { date: string; time: string; staff_id?: number }) {
    const r = await api.patch<Booking>(`/bookings/${id}/time`, payload);
    return r.data;
}