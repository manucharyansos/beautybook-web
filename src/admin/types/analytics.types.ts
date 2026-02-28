// src/admin/types/analytics.types.ts
export type DashboardResponse = {
    success: boolean;
    data: {
        period: string;
        date_range: { start: string; end: string };
        businesses: {
            total: number;
            active: number;
            suspended: number;
            pending: number;
            new: number;
            growth: number;
        };
        users: {
            total: number;
            owners: number;
            managers: number;
            staff: number;
            new: number;
            growth: number;
        };
        bookings: {
            period_total: number;
            today: number;
            trend: number;
        };
        revenue: {
            period_total: number;
            today: number;
            all_time_total: number;
            trend: number;
        };
        subscriptions: {
            active: number;
            trialing: number;
            canceled: number;
            mrr: number;
        };
        recent_businesses: Array<{
            id: number;
            name: string;
            business_type: 'beauty' | 'dental';
            status: 'active' | 'suspended' | 'pending';
            users_count: number;
            bookings_count: number;
        }>;
        charts: {
            group_by: 'day' | 'week' | 'month';
            revenue: Array<{ period: string; bookings: number; revenue: number }>;
            bookings: Array<{ period: string; bookings: number }>;
        };
        currency: 'AMD';
    };
};