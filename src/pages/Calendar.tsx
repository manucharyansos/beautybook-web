import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";

import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Plus, X } from "lucide-react";

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
    createBooking,
    updateBookingTime,
    cancelBooking,
    confirmBooking,
    doneBooking,
    type Booking,
} from "../lib/calendarApi";

import { fetchBlocks, createBlock, deleteBlock, type Block } from "../lib/calendarBlocksApi";

/**
 * Safe datetime parse (supports "YYYY-MM-DD HH:mm:ss" and ISO)
 */
function parseLocalDateTime(dt?: string | null): Date | null {
    if (!dt || typeof dt !== "string") return null;

    if (dt.includes("T")) {
        const x = new Date(dt);
        return isNaN(x.getTime()) ? null : x;
    }

    const parts = dt.split(" ");
    if (parts.length < 2) return null;

    const [d, t] = parts;
    if (!d || !t) return null;

    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm, ss] = t.split(":").map(Number);

    if (!y || !m || !day || hh === undefined || mm === undefined) return null;

    const x = new Date();
    x.setFullYear(y, m - 1, day);
    x.setHours(hh, mm, ss ?? 0, 0);
    return x;
}

function ymd(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function hm(date: Date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

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

function addMinutes(d: Date, n: number) {
    const x = new Date(d);
    x.setMinutes(x.getMinutes() + n);
    return x;
}

function rangeForWeek(viewDate: Date) {
    const start = startOfWeekMonday(viewDate);
    const end = addDays(start, 7);
    return { start, end };
}

type DraftBooking = { startsAt: Date; endsAt: Date };
type DraftBlock = { startsAt: Date; endsAt: Date };

export function Calendar() {
    const qc = useQueryClient();
    const { user } = useAuth();
    const businessId = user?.business_id ?? null;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewDate, setViewDate] = useState<Date>(() => new Date());
    const [datePick, setDatePick] = useState<string>(() => ymd(new Date()));

    // filters (draft + applied)
    const [draftStaff, setDraftStaff] = useState<number[]>([]);
    const [draftServices, setDraftServices] = useState<number[]>([]);
    const [staffFilter, setStaffFilter] = useState<number[]>([]);
    const [serviceFilter, setServiceFilter] = useState<number[]>([]);

    const { start, end } = useMemo(() => rangeForWeek(viewDate), [viewDate]);
    const from = ymd(start);
    const to = ymd(end);

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

    // Booking events
    const bookingEvents = useMemo(() => {
        return bookings
            .filter((b) => {
                if (staffFilter.length && b.staff_id && !staffFilter.includes(b.staff_id)) return false;
                if (serviceFilter.length && !serviceFilter.includes(b.service_id)) return false;
                return true;
            })
            .map((b) => {
                const s = serviceById.get(b.service_id);
                const st = b.staff_id ? staffById.get(b.staff_id) : null;

                const startDt = parseLocalDateTime(b.starts_at);
                const endDt = parseLocalDateTime(b.ends_at);
                if (!startDt || !endDt) return null;

                const title = `${s?.name ?? "Ծառայություն"} · ${b.client_name ?? "—"}`;

                return {
                    id: `b:${b.id}`,
                    title,
                    start: startDt,
                    end: endDt,
                    extendedProps: {
                        kind: "booking",
                        booking: b,
                        staffName: st?.name ?? "",
                        serviceName: s?.name ?? "",
                    },
                };
            })
            .filter(Boolean) as any[];
    }, [bookings, staffFilter, serviceFilter, serviceById, staffById]);

    // Block events (background)
    const blockEvents = useMemo(() => {
        return blocks
            .filter((blk) => {
                if (staffFilter.length && blk.staff_id && !staffFilter.includes(blk.staff_id)) return false;
                return true;
            })
            .map((blk) => {
                const s = parseLocalDateTime(blk.starts_at);
                const e = parseLocalDateTime(blk.ends_at);
                if (!s || !e) return null;

                return {
                    id: `blk:${blk.id}`,
                    title: blk.reason ?? "Փակ է",
                    start: s,
                    end: e,
                    display: "background",
                    extendedProps: { kind: "block", block: blk },
                };
            })
            .filter(Boolean) as any[];
    }, [blocks, staffFilter]);

    const events = useMemo(() => [...blockEvents, ...bookingEvents], [blockEvents, bookingEvents]);

    // Create booking modal
    const [createOpen, setCreateOpen] = useState(false);
    const [draft, setDraft] = useState<DraftBooking | null>(null);
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [serviceId, setServiceId] = useState<number | "">("");
    const [staffId, setStaffId] = useState<number | "">("");
    const [notes, setNotes] = useState("");

    // Create block modal (with presets)
    const [blockOpen, setBlockOpen] = useState(false);
    const [blockDraft, setBlockDraft] = useState<DraftBlock | null>(null);
    const [blockReason, setBlockReason] = useState<string>("Ընդմիջում");
    const [customMinutes, setCustomMinutes] = useState<number>(45);

    const createMut = useMutation({
        mutationFn: createBooking,
        onSuccess: async () => {
            setCreateOpen(false);
            setDraft(null);
            setClientName("");
            setClientPhone("");
            setServiceId("");
            setStaffId("");
            setNotes("");
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
            await qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const moveMut = useMutation({
        mutationFn: (p: { id: number; date: string; time: string; staff_id?: number }) => updateBookingTime(p.id, p),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
            await qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const cancelMut = useMutation({
        mutationFn: cancelBooking,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
            await qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const confirmMut = useMutation({
        mutationFn: confirmBooking,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
            await qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const doneMut = useMutation({
        mutationFn: doneBooking,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", businessId] });
            await qc.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const createBlockMut = useMutation({
        mutationFn: createBlock,
        onSuccess: async () => {
            setBlockOpen(false);
            setBlockDraft(null);
            setBlockReason("Ընդմիջում");
            await qc.invalidateQueries({ queryKey: ["blocks", businessId] });
        },
    });

    const deleteBlockMut = useMutation({
        mutationFn: deleteBlock,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["blocks", businessId] });
        },
    });

    function openCreateWithRange(sel: { start: Date; end: Date }) {
        setDraft({ startsAt: sel.start, endsAt: sel.end });
        setCreateOpen(true);
        if (services.length === 1) setServiceId(services[0].id);
        if (staff.length === 1) setStaffId(staff[0].id);
    }

    function openBlockWithRange(sel: { start: Date; end: Date }) {
        setBlockDraft({ startsAt: sel.start, endsAt: sel.end });
        setBlockOpen(true);
    }

    function onSelect(arg: DateSelectArg) {
        if (!businessId) return;

        const action = window.prompt("Գրիր՝ booking կամ block", "booking");
        const a = (action ?? "booking").trim().toLowerCase();

        if (a === "block") return openBlockWithRange({ start: arg.start, end: arg.end });
        return openCreateWithRange({ start: arg.start, end: arg.end });
    }

    function onEventClick(arg: EventClickArg) {
        const props = arg.event.extendedProps as any;

        if (props?.kind === "block") {
            const blk = props.block as Block | undefined;
            if (!blk) return;
            const ok = window.confirm(`Ջնջե՞լ փակումը (#${blk.id})`);
            if (ok) deleteBlockMut.mutate(blk.id);
            return;
        }

        const b = props?.booking as Booking | undefined;
        if (!b) return;

        const action = window.prompt(
            `Ամրագրում #${b.id}\nԿարգավիճակ: ${b.status}\n\nԳրիր՝ confirm | done | cancel`,
            ""
        );
        const a = (action ?? "").trim().toLowerCase();
        if (a === "cancel") cancelMut.mutate(b.id);
        if (a === "confirm") confirmMut.mutate(b.id);
        if (a === "done") doneMut.mutate(b.id);
    }

    function onEventDrop(arg: EventDropArg) {
        const props = arg.event.extendedProps as any;
        if (props?.kind === "block") {
            arg.revert();
            return;
        }

        const idStr = String(arg.event.id);
        if (!idStr.startsWith("b:")) return;

        const id = Number(idStr.replace("b:", ""));
        const startDt = arg.event.start;
        if (!startDt) return;
        moveMut.mutate({ id, date: ymd(startDt), time: hm(startDt) });
    }

    function applyFilters() {
        setStaffFilter(draftStaff);
        setServiceFilter(draftServices);
        setSidebarOpen(false);
    }

    function resetFilters() {
        setDraftStaff([]);
        setDraftServices([]);
        setStaffFilter([]);
        setServiceFilter([]);
    }

    function navWeek(deltaWeeks: number) {
        const next = addDays(viewDate, deltaWeeks * 7);
        setViewDate(next);
        setDatePick(ymd(next));
    }

    function jumpToPickedDate(v: string) {
        setDatePick(v);
        const [y, m, d] = v.split("-").map(Number);
        const dt = new Date();
        dt.setFullYear(y, (m ?? 1) - 1, d ?? 1);
        dt.setHours(0, 0, 0, 0);
        setViewDate(dt);
    }

    function setBlockPreset(kind: "day" | "60" | "30" | "custom") {
        if (!blockDraft) return;

        const s = blockDraft.startsAt;

        if (kind === "day") {
            const startOfDay = new Date(s);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(s);
            endOfDay.setHours(23, 59, 0, 0);

            setBlockDraft({ startsAt: startOfDay, endsAt: endOfDay });
            return;
        }

        if (kind === "60") {
            setBlockDraft({ startsAt: s, endsAt: addMinutes(s, 60) });
            return;
        }

        if (kind === "30") {
            setBlockDraft({ startsAt: s, endsAt: addMinutes(s, 30) });
            return;
        }

        // custom
        setBlockDraft({ startsAt: s, endsAt: addMinutes(s, Math.max(5, Number(customMinutes) || 45)) });
    }

    const isLoading = servicesQ.isLoading || staffQ.isLoading || bookingsQ.isLoading || blocksQ.isLoading;
    const hasBillingBlock = !businessId;

    return (
        <motion.div {...page} className="p-4 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-semibold">Օրացույց</div>
                        <div className="text-sm text-slate-500">Շաբաթական տեսք · ամրագրումներ + փակ ժամեր</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setSidebarOpen(true)} className="md:hidden">
                        <Filter className="mr-2 h-4 w-4" /> Ֆիլտրեր
                    </Button>

                    <Button variant="secondary" onClick={() => navWeek(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" onClick={() => navWeek(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button onClick={() => openCreateWithRange({ start: new Date(), end: new Date() })}>
                        <Plus className="mr-2 h-4 w-4" /> Նոր ամրագրում
                    </Button>

                    <Button variant="secondary" onClick={() => openBlockWithRange({ start: new Date(), end: new Date() })}>
                        Փակել ժամ/օր
                    </Button>
                </div>
            </div>

            {/* Desktop top filters */}
            <Card className="hidden md:block p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ամսաթիվ</div>
                        <input
                            type="date"
                            value={datePick}
                            onChange={(e) => jumpToPickedDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                        />
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Աշխատակիցներ</div>
                        <select
                            multiple
                            value={draftStaff.map(String)}
                            onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                                setDraftStaff(values);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm min-h-[42px]"
                        >
                            {staff.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ծառայություններ</div>
                        <select
                            multiple
                            value={draftServices.map(String)}
                            onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                                setDraftServices(values);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm min-h-[42px]"
                        >
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button className="w-full" onClick={applyFilters}>
                            Apply
                        </Button>
                        <Button variant="secondary" className="w-full" onClick={resetFilters}>
                            Reset
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Calendar */}
            <section>
                <Card className="overflow-hidden p-0">
                    <div className={cn("p-3", hasBillingBlock && "opacity-60")}>
                        {hasBillingBlock ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                Մուտք չկա business-ի context-ին։ Խնդրում եմ նորից login արա կամ ավարտիր onboarding-ը։
                            </div>
                        ) : null}

                        {bookingsQ.isError ? (
                            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                                {(bookingsQ.error as any)?.response?.data?.message ?? "Bookings error"}
                            </div>
                        ) : null}

                        {blocksQ.isError ? (
                            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                                {(blocksQ.error as any)?.response?.data?.message ?? "Blocks error"}
                            </div>
                        ) : null}
                    </div>

                    <div className={cn("p-3 pt-0", hasBillingBlock && "pointer-events-none opacity-60")}>
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
                            slotMinTime="07:00:00"
                            slotMaxTime="22:00:00"
                            slotDuration="00:15:00"
                            dayHeaderFormat={{ weekday: "short", day: "2-digit" }}
                            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                            locale="hy"
                        />
                    </div>
                </Card>
            </section>

            {/* Mobile filters */}
            <Modal open={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Ֆիլտրեր">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Ֆիլտրեր</div>
                        <Button variant="secondary" onClick={() => setSidebarOpen(false)}>
                            <X className="mr-2 h-4 w-4" /> Փակել
                        </Button>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ամսաթիվ</div>
                        <input
                            type="date"
                            value={datePick}
                            onChange={(e) => jumpToPickedDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                        />
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Աշխատակիցներ</div>
                        <div className="max-h-44 space-y-2 overflow-auto pr-1">
                            {staff.map((s) => {
                                const checked = draftStaff.includes(s.id);
                                return (
                                    <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                setDraftStaff((prev) => (checked ? prev.filter((x) => x !== s.id) : [...prev, s.id]))
                                            }
                                        />
                                        <span className="text-sm text-slate-700">{s.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ծառայություններ</div>
                        <div className="max-h-44 space-y-2 overflow-auto pr-1">
                            {services.map((s) => {
                                const checked = draftServices.includes(s.id);
                                return (
                                    <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                setDraftServices((prev) => (checked ? prev.filter((x) => x !== s.id) : [...prev, s.id]))
                                            }
                                        />
                                        <span className="text-sm text-slate-700">{s.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button className="w-full" onClick={applyFilters}>
                            Apply
                        </Button>
                        <Button variant="secondary" className="w-full" onClick={resetFilters}>
                            Reset
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Create booking modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Նոր ամրագրում">
                <div className="space-y-3">
                    {draft ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                            <div>
                                <span className="font-semibold">Սկիզբ</span>՝ {ymd(draft.startsAt)} {hm(draft.startsAt)}
                            </div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <div className="mb-1 text-xs font-semibold text-slate-600">Ծառայություն</div>
                            <select
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">Ընտրիր...</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-semibold text-slate-600">Աշխատակից</div>
                            <select
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">Ընտրիր...</option>
                                {staff.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <div className="mb-1 text-xs font-semibold text-slate-600">Հաճախորդի անուն</div>
                            <input
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                placeholder="Օր․ Մարիամ"
                            />
                        </div>
                        <div>
                            <div className="mb-1 text-xs font-semibold text-slate-600">Հեռախոս</div>
                            <input
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                placeholder="+374..."
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1 text-xs font-semibold text-slate-600">Նշումներ (optional)</div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="w-full"
                            disabled={createMut.isPending || !draft || !serviceId || !staffId || !clientName || !clientPhone}
                            onClick={() => {
                                if (!draft || !serviceId || !staffId) return;
                                createMut.mutate({
                                    service_id: Number(serviceId),
                                    staff_id: Number(staffId),
                                    starts_at: `${ymd(draft.startsAt)} ${hm(draft.startsAt)}`,
                                    client_name: clientName,
                                    client_phone: clientPhone,
                                    notes: notes || null,
                                    status: "confirmed",
                                });
                            }}
                        >
                            {createMut.isPending ? "Պահպանում է…" : "Ստեղծել"}
                        </Button>

                        <Button variant="secondary" className="w-full" onClick={() => setCreateOpen(false)}>
                            Չեղարկել
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Block modal with presets */}
            <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title="Փակել ժամ / օր">
                <div className="space-y-3">
                    {blockDraft ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                            <div><span className="font-semibold">Սկիզբ</span>՝ {ymd(blockDraft.startsAt)} {hm(blockDraft.startsAt)}</div>
                            <div className="mt-1"><span className="font-semibold">Վերջ</span>՝ {ymd(blockDraft.endsAt)} {hm(blockDraft.endsAt)}</div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" onClick={() => setBlockPreset("day")}>Ամբողջ օր փակել</Button>
                        <Button variant="secondary" onClick={() => setBlockPreset("60")}>1 ժամ ընդմիջում</Button>
                        <Button variant="secondary" onClick={() => setBlockPreset("30")}>30 րոպե</Button>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={5}
                                step={5}
                                value={customMinutes}
                                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                placeholder="րոպե"
                            />
                            <Button variant="secondary" onClick={() => setBlockPreset("custom")}>Set</Button>
                        </div>
                    </div>

                    <div>
                        <div className="mb-1 text-xs font-semibold text-slate-600">Պատճառ</div>
                        <select
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                            <option value="Ընդմիջում">Ընդմիջում</option>
                            <option value="Չի աշխատում">Չի աշխատում</option>
                            <option value="Հանգիստ օր">Հանգիստ օր</option>
                            <option value="Տեխնիկական պատճառ">Տեխնիկական պատճառ</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="w-full"
                            disabled={createBlockMut.isPending || !blockDraft}
                            onClick={() => {
                                if (!blockDraft) return;
                                createBlockMut.mutate({
                                    starts_at: `${ymd(blockDraft.startsAt)} ${hm(blockDraft.startsAt)}`,
                                    ends_at: `${ymd(blockDraft.endsAt)} ${hm(blockDraft.endsAt)}`,
                                    reason: blockReason || null,
                                });
                            }}
                        >
                            {createBlockMut.isPending ? "Պահպանում է…" : "Փակել"}
                        </Button>

                        <Button variant="secondary" className="w-full" onClick={() => setBlockOpen(false)}>
                            Չեղարկել
                        </Button>
                    </div>
                </div>
            </Modal>

            {isLoading ? <div className="mt-4 text-sm text-slate-500">Բեռնում է…</div> : null}
        </motion.div>
    );
}