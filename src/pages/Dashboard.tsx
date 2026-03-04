import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, TrendingUp, Users2, Clock, Star, Award } from "lucide-react";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { cn } from "../lib/cn";
import { useState } from "react";

type DashboardData = {
    seats: { active: number; limit: number | null };
    stats: {
        today_bookings: number;
        next_7_days_bookings: number;
        total_clients?: number;
        avg_rating?: number;
    };
    upcoming: Array<{ id: number; client_name: string; starts_at: string; status: string }>;
};

async function fetchDashboard(): Promise<DashboardData> {
    const r = await api.get("/dashboard");
    const d = r.data?.data ?? r.data ?? {};

    return {
        seats: d.seats ?? { active: 0, limit: null },
        stats: d.stats ?? { today_bookings: 0, next_7_days_bookings: 0 },
        upcoming: d.upcoming ?? [],
    } as DashboardData;
}

function formatDt(s: string) {
    const d = new Date(s);
    try {
        return d.toLocaleString("hy-AM", { dateStyle: "medium", timeStyle: "short" });
    } catch {
        return d.toLocaleString();
    }
}

function statusLabel(status: string) {
    switch (status) {
        case "pending":
            return {
                t: "Սպասում է",
                cls: "bg-gradient-to-r from-yellow-50/80 to-amber-50/80 text-amber-800 border-amber-200/50"
            };
        case "confirmed":
            return {
                t: "Հաստատված",
                cls: "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 text-blue-800 border-blue-200/50"
            };
        case "completed":
            return {
                t: "Կատարված",
                cls: "bg-gradient-to-r from-green-50/80 to-emerald-50/80 text-green-800 border-green-200/50"
            };
        case "done":
            return {
                t: "Կատարված",
                cls: "bg-gradient-to-r from-green-50/80 to-emerald-50/80 text-green-800 border-green-200/50"
            };
        case "cancelled":
            return {
                t: "Չեղարկված",
                cls: "bg-gradient-to-r from-gray-50/80 to-slate-50/80 text-gray-700 border-gray-200/50"
            };
        default:
            return {
                t: status,
                cls: "bg-gradient-to-r from-gray-50/80 to-slate-50/80 text-gray-700 border-gray-200/50"
            };
    }
}

// Premium Stat Card
function PremiumStatCard({
                             icon: Icon,
                             label,
                             value,
                             hint,
                             trend,
                             gradient = "from-[#C5A28A]/10 to-[#B88E72]/10"
                         }: {
    icon: any;
    label: string;
    value: React.ReactNode;
    hint?: string;
    trend?: number;
    gradient?: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative"
        >
            <Card className="relative p-6 overflow-hidden border border-[#E8D5C4]/30
                           hover:border-[#C5A28A]/50 transition-all duration-700">
                {/* Background gradient */}
                <motion.div
                    className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
                    animate={{
                        opacity: isHovered ? 0.8 : 0.4,
                        scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ duration: 0.7 }}
                />

                {/* Decorative lines */}
                <div className="absolute top-0 left-0 w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-[#C5A28A]/20 rounded-tl-2xl" />
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24">
                    <div className="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-[#C5A28A]/20 rounded-br-2xl" />
                </div>

                <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-sm text-[#8F6B58] font-light tracking-wide">{label}</div>
                            <div className="mt-2 text-4xl font-light text-[#2C2C2C]">{value}</div>
                            {hint && (
                                <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                                    {hint}
                                </div>
                            )}
                            {trend !== undefined && (
                                <div className="mt-2 flex items-center gap-1 text-xs">
                                    <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
                                        {trend >= 0 ? "+" : ""}{trend}%
                                    </span>
                                    <span className="text-[#8F6B58] font-light">նախորդ շաբաթվա համեմատ</span>
                                </div>
                            )}
                        </div>

                        <motion.div
                            animate={{ rotate: isHovered ? 360 : 0 }}
                            transition={{ duration: 0.7, ease: "easeInOut" }}
                            className="h-14 w-14 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                     flex items-center justify-center shadow-lg shadow-[#C5A28A]/20"
                        >
                            <Icon size={22} className="text-white" />
                        </motion.div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// Premium Upcoming Booking Item
function PremiumBookingItem({ booking, index }: { booking: any; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const st = statusLabel(booking.status);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                          rounded-xl border border-[#E8D5C4]/30 bg-white/80 backdrop-blur-sm
                          px-4 py-3 hover:border-[#C5A28A]/50 hover:shadow-md
                          transition-all duration-500 overflow-hidden">

                {/* Background on hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#C5A28A]/5 to-[#B88E72]/5"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                />

                <div className="relative flex items-start gap-3 min-w-0">
                    <motion.div
                        animate={{ scale: isHovered ? 1.2 : 1 }}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72] mt-2"
                    />

                    <div className="min-w-0">
                        <div className="font-light text-[#2C2C2C] truncate">{booking.client_name}</div>
                        <div className="text-xs text-[#8F6B58] font-light flex items-center gap-2 mt-1">
                            <Clock size={12} />
                            {formatDt(booking.starts_at)}
                        </div>
                    </div>
                </div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                        "relative text-xs border rounded-full px-3 py-1.5 w-fit font-light",
                        st.cls
                    )}
                >
                    {st.t}
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const q = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboard,
        staleTime: 15_000,
    });

    const data = q.data;

    // Mock trend data (can be replaced with real data)
    const trends = {
        today: 12,
        week: 8,
        clients: 15
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 w-full min-w-0 bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] p-6 rounded-3xl"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
            >
                <div>
                    <div className="text-sm text-[#8F6B58] font-light tracking-wide">Ակնարկ</div>
                    <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
                        <Award size={28} className="text-[#C5A28A]" />
                        <span>Վահանակ</span>
                    </div>
                    <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                        Ամփոփ վիճակագրություն և մոտակա ամրագրումներ
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {q.isFetching && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-[#8F6B58] font-light inline-flex items-center gap-2
                                     bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E8D5C4]/30"
                        >
                            <Spinner size="sm" />
                            Թարմացվում է…
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Error */}
            {q.isError && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-5 border-red-200/50 bg-red-50/50 backdrop-blur-sm rounded-xl">
                        <div className="text-sm text-red-700 font-light">
                            {(q.error as any)?.response?.data?.message ?? "Չհաջողվեց բեռնել վահանակը"}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Loading */}
            {q.isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Card className="p-8 border border-[#E8D5C4]/30 rounded-xl">
                        <div className="flex items-center justify-center gap-3 text-sm text-[#8F6B58] font-light">
                            <Spinner size="md" />
                            Բեռնում…
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Content */}
            {data && (
                <>
                    {/* Stats Grid */}
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <PremiumStatCard
                            icon={Users2}
                            label="Նստատեղեր"
                            value={
                                <>
                                    {data.seats.active}{" "}
                                    <span className="text-[#8F6B58] text-2xl font-light">/ {data.seats.limit ?? "∞"}</span>
                                </>
                            }
                            hint="Ակտիվ օգտագործվող տեղեր"
                            trend={trends.clients}
                            gradient="from-[#C5A28A]/5 to-[#B88E72]/5"
                        />

                        <PremiumStatCard
                            icon={CalendarDays}
                            label="Այսօրվա ամրագրումներ"
                            value={data.stats.today_bookings}
                            hint="Ընդհանուր այսօր"
                            trend={trends.today}
                            gradient="from-[#C5A28A]/5 to-[#B88E72]/5"
                        />

                        <PremiumStatCard
                            icon={TrendingUp}
                            label="Առաջիկա 7 օր"
                            value={data.stats.next_7_days_bookings}
                            hint="Պլանավորված ամրագրումներ"
                            trend={trends.week}
                            gradient="from-[#C5A28A]/5 to-[#B88E72]/5"
                        />
                    </motion.div>

                    {/* Upcoming Bookings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="relative p-6 overflow-hidden border border-[#E8D5C4]/30 rounded-xl">
                            {/* Decorative header */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C5A28A]/5 to-[#B88E72]/5 rounded-full blur-3xl" />

                            <div className="relative">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Star size={18} className="text-[#C5A28A]" />
                                            <div className="font-light text-[#2C2C2C] text-lg">Մոտակա ամրագրումներ</div>
                                        </div>
                                        <div className="text-xs text-[#8F6B58] font-light mt-1 flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                                            Ամենամոտ հանդիպումները ըստ ժամանակի
                                        </div>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="text-sm text-[#8F6B58] font-light bg-white/50 backdrop-blur-sm
                                                 px-4 py-1.5 rounded-full border border-[#E8D5C4]/30"
                                    >
                                        {data.upcoming.length}
                                    </motion.div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    {data.upcoming.map((b, index) => (
                                        <PremiumBookingItem key={b.id} booking={b} index={index} />
                                    ))}

                                    {data.upcoming.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-[#8F6B58] font-light text-center py-12
                                                     bg-white/30 backdrop-blur-sm rounded-xl border border-dashed border-[#E8D5C4]/30"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <CalendarDays size={32} className="text-[#C5A28A]/30" />
                                                <span>Մոտակա ամրագրումներ չկան 🙂</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Quick Actions or Additional Info could go here */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                        {[
                            { label: "Ընդհանուր հաճախորդներ", value: "1,234", icon: Users2 },
                            { label: "Միջին գնահատական", value: "4.8 ★", icon: Star },
                            { label: "Կատարված ամրագրումներ", value: "856", icon: CalendarDays },
                            { label: "Ակտիվ աշխատակիցներ", value: "12", icon: TrendingUp },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -2 }}
                                className="bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-[#E8D5C4]/20
                                         hover:border-[#C5A28A]/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon size={14} className="text-[#C5A28A]" />
                                    <span className="text-xs text-[#8F6B58] font-light">{item.label}</span>
                                </div>
                                <div className="mt-1 text-sm font-light text-[#2C2C2C]">{item.value}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}
        </motion.div>
    );
}