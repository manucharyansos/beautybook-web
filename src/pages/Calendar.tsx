// src/pages/Calendar.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";

import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Filter,
    Plus,
    Ban,
    X,
    Trash2,
    Users,
    Clock,
    Phone,
    User,
    Scissors,
    Coffee,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Calendar as CalendarIcon,
    Settings2
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { cn } from "../lib/cn";
import { page } from "../lib/motion";
import { useAuth } from "../store/auth";

import { fetchServices, type Service } from "../lib/servicesApi";
import { fetchStaff, type StaffUser } from "../lib/staffApi";

import {
    fetchBookings,
    createMultiBooking,
    updateBookingTime,
    cancelBooking,
    confirmBooking,
    doneBooking,
    type Booking,
} from "../lib/calendarApi";

import { fetchBlocks, createBlock, deleteBlock, type Block } from "../lib/calendarBlocksApi";

import { parseBizToJS, fmtBizFromJS, fmtBizHMFromJS, fmtBizYMDFromJS } from "../lib/datetime";

// Helper functions remain the same...
function startOfWeekMonday(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day + 6) % 7;
    x.setDate(x.getDate() - diff);
    x.setHours(0, 0, 0, 0);
    return x;
}
function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}
function rangeForWeek(viewDate: Date) {
    const start = startOfWeekMonday(viewDate);
    const end = addDays(start, 7);
    return { start, end };
}

type DraftBooking = { startsAt: Date; endsAt: Date };

type DraftBlock = {
    scope: "business" | "staff";
    staffId: number | "";
    date: string;
    mode: "allday" | "duration";
    startTime: string;
    durationMin: number;
    reason: string;
};

type Line = { id: string; service_id: number | ""; staff_id: number | "" };

function uid() {
    const c: any = typeof crypto !== "undefined" ? crypto : null;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        cancelled: "bg-rose-50 text-rose-700 border-rose-200",
        done: "bg-slate-50 text-slate-700 border-slate-200",
    }[status] || "bg-slate-50 text-slate-700 border-slate-200";

    return (
        <span className={cn("px-2 py-1 text-xs font-medium rounded-full border", styles)}>
      {status === "confirmed" && "Հաստատված"}
            {status === "pending" && "Սպասվող"}
            {status === "cancelled" && "Չեղարկված"}
            {status === "done" && "Ավարտված"}
    </span>
    );
};

// Filter chip component
const FilterChip = ({
                        label,
                        active,
                        onClick,
                        count
                    }: {
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
}) => (
    <button
        onClick={onClick}
        className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            "border focus:outline-none focus:ring-2 focus:ring-offset-2",
            active
                ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 focus:ring-slate-400"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200"
        )}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span className={cn(
                "px-1.5 py-0.5 text-xs rounded-full",
                active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            )}>
        {count}
      </span>
        )}
    </button>
);

export function Calendar() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const businessId = user?.business_id ?? null;
    const bizTz = "Asia/Yerevan";

    const [viewDate, setViewDate] = useState<Date>(() => new Date());
    const [datePick, setDatePick] = useState<string>(() => fmtBizYMDFromJS(new Date(), bizTz));

    // filters
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [staffFilter, setStaffFilter] = useState<number[]>([]);
    const [serviceFilter, setServiceFilter] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // block modal
    const [blockOpen, setBlockOpen] = useState(false);
    const [blockDraft, setBlockDraft] = useState<DraftBlock>(() => ({
        scope: "staff",
        staffId: "",
        date: fmtBizYMDFromJS(new Date(), bizTz),
        mode: "duration",
        startTime: "13:00",
        durationMin: 60,
        reason: "Ընդմիջում",
    }));

    const { start, end } = useMemo(() => rangeForWeek(viewDate), [viewDate]);
    const from = fmtBizYMDFromJS(start, bizTz);
    const to = fmtBizYMDFromJS(end, bizTz);

    // Queries
    const servicesQ = useQuery({
        queryKey: ["services", businessId],
        queryFn: () => fetchServices(),
        enabled: !!businessId,
        staleTime: 60_000,
    });

    const staffQ = useQuery({
        queryKey: ["staff", businessId],
        queryFn: () => fetchStaff(),
        enabled: !!businessId,
        staleTime: 60_000,
    });

    const bookingsQ = useQuery({
        queryKey: ["bookings", businessId, from, to],
        queryFn: () => fetchBookings(from, to),
        enabled: !!businessId,
        staleTime: 10_000,
    });

    const blocksQ = useQuery({
        queryKey: ["blocks", businessId, from, to],
        queryFn: () => fetchBlocks(from, to),
        enabled: !!businessId,
        staleTime: 10_000,
    });

    const services = (servicesQ.data ?? []) as Service[];
    const staff = (staffQ.data ?? []) as StaffUser[];
    const bookings = (bookingsQ.data ?? []) as Booking[];
    const blocks = (blocksQ.data ?? []) as Block[];

    const serviceById = useMemo(() => {
        const m = new Map<number, Service>();
        for (const s of services) m.set(s.id, s);
        return m;
    }, [services]);

    const staffById = useMemo(() => {
        const m = new Map<number, StaffUser>();
        for (const s of staff) m.set(s.id, s);
        return m;
    }, [staff]);

    const events = useMemo(() => {
        // ... (events logic remains the same)
        const bookingEvents = bookings
            .filter((b) => {
                if (staffFilter.length && b.staff_id && !staffFilter.includes(b.staff_id)) return false;
                if (serviceFilter.length) {
                    const ids = (b.items?.length ? b.items.map((it) => it.service_id) : [b.service_id]).filter(Boolean) as number[];
                    const hasAny = ids.some((id) => serviceFilter.includes(id));
                    if (!hasAny) return false;
                }
                return true;
            })
            .map((b) => {
                const primary = serviceById.get(b.service_id);
                const servicesForTitle = (
                    b.items?.length
                        ? b.items
                            .slice()
                            .sort((a, z) => (a.position ?? 0) - (z.position ?? 0))
                            .map((it) => it.service?.name ?? serviceById.get(it.service_id)?.name)
                            .filter(Boolean)
                        : [primary?.name]
                ).filter(Boolean) as string[];

                const st = b.staff_id ? staffById.get(b.staff_id) : null;
                const start = parseBizToJS(b.starts_at, bizTz);
                const end = parseBizToJS(b.ends_at, bizTz);
                if (!start || !end) return null;

                const title = `${servicesForTitle.length ? servicesForTitle.join(" + ") : "Ծառայություն"} · ${b.client_name ?? "—"}`;

                return {
                    id: `b:${b.id}`,
                    title,
                    start,
                    end,
                    classNames: [b.status === "cancelled" ? "opacity-60" : ""].filter(Boolean),
                    extendedProps: {
                        type: "booking" as const,
                        booking: b,
                        staffName: st?.name ?? "",
                        serviceName: servicesForTitle.join(" + "),
                    },
                };
            })
            .filter(Boolean) as any[];

        const showStaffBlocksFor = staffFilter.length === 1 ? staffFilter[0] : null;
        const visibleBlocks = blocks.filter((bl) => {
            if (!showStaffBlocksFor) return !bl.staff_id;
            if (!bl.staff_id) return true;
            return bl.staff_id === showStaffBlocksFor;
        });

        const blockEvents = visibleBlocks
            .map((bl) => {
                const start = parseBizToJS(bl.starts_at, bizTz);
                const end = parseBizToJS(bl.ends_at, bizTz);
                if (!start || !end) return null;

                const label = bl.reason ?? (bl.staff_id ? "Ընդմիջում" : "Փակ է");

                const bg = {
                    id: `xbg:${bl.id}`,
                    title: "",
                    start,
                    end,
                    display: "background",
                    overlap: false,
                    classNames: ["sc-block-bg"],
                    extendedProps: { type: "block" as const, block: bl },
                };

                const fg = {
                    id: `x:${bl.id}`,
                    title: label,
                    start,
                    end,
                    overlap: false,
                    editable: false,
                    classNames: ["sc-block"],
                    extendedProps: { type: "block" as const, block: bl },
                };

                return [bg, fg];
            })
            .filter(Boolean)
            .flat() as any[];

        return [...blockEvents, ...bookingEvents];
    }, [bookings, blocks, staffFilter, serviceFilter, serviceById, staffById, bizTz]);

    // Create booking modal
    const [createOpen, setCreateOpen] = useState(false);
    const [draft, setDraft] = useState<DraftBooking | null>(null);
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [lines, setLines] = useState<Line[]>(() => [{ id: uid(), service_id: "", staff_id: "" }]);

    function addLine() {
        setLines((p) => [...p, { id: uid(), service_id: "", staff_id: "" }]);
    }
    function removeLine(id: string) {
        setLines((p) => p.filter((x) => x.id !== id));
    }

    function lineDurationMinutes(line: Line) {
        const sid = line.service_id ? Number(line.service_id) : null;
        const svc = sid ? serviceById.get(sid) : null;
        const dur = svc ? Number((svc as any).duration_minutes ?? 0) : 0;
        return dur;
    }

    const schedulePreview = useMemo(() => {
        if (!draft) return [];
        let cursor = new Date(draft.startsAt.getTime());
        return lines.map((ln) => {
            const dur = Math.max(5, lineDurationMinutes(ln) || 0);
            const start = new Date(cursor.getTime());
            const end = new Date(cursor.getTime() + dur * 60_000);
            cursor = end;
            return { lineId: ln.id, start, end };
        });
    }, [draft, lines, serviceById]);

    // Mutations
    const createMultiMut = useMutation({
        mutationFn: createMultiBooking,
        onSuccess: async () => {
            setCreateOpen(false);
            setDraft(null);
            setClientName("");
            setClientPhone("");
            setNotes("");
            setLines([{ id: uid(), service_id: "", staff_id: "" }]);
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const moveMut = useMutation({
        mutationFn: (p: { id: number; starts_at: string; ends_at: string }) => updateBookingTime(p.id, p),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const cancelMut = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const confirmMut = useMutation({
        mutationFn: confirmBooking,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const doneMut = useMutation({
        mutationFn: doneBooking,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
        },
    });

    const createBlockMut = useMutation({
        mutationFn: createBlock,
        onSuccess: async () => {
            setBlockOpen(false);
            await qc.invalidateQueries({ queryKey: ["blocks", businessId] });
        },
    });

    const deleteBlockMut = useMutation({
        mutationFn: deleteBlock,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["blocks", businessId] });
        },
    });

    // Handlers
    function openCreateWithRange(sel: { start: Date; end: Date }) {
        const endSafe = sel.end && sel.end > sel.start ? sel.end : new Date(sel.start.getTime() + 30 * 60_000);
        setDraft({ startsAt: sel.start, endsAt: endSafe });
        setCreateOpen(true);
        setLines([{ id: uid(), service_id: "", staff_id: "" }]);
        setLines((prev) => {
            const first = prev[0];
            const preService = serviceFilter.length === 1 ? serviceFilter[0] : "";
            const preStaff = staffFilter.length === 1 ? staffFilter[0] : "";
            return [{ ...first, service_id: preService as any, staff_id: preStaff as any }];
        });
    }

    function onSelect(arg: DateSelectArg) {
        if (!businessId) return;
        openCreateWithRange({ start: arg.start, end: arg.end });
    }

    function onEventClick(arg: EventClickArg) {
        const type = (arg.event.extendedProps as any)?.type as "booking" | "block" | undefined;

        if (type === "block") {
            const bl = (arg.event.extendedProps as any)?.block as Block | undefined;
            if (!bl) return;
            const ok = window.confirm(`Ցանկանո՞ւմ ես ջնջել այս փակումը\n${bl.reason ?? "Փակ է"}`);
            if (ok) deleteBlockMut.mutate(bl.id);
            return;
        }

        const b = (arg.event.extendedProps as any)?.booking as Booking | undefined;
        if (!b) return;

        const action = window.prompt(
            `Ամրագրում #${b.id}\n` + `Կարգավիճակ: ${b.status}\n\n` + `Գրիր՝ confirm | done | cancel`,
            ""
        );
        const a = (action ?? "").trim().toLowerCase();
        if (a === "cancel") cancelMut.mutate(b.id);
        if (a === "confirm") confirmMut.mutate(b.id);
        if (a === "done") doneMut.mutate(b.id);
    }

    function onEventDrop(arg: EventDropArg) {
        const type = (arg.event.extendedProps as any)?.type as string | undefined;
        if (type === "block") {
            arg.revert();
            return;
        }

        const rawId = String(arg.event.id);
        const id = Number(rawId.replace(/^b:/, ""));
        const startDt = arg.event.start;
        const endDt = arg.event.end;
        if (!startDt || !endDt) return;

        moveMut.mutate({
            id,
            starts_at: fmtBizFromJS(startDt, bizTz),
            ends_at: fmtBizFromJS(endDt, bizTz),
        });
    }

    function navWeek(deltaWeeks: number) {
        const next = addDays(viewDate, deltaWeeks * 7);
        setViewDate(next);
        setDatePick(fmtBizYMDFromJS(next, bizTz));
    }

    function jumpToPickedDate(v: string) {
        setDatePick(v);
        const [y, m, d] = v.split("-").map(Number);
        const dt = new Date();
        dt.setFullYear(y, (m ?? 1) - 1, d ?? 1);
        dt.setHours(0, 0, 0, 0);
        setViewDate(dt);
    }

    function toggleId(list: number[], id: number) {
        return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    }

    function resetFilters() {
        setStaffFilter([]);
        setServiceFilter([]);
    }

    function submitBlock() {
        const { scope, staffId: sid, date, mode, startTime, durationMin, reason } = blockDraft;
        const staff_id = scope === "business" ? null : sid ? Number(sid) : null;
        if (!date) return;

        let starts_at = "";
        let ends_at = "";

        if (mode === "allday") {
            starts_at = `${date} 00:00`;
            ends_at = `${date} 23:59`;
        } else {
            const startJs = parseBizToJS(`${date} ${startTime}`, bizTz);
            if (!startJs) return;
            const endJs = new Date(startJs.getTime() + Math.max(1, Number(durationMin) || 1) * 60_000);
            starts_at = fmtBizFromJS(startJs, bizTz).slice(0, 16);
            ends_at = fmtBizFromJS(endJs, bizTz).slice(0, 16);
        }

        createBlockMut.mutate({
            staff_id,
            reason: reason?.trim() || (scope === "business" ? "Փակ է" : "Ընդմիջում"),
            starts_at,
            ends_at,
        });
    }

    const isLoading = servicesQ.isLoading || staffQ.isLoading || bookingsQ.isLoading || blocksQ.isLoading;
    const hasBillingBlock = !businessId;
    const slotMinTime = "09:00:00";
    const slotMaxTime = "21:00:00";

    // Stats
    const totalBookings = bookings.length;
    const totalStaff = staff.length;
    const totalServices = services.length;
    const activeFilters = staffFilter.length + serviceFilter.length;

    return (
        <motion.div {...page} className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg">
                        <CalendarDays className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Օրացույց</h1>
                        <p className="text-sm text-slate-500">
                            Կառավարեք ձեր ամրագրումները և աշխատակիցների ժամանակացույցը
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          <span className="text-slate-900">{totalBookings}</span> ամրագրում
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          <span className="text-slate-900">{totalStaff}</span> աշխատակից
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
                        <Scissors className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          <span className="text-slate-900">{totalServices}</span> ծառայություն
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "transition-all",
                            activeFilters > 0 && "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                    >
                        <Filter className={cn("mr-2 h-4 w-4", activeFilters > 0 && "text-white")} />
                        Ֆիլտրեր
                        {activeFilters > 0 && (
                            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                {activeFilters}
                            </span>
                        )}
                    </Button>

                    <Button variant="secondary" onClick={() => setBlockOpen(true)}>
                        <Ban className="mr-2 h-4 w-4" /> Փակել ժամ/օր
                    </Button>

                    <Button variant="secondary" onClick={() => navWeek(-1)} className="px-3">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button variant="secondary" onClick={() => navWeek(1)} className="px-3">
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button variant="secondary" onClick={() => setViewDate(new Date())} className="px-4">
                        Այսօր
                    </Button>
                </div>

                <Button
                    onClick={() =>
                        openCreateWithRange({
                            start: new Date(),
                            end: new Date(new Date().getTime() + 30 * 60_000),
                        })
                    }
                    className="bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-600"
                >
                    <Plus className="mr-2 h-4 w-4" /> Նոր ամրագրում
                </Button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-6 overflow-hidden"
                    >
                        <Card className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Settings2 className="h-5 w-5 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900">Ակտիվ ֆիլտրեր</h3>
                                </div>
                                {activeFilters > 0 && (
                                    <Button variant="secondary" size="sm" onClick={resetFilters}>
                                        <X className="mr-2 h-3 w-3" /> Մաքրել բոլորը
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <Users className="h-4 w-4" /> Աշխատակիցներ
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {staff.map((s) => (
                                            <FilterChip
                                                key={s.id}
                                                label={s.name}
                                                active={staffFilter.includes(s.id)}
                                                onClick={() => setStaffFilter(prev => toggleId(prev, s.id))}
                                                count={bookings.filter(b => b.staff_id === s.id).length}
                                            />
                                        ))}
                                        {staff.length === 0 && (
                                            <p className="text-sm text-slate-500">Աշխատակիցներ չկան</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <Scissors className="h-4 w-4" /> Ծառայություններ
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {services.map((s) => (
                                            <FilterChip
                                                key={s.id}
                                                label={s.name}
                                                active={serviceFilter.includes(s.id)}
                                                onClick={() => setServiceFilter(prev => toggleId(prev, s.id))}
                                                count={bookings.filter(b =>
                                                    b.items?.some(it => it.service_id === s.id) || b.service_id === s.id
                                                ).length}
                                            />
                                        ))}
                                        {services.length === 0 && (
                                            <p className="text-sm text-slate-500">Ծառայություններ չկան</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                                <p className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    💡 Staff-ին վերաբերող break-երը երևում են միայն երբ մեկ աշխատակից եք ընտրում
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calendar Card */}
            <Card className="overflow-hidden border-0 shadow-xl">
                {hasBillingBlock && (
                    <div className="border-b border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-center gap-3 text-amber-800">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm font-medium">
                                Մուտք չկա business-ի context-ին։ Խնդրում ենք նորից մուտք գործել։
                            </p>
                        </div>
                    </div>
                )}

                <div className="border-b border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                <CalendarDays className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Շաբաթ {from} — {to}
                                </h2>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {staffFilter.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                            <Users className="h-3 w-3" />
                                            {staffFilter.length === 1
                                                ? staffById.get(staffFilter[0])?.name
                                                : `${staffFilter.length} աշխատակից`
                                            }
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                            <Users className="h-3 w-3" />
                                            Բոլոր աշխատակիցները
                                        </span>
                                    )}

                                    {serviceFilter.length > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                            <Scissors className="h-3 w-3" />
                                            {serviceFilter.length === 1
                                                ? serviceById.get(serviceFilter[0])?.name
                                                : `${serviceFilter.length} ծառայություն`
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <input
                                type="date"
                                value={datePick}
                                onChange={(e) => jumpToPickedDate(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            />
                        </div>
                    </div>
                </div>

                <div className={cn("p-4", hasBillingBlock && "pointer-events-none opacity-60")}>
                    <FullCalendar
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={false}
                        height="auto"
                        firstDay={1}
                        nowIndicator
                        selectable
                        selectMirror
                        select={onSelect}
                        events={events as any}
                        eventClick={onEventClick}
                        editable
                        eventDrop={onEventDrop}
                        allDaySlot={false}
                        slotMinTime={slotMinTime}
                        slotMaxTime={slotMaxTime}
                        slotDuration="00:15:00"
                        dayHeaderFormat={{ weekday: "short", day: "2-digit" }}
                        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                        locale="hy"
                        eventContent={(eventInfo) => {
                            const { type, booking } = eventInfo.event.extendedProps as any;

                            if (type === "block") {
                                return (
                                    <div className="flex h-full items-center gap-1 p-1 text-xs text-slate-600">
                                        <Coffee className="h-3 w-3" />
                                        <span className="truncate">{eventInfo.event.title}</span>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex h-full flex-col gap-0.5 p-1 text-xs">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="truncate font-medium">{eventInfo.event.title}</span>
                                        {booking && <StatusBadge status={booking.status} />}
                                    </div>
                                    {booking?.client_phone && (
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Phone className="h-3 w-3" />
                                            <span className="truncate">{booking.client_phone}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>
            </Card>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        <p className="text-sm font-medium text-slate-600">Բեռնում է...</p>
                    </div>
                </div>
            )}

            {/* Modals (updated styling) */}
            <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Ֆիլտրեր">
                <div className="space-y-6">
                    {/* ... filter modal content with updated styling ... */}
                </div>
            </Modal>

            <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title="Փակել ժամ/օր">
                <div className="space-y-6">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <AlertCircle className="h-4 w-4" />
                            Ինչպես է երևալու
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-600">
                            <li>• Business block-ը երևում է բոլորի view-ում</li>
                            <li>• Staff block-ը երևում է միայն երբ 1 աշխատակից ես ընտրում ֆիլտրով</li>
                        </ul>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Տեսակ</label>
                            <select
                                value={blockDraft.scope}
                                onChange={(e) => setBlockDraft((p) => ({ ...p, scope: e.target.value as any }))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            >
                                <option value="staff">Միայն աշխատակից</option>
                                <option value="business">Ամբողջ business</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Աշխատակից</label>
                            <select
                                value={blockDraft.staffId}
                                onChange={(e) => setBlockDraft((p) => ({ ...p, staffId: e.target.value ? Number(e.target.value) : "" }))}
                                disabled={blockDraft.scope === "business"}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 disabled:opacity-60"
                            >
                                <option value="">Ընտրիր...</option>
                                {staff.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Ամսաթիվ</label>
                            <input
                                type="date"
                                value={blockDraft.date}
                                onChange={(e) => setBlockDraft((p) => ({ ...p, date: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Ռեժիմ</label>
                            <select
                                value={blockDraft.mode}
                                onChange={(e) => setBlockDraft((p) => ({ ...p, mode: e.target.value as any }))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            >
                                <option value="allday">Ամբողջ օր փակել</option>
                                <option value="duration">Տևողություն</option>
                            </select>
                        </div>
                    </div>

                    {blockDraft.mode === "duration" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Սկիզբ</label>
                                <input
                                    type="time"
                                    value={blockDraft.startTime}
                                    onChange={(e) => setBlockDraft((p) => ({ ...p, startTime: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Տևողություն (րոպե)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={blockDraft.durationMin}
                                    onChange={(e) => setBlockDraft((p) => ({ ...p, durationMin: Number(e.target.value) || 1 }))}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Պատճառ</label>
                        <input
                            value={blockDraft.reason}
                            onChange={(e) => setBlockDraft((p) => ({ ...p, reason: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            placeholder="Օր․ Ընդմիջում / Հանգիստ"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
                            disabled={createBlockMut.isPending || !blockDraft.date || (blockDraft.scope === "staff" && !blockDraft.staffId && staff.length > 0)}
                            onClick={submitBlock}
                        >
                            {createBlockMut.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Պահպանում է...
                                </>
                            ) : (
                                "Փակել"
                            )}
                        </Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setBlockOpen(false)}>
                            Չեղարկել
                        </Button>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Ban className="h-4 w-4" />
                            Այս շաբաթվա փակված ժամերը
                        </h4>
                        <div className="max-h-48 space-y-2 overflow-auto pr-1">
                            {blocks.map((bl) => (
                                <div key={bl.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{bl.reason ?? "Փակ է"}</p>
                                        <p className="text-xs text-slate-500">
                                            {bl.starts_at} → {bl.ends_at}
                                            {bl.staff_id && ` · ${staffById.get(bl.staff_id)?.name}`}
                                        </p>
                                    </div>
                                    <button
                                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                                        onClick={() => deleteBlockMut.mutate(bl.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {!blocks.length && (
                                <p className="text-sm text-slate-500">Փակումներ չկան</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Նոր ամրագրում">
                <div className="space-y-6">
                    {draft && (
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="font-medium text-slate-900">Սկիզբ</p>
                                    <p className="text-slate-600">
                                        {fmtBizYMDFromJS(draft.startsAt, bizTz)} {fmtBizHMFromJS(draft.startsAt, bizTz)}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Ծառայությունները կդասավորվեն հերթով (մեկը մյուսի հետո)
                            </p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <User className="h-4 w-4" />
                                Հաճախորդի անուն
                            </label>
                            <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Օր․ Աննա Հակոբյան"
                            />
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Phone className="h-4 w-4" />
                                Հեռախոս
                            </label>
                            <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                placeholder="+374 XX XXX XXX"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">Ծառայություններ և կատարողներ</label>
                            <Button variant="secondary" size="sm" onClick={addLine}>
                                <Plus className="mr-2 h-3 w-3" /> Ավելացնել ծառայություն
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {lines.map((ln, index) => {
                                const preview = schedulePreview.find((x) => x.lineId === ln.id);
                                return (
                                    <motion.div
                                        key={ln.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-lg border border-slate-200 bg-white p-4"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500">
                                                Ծառայություն #{index + 1}
                                            </span>
                                            {lines.length > 1 && (
                                                <button
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                                                    onClick={() => removeLine(ln.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <select
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                                    value={ln.service_id}
                                                    onChange={(e) => {
                                                        const v = e.target.value ? Number(e.target.value) : "";
                                                        setLines((p) => p.map((x) => x.id === ln.id ? { ...x, service_id: v } : x));
                                                    }}
                                                >
                                                    <option value="">Ընտրիր ծառայություն...</option>
                                                    {services.map((s) => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <select
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                                                    value={ln.staff_id}
                                                    onChange={(e) => {
                                                        const v = e.target.value ? Number(e.target.value) : "";
                                                        setLines((p) => p.map((x) => x.id === ln.id ? { ...x, staff_id: v } : x));
                                                    }}
                                                >
                                                    <option value="">Ընտրիր կատարող...</option>
                                                    {staff.map((s) => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {preview && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {fmtBizHMFromJS(preview.start, bizTz)} — {fmtBizHMFromJS(preview.end, bizTz)}
                                                </span>
                                                <span className="text-slate-400">
                                                    ({lineDurationMinutes(ln)} ր)
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Նշումներ</label>
                        <textarea
                            className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Լրացուցիչ տեղեկություններ..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
                            disabled={
                                createMultiMut.isPending ||
                                !draft ||
                                !clientName ||
                                !clientPhone ||
                                lines.some((l) => !l.service_id || !l.staff_id || lineDurationMinutes(l) < 5)
                            }
                            onClick={() => {
                                if (!draft) return;
                                createMultiMut.mutate({
                                    starts_at: fmtBizFromJS(draft.startsAt, bizTz).slice(0, 16),
                                    client_name: clientName,
                                    client_phone: clientPhone,
                                    notes: notes || null,
                                    status: "confirmed",
                                    lines: lines.map((l) => ({ service_id: Number(l.service_id), staff_id: Number(l.staff_id) })),
                                });
                            }}
                        >
                            {createMultiMut.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Պահպանում է...
                                </>
                            ) : (
                                "Ստեղծել ամրագրում"
                            )}
                        </Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setCreateOpen(false)}>
                            Չեղարկել
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}