// src/lib/bookingsApi.ts
import { api } from "./api";

export type Role = 'owner' | 'manager' | 'staff' | 'super_admin';

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export type Booking = {
    id: number;
    business_id: number; // փոխել salon_id-ից business_id
    service_id: number;
    staff_id: number | null;
    client_id?: number;
    client_name: string;
    client_phone: string;
    notes: string | null;
    status: BookingStatus;
    starts_at: string;
    ends_at: string;
    final_price?: number;
    currency?: string;
    service_name?: string;
    staff_name?: string;
    room_id?: number;
    booking_code?: string;
};

export type CreateBookingPayload = {
    service_id: number;
    staff_id: number;
    starts_at: string;
    client_name: string;
    client_phone: string;
    client_id?: number;
    notes?: string | null;
    status?: "pending" | "confirmed";
    room_id?: number;
};

export async function fetchBookings(params?: {
    from?: string;
    to?: string;
    date?: string;
    week_start?: string;
    status?: string;
    staff_id?: number;
}) {
    const r = await api.get("/bookings", { params });
    return r.data.data ?? [];
}

export async function fetchBooking(id: number): Promise<Booking> {
    const r = await api.get(`/bookings/${id}`);
    return r.data.data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const r = await api.post("/bookings", payload);
    return r.data.data;
}

export async function updateBooking(id: number, payload: Partial<Booking>): Promise<Booking> {
    const r = await api.put(`/bookings/${id}`, payload);
    return r.data.data;
}

export async function cancelBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/cancel`);
}

export async function doneBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/done`);
}

export async function confirmBooking(id: number): Promise<void> {
    await api.patch(`/bookings/${id}/confirm`);
}

export async function updateBookingTime(id: number, starts_at: string, ends_at: string): Promise<Booking> {
    const r = await api.patch(`/bookings/${id}/time`, { starts_at, ends_at });
    return r.data.data;
}