import { api } from "./api";

export type AnalyticsOverview = {
    today: {
        bookings: number;
        revenue: number
    };
    last_7_days: {
        bookings: number;
        revenue: number
    };
    trend: Array<{
        date: string;
        bookings: number;
    }>;
    currency: string;
};

export type RevenueData = {
    months: Array<{
        ym: string;
        revenue: number;
        bookings: number;
    }>;
    currency: string;
};

export type ServiceStats = {
    top: Array<{
        service_id: number;
        service_name: string;  // ✅ ավելացված
        bookings: number;
        revenue: number;
    }>;
    currency: string;
};

export type StaffStats = {
    rows: Array<{
        staff_id: number;
        staff_name: string;    // ✅ ավելացված
        bookings: number;
        revenue: number;
    }>;
    currency: string;
};

export async function fetchAnalyticsOverview() {
  const r = await api.get("/analytics/overview");
  return r.data.data ?? r.data;
}

export async function fetchRevenue(months: number) {
  const r = await api.get("/analytics/revenue", { params: { months } });
  return r.data.data ?? r.data;
}

export async function fetchServiceStats() {
  const r = await api.get("/analytics/services");
  return r.data.data ?? r.data;
}

export async function fetchStaffStats() {
  const r = await api.get("/analytics/staff");
  return r.data.data ?? r.data;
}