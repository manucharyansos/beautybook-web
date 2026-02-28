// src/admin/pages/AdminDashboard.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Building2,
    Users,
    CalendarCheck,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Sparkles,
    Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    adminAnalyticsService,
    type DashboardFilters,
} from "../services/adminAnalyticsApi";
import type { DashboardResponse } from "../types/analytics.types";
import { downloadBlob, filenameFromContentDisposition } from "../lib/download";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";

function fmtAMD(n: number) {
    return new Intl.NumberFormat("hy-AM").format(n) + " ֏";
}

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [filters, setFilters] = useState<DashboardFilters>({ period: "30_days" });
    const [exporting, setExporting] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["admin", "analytics-dashboard", filters],
        queryFn: async () =>
            (await adminAnalyticsService.getDashboard(filters)) as DashboardResponse,
        staleTime: 60_000,
    });

    const stats = data?.data;

    const handlePeriodChange = (period: DashboardFilters["period"]) => {
        if (!period) return;
        if (period !== "custom") {
            setFilters({ period });
        } else {
            setFilters((prev) => ({ ...prev, period: "custom" }));
        }
    };

    const handleDateRangeChange = (from: string, to: string) => {
        setFilters({ period: "custom", from, to });
    };

    const cards = useMemo(() => {
        if (!stats) return [];
        return [
            {
                title: "Ընդհանուր բիզնեսներ", // Փոփոխված
                value: stats.businesses.total, // Փոփոխված
                icon: Building2,
                bgColor: "bg-blue-50",
                textColor: "text-blue-600",
                trend: stats.businesses.growth, // Փոփոխված
                subValue: `${stats.businesses.active} ակտիվ · ${stats.businesses.suspended} կասեցված · ${stats.businesses.new} նոր`, // Փոփոխված
            },
            {
                title: "Ընդհանուր օգտատերեր",
                value: stats.users.total,
                icon: Users,
                bgColor: "bg-green-50",
                textColor: "text-green-600",
                trend: stats.users.growth,
                subValue: `${stats.users.staff} աշխատակից · ${stats.users.owners} սեփականատեր · ${stats.users.new} նոր`,
            },
            {
                title: "Ամրագրումներ",
                value: stats.bookings.period_total,
                icon: CalendarCheck,
                bgColor: "bg-purple-50",
                textColor: "text-purple-600",
                trend: stats.bookings.trend,
                subValue: `${stats.bookings.today} այսօր`,
            },
            {
                title: "Եկամուտ",
                value: fmtAMD(stats.revenue.period_total),
                icon: DollarSign,
                bgColor: "bg-amber-50",
                textColor: "text-amber-600",
                trend: stats.revenue.trend,
                subValue: `${fmtAMD(stats.revenue.today)} այսօր · ${fmtAMD(
                    stats.revenue.all_time_total
                )} ամբողջ ժամանակ`,
            },
        ];
    }, [stats]);

    const handleExportRevenue = async () => {
        if (!stats) return;
        if (exporting) return;

        setExporting(true);
        try {
            const res = await adminAnalyticsService.exportRevenue({
                period: filters.period,
                from: filters.from,
                to: filters.to,
                group_by: stats.charts.group_by,
            });

            const cd =
                res.headers?.["content-disposition"] ||
                res.headers?.["Content-Disposition"];

            const filename =
                filenameFromContentDisposition(cd) ||
                `revenue_${stats.date_range.start}_${stats.date_range.end}.csv`;

            downloadBlob(res.data, filename);
        } catch {
            alert("Չհաջողվեց ներբեռնել եկամուտների CSV ֆայլը");
        } finally {
            setExporting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                Չհաջողվեց բեռնել տվյալները
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light text-gray-900">Վահանակ</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Տվյալները՝ {stats.date_range.start} - {stats.date_range.end}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filters.period}
                        onChange={(e) =>
                            handlePeriodChange(
                                e.target.value as DashboardFilters["period"]
                            )
                        }
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C5A28A]"
                    >
                        <option value="7_days">Վերջին 7 օր</option>
                        <option value="30_days">Վերջին 30 օր</option>
                        <option value="90_days">Վերջին 90 օր</option>
                        <option value="12_months">Վերջին 12 ամիս</option>
                        <option value="custom">Այլ ժամանակահատված</option>
                    </select>

                    {filters.period === "custom" && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filters.from || ""}
                                onChange={(e) =>
                                    handleDateRangeChange(e.target.value, filters.to || "")
                                }
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="date"
                                value={filters.to || ""}
                                onChange={(e) =>
                                    handleDateRangeChange(filters.from || "", e.target.value)
                                }
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                    )}

                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        title="Թարմացնել"
                    >
                        ↻
                    </button>

                    <button
                        onClick={handleExportRevenue}
                        disabled={exporting}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        title="Ներբեռնել եկամուտները CSV"
                    >
                        <Download size={20} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{card.title}</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-1">
                                    {card.value}
                                </p>

                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`text-xs flex items-center gap-1 ${
                                            card.trend >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                    >
                                        {card.trend >= 0 ? (
                                            <ArrowUpRight size={14} />
                                        ) : (
                                            <ArrowDownRight size={14} />
                                        )}
                                        {Math.abs(card.trend)}%
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        նախորդ նույն ժամանակահատվածից
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 mt-2">{card.subValue}</p>
                            </div>

                            <div className={`${card.bgColor} p-3 rounded-lg`}>
                                <card.icon className={card.textColor} size={24} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Եկամուտների դինամիկա
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.charts.revenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#C5A28A" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Ամրագրումների դինամիկա
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.charts.bookings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="bookings" fill="#C5A28A" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent businesses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Վերջին բիզնեսներ</h2>
                </div>

                <div className="divide-y divide-gray-100">
                    {stats.recent_businesses?.map((business) => ( // Փոփոխված
                        <div
                            key={business.id}
                            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/admin/businesses/${business.id}`)} // Փոփոխված
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-medium text-gray-900">{business.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {business.users_count || 0} օգտատեր · {business.bookings_count || 0} ամրագրում
                                    </p>
                                </div>
                                {business.business_type && (
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                        business.business_type === 'beauty'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {business.business_type === 'beauty' ? (
                                            <span className="flex items-center gap-1">
                                                <Sparkles size={12} />
                                                Beauty
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Award size={12} />
                                                Dental
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        business.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : business.status === "suspended"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                    {business.status === "active"
                                        ? "Ակտիվ"
                                        : business.status === "suspended"
                                            ? "Կասեցված"
                                            : "Սպասման մեջ"}
                                </span>

                                <button
                                    className="text-gray-400 hover:text-gray-700"
                                    title="Մանրամասներ"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}