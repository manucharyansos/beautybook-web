import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/cn";
import type { Booking } from "../../lib/calendarApi";
import { Clock, User, Phone, MapPin } from "lucide-react";

function minutes(hm: string) {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function statusConfig(status: Booking["status"]) {
    switch (status) {
        case "pending":
            return {
                bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
                border: "border-amber-200",
                text: "text-amber-700",
                dot: "bg-amber-400"
            };
        case "confirmed":
            return {
                bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
                border: "border-blue-200",
                text: "text-blue-700",
                dot: "bg-blue-400"
            };
        case "done":
            return {
                bg: "bg-gradient-to-r from-green-50 to-emerald-50",
                border: "border-green-200",
                text: "text-green-700",
                dot: "bg-green-400"
            };
        case "cancelled":
            return {
                bg: "bg-gradient-to-r from-gray-50 to-slate-50",
                border: "border-gray-200",
                text: "text-gray-500",
                dot: "bg-gray-400"
            };
        default:
            return {
                bg: "bg-white",
                border: "border-gray-200",
                text: "text-gray-700",
                dot: "bg-gray-400"
            };
    }
}

type Props = {
    date: string; // YYYY-MM-DD
    bookings: Booking[];
    serviceName: (id: number) => string;
    staffName: (id: number | null) => string;
    canSeeAll: boolean;
    startHour?: number; // default 9
    endHour?: number;   // default 20
};

export function DayView({
                            date,
                            bookings,
                            serviceName,
                            staffName,
                            canSeeAll,
                            startHour = 9,
                            endHour = 20,
                        }: Props) {
    const dayBookings = useMemo(() => {
        return bookings
            .filter((b) => b.starts_at.slice(0, 10) === date)
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }, [bookings, date]);

    const startMin = startHour * 60;
    const endMin = endHour * 60;
    const total = endMin - startMin;

    const hours = useMemo(
        () => Array.from({ length: endHour - startHour + 1 }).map((_, i) => startHour + i),
        [startHour, endHour]
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
            {/* Left: hour labels */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="p-4 overflow-hidden border border-[#E8D5C4]/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-[#C5A28A]" />
                        <div className="text-sm font-light text-[#2C2C2C]">Ժամեր</div>
                    </div>
                    <div className="space-y-3">
                        {hours.map((h, i) => (
                            <motion.div
                                key={h}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="text-sm text-[#8F6B58] font-light py-1 border-b border-[#E8D5C4]/10 last:border-0"
                            >
                                {String(h).padStart(2, "0")}:00
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Right: timeline */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="p-4 overflow-hidden border border-[#E8D5C4]/30 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#C5A28A]" />
                            <div className="text-sm font-light text-[#2C2C2C]">Օրվա ժամանակացույց</div>
                        </div>
                        <div className="text-xs text-[#8F6B58] font-light bg-[#F9F5F0] px-3 py-1 rounded-full">
                            {dayBookings.length} ամրագրում
                        </div>
                    </div>

                    <div className="relative border border-[#E8D5C4]/30 rounded-xl bg-white overflow-hidden">
                        {/* Grid lines */}
                        <div className="absolute inset-0">
                            {hours.slice(0, -1).map((h, idx) => {
                                const top = ((idx * 60) / total) * 100;
                                return (
                                    <div
                                        key={h}
                                        className="absolute left-0 right-0 border-t border-[#E8D5C4]/20"
                                        style={{ top: `${top}%` }}
                                    />
                                );
                            })}
                        </div>

                        {/* Time labels on the timeline */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-[#E8D5C4]/20 bg-[#F9F5F0]/50">
                            {hours.map((h, idx) => {
                                const top = (idx * 60 / total) * 100;
                                return (
                                    <div
                                        key={h}
                                        className="absolute right-2 text-[10px] text-[#8F6B58] font-light"
                                        style={{ top: `${top}%`, transform: 'translateY(-50%)' }}
                                    >
                                        {h}:00
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bookings layer */}
                        <div className="relative h-[720px] ml-12">
                            {dayBookings.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#F9F5F0] flex items-center justify-center">
                                            <Clock size={24} className="text-[#C5A28A]" />
                                        </div>
                                        <div className="text-sm text-[#8F6B58] font-light">
                                            Այս օրը ամրագրում չկա
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {dayBookings.map((b, index) => {
                                const s = b.starts_at.slice(11, 16);
                                const e = b.ends_at.slice(11, 16);
                                const sMin = minutes(s);
                                const eMin = minutes(e);

                                const topPx = (clamp(sMin, startMin, endMin) - startMin) / total;
                                const heightPx = (clamp(eMin, startMin, endMin) - clamp(sMin, startMin, endMin)) / total;
                                const config = statusConfig(b.status);

                                return (
                                    <motion.div
                                        key={b.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02, zIndex: 10 }}
                                        className={cn(
                                            "absolute left-1 right-1 rounded-xl border p-3 shadow-sm",
                                            "transition-all duration-300 cursor-pointer",
                                            config.bg,
                                            config.border,
                                            "hover:shadow-md"
                                        )}
                                        style={{
                                            top: `calc(${topPx * 100}% + 4px)`,
                                            height: `calc(${Math.max(heightPx * 100, 0.06) * 100}% - 8px)`,
                                            minHeight: '60px'
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-2 h-full">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                                                    <div className="font-light text-[#2C2C2C] truncate text-sm">
                                                        {b.client_name}
                                                    </div>
                                                </div>

                                                <div className="mt-1 flex items-center gap-2 text-xs text-[#8F6B58] font-light">
                                                    <Clock size={10} />
                                                    <span>{s}–{e}</span>
                                                    <span>•</span>
                                                    <span>{serviceName(b.service_id)}</span>
                                                </div>

                                                <div className="mt-1 flex items-center gap-2 text-xs text-[#8F6B58] font-light">
                                                    <Phone size={10} />
                                                    <span>{b.client_phone}</span>
                                                </div>

                                                {canSeeAll && b.staff_id && (
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-[#8F6B58] font-light">
                                                        <User size={10} />
                                                        <span>{staffName(b.staff_id)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <span className={cn(
                                                "text-[10px] px-2 py-1 rounded-full border font-light whitespace-nowrap",
                                                config.bg,
                                                config.border,
                                                config.text
                                            )}>
                                                {b.status === "pending" && "Սպասում է"}
                                                {b.status === "confirmed" && "Հաստատված"}
                                                {b.status === "done" && "Կատարված"}
                                                {b.status === "cancelled" && "Չեղարկված"}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}