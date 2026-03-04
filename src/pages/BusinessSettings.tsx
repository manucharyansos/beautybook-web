// src/pages/BusinessSettings.tsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Clock,
  MapPin,
  Phone,
  Globe,
  CalendarDays,
  Link as LinkIcon,
  PauseCircle,
  PlayCircle,
  Ban,
  CreditCard,
  FileText,
  XCircle,
} from "lucide-react";

import { page, card, cardTransition } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Toast } from "../components/ui/Toast";

import { fetchBusinessSettings, updateBusinessSettings, type BusinessSettings } from "../lib/businessSettingsApi";
import { fetchSchedule, updateSchedule, type ScheduleDay } from "../lib/scheduleApi";
import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";
import { api } from "../lib/api";

// -------------------------
// Billing API (inline for simplicity)
// You can move to src/lib/billingApi.ts
// -------------------------
type InvoiceItem = {
  id: number;
  business_id: number;
  plan_id: number;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "cancelled" | string;
  payment_method?: string | null;
  note?: string | null;
  created_at?: string;
  plan?: { id: number; name: string; code: string; price: number; currency: string; seats?: number | null };
};

async function fetchInvoices(): Promise<InvoiceItem[]> {
  const r = await api.get("/billing/invoices");
  return (r.data.data ?? []) as InvoiceItem[];
}

async function requestUpgrade(input: { plan_code: string; payment_method?: string | null; note?: string | null }) {
  const r = await api.post("/billing/upgrade-request", input);
  return r.data;
}

async function cancelInvoice(invoiceId: number) {
  const r = await api.post(`/billing/invoices/${invoiceId}/cancel`);
  return r.data;
}

async function pauseBilling() {
  const r = await api.post("/billing/pause");
  return r.data;
}
async function resumeBilling() {
  const r = await api.post("/billing/resume");
  return r.data;
}
async function cancelSubscription() {
  const r = await api.post("/billing/cancel-subscription");
  return r.data;
}

// -------------------------
// schedule helpers
// -------------------------
const WEEKDAYS: Array<{ k: number; label: string }> = [
  { k: 1, label: "Երկուշաբթի" },
  { k: 2, label: "Երեքշաբթի" },
  { k: 3, label: "Չորեքշաբթի" },
  { k: 4, label: "Հինգշաբթի" },
  { k: 5, label: "Ուրբաթ" },
  { k: 6, label: "Շաբաթ" },
  { k: 7, label: "Կիրակի" },
];

function normalizeDay(d: Partial<ScheduleDay> & { weekday: number }): ScheduleDay {
  return {
    weekday: d.weekday,
    is_closed: !!d.is_closed,
    start: d.start ?? "09:00",
    end: d.end ?? "18:00",
    break_start: d.break_start ?? null,
    break_end: d.break_end ?? null,
  };
}

function sanitizeBreak(start: string | null, end: string | null) {
  if (!start || !end) return { break_start: null, break_end: null };
  return { break_start: start, break_end: end };
}

function statusBadge(status: string) {
  const s = String(status || "active");
  if (s === "active") return { text: "Ակտիվ", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" };
  if (s === "paused") return { text: "Կասեցված", cls: "bg-amber-50 border-amber-200 text-amber-700" };
  if (s === "canceled") return { text: "Չեղարկված", cls: "bg-rose-50 border-rose-200 text-rose-700" };
  return { text: s, cls: "bg-gray-50 border-gray-200 text-gray-700" };
}

export default function BusinessSettingsPage() {
  const qc = useQueryClient();

  // ⚠️ assumes your auth store exposes `user` and maybe refreshMe()
  // If you don't have refreshMe, no problem — I handle fallback.
  const auth = useAuth() as any;
  const user = auth.user as any;
  const refreshMe: (() => Promise<void>) | undefined = auth.refreshMe;

  const canEdit = user?.role === "owner" || user?.role === "manager" || user?.role === "super_admin";
  const billingStatus = String(user?.billing_status ?? "active"); // backend must send this

  const [toast, setToast] = useState<{ open: boolean; text: string; type: "success" | "error" }>({
    open: false,
    text: "",
    type: "success",
  });

  const settingsQ = useQuery({
    queryKey: ["business-settings"],
    queryFn: fetchBusinessSettings,
  });

  const scheduleQ = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const invoicesQ = useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: fetchInvoices,
    staleTime: 30_000,
    retry: 1,
  });

  const [form, setForm] = useState<Partial<BusinessSettings>>({});
  const [days, setDays] = useState<ScheduleDay[]>([]);

  useEffect(() => {
    if (settingsQ.data) setForm(settingsQ.data);
  }, [settingsQ.data]);

  useEffect(() => {
    const raw = scheduleQ.data?.days ?? [];
    if (!raw.length) {
      setDays(WEEKDAYS.map((w) => normalizeDay({ weekday: w.k, is_closed: w.k === 7 })));
      return;
    }
    const map = new Map<number, ScheduleDay>();
    raw.forEach((d) => map.set(d.weekday, normalizeDay(d)));
    setDays(WEEKDAYS.map((w) => map.get(w.k) ?? normalizeDay({ weekday: w.k })));
  }, [scheduleQ.data]);

  const bookingLink = useMemo(() => {
    const slug = (form.slug ?? settingsQ.data?.slug) as string | undefined;
    if (!slug) return null;
    return `smartbook.am/book/${slug}`;
  }, [form.slug, settingsQ.data?.slug]);

  // -------------------------
  // Save mutations
  // -------------------------
  const saveSettingsMut = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["business-settings"] });
      setToast({ open: true, text: "Պահպանվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2000);
    },
    onError: (e: any) => {
      setToast({ open: true, text: e?.response?.data?.message ?? "Չհաջողվեց պահպանել", type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2500);
    },
  });

  const saveScheduleMut = useMutation({
    mutationFn: updateSchedule,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["schedule"] });
      setToast({ open: true, text: "Գրաֆիկը պահպանվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2000);
    },
    onError: (e: any) => {
      setToast({ open: true, text: e?.response?.data?.message ?? "Չհաջողվեց պահպանել գրաֆիկը", type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2500);
    },
  });

  function saveAll() {
    if (!canEdit) return;

    saveSettingsMut.mutate({
      phone: form.phone ?? null,
      address: form.address ?? null,
      timezone: form.timezone ?? "Asia/Yerevan",
      slot_step_minutes: Number(form.slot_step_minutes ?? 15),
      work_start: form.work_start,
      work_end: form.work_end,
    });

    saveScheduleMut.mutate({
      days: days.map((d) => ({
        ...d,
        start: d.is_closed ? null : d.start,
        end: d.is_closed ? null : d.end,
        ...(d.is_closed ? { break_start: null, break_end: null } : sanitizeBreak(d.break_start, d.break_end)),
      })),
    });
  }

  const loading = settingsQ.isLoading || scheduleQ.isLoading;

  // -------------------------
  // Billing actions
  // -------------------------
  async function refreshAfterBillingChange() {
    await qc.invalidateQueries({ queryKey: ["billing", "invoices"] });
    await qc.invalidateQueries({ queryKey: ["features"] });
    // refresh auth user so BillingGuard sees the new status
    if (refreshMe) {
      await refreshMe();
    } else {
      // fallback (safe) — ensure guards re-evaluate
      window.location.reload();
    }
  }

  const pauseM = useMutation({
    mutationFn: pauseBilling,
    onSuccess: async () => {
      setToast({ open: true, text: "Բիլինգը կասեցվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 1800);
      await refreshAfterBillingChange();
    },
    onError: (e: any) => {
      setToast({ open: true, text: e?.response?.data?.message ?? "Չհաջողվեց կասեցնել", type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2500);
    },
  });

  const resumeM = useMutation({
    mutationFn: resumeBilling,
    onSuccess: async () => {
      setToast({ open: true, text: "Վերականգնվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 1800);
      await refreshAfterBillingChange();
    },
    onError: (e: any) => {
      setToast({ open: true, text: e?.response?.data?.message ?? "Չհաջողվեց վերականգնել", type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2500);
    },
  });

  const cancelSubM = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      setToast({ open: true, text: "Բաժանորդագրությունը չեղարկվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 1800);
      await refreshAfterBillingChange();
    },
    onError: (e: any) => {
      setToast({ open: true, text: e?.response?.data?.message ?? "Չհաջողվեց չեղարկել", type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2500);
    },
  });

  // -------------------------
  // Upgrade request UI
  // -------------------------
  const [upgrade, setUpgrade] = useState<{ plan_code: string; payment_method: string; note: string }>({
    plan_code: "",
    payment_method: "bank_transfer",
    note: "",
  });

  const upgradeM = useMutation({
    mutationFn: requestUpgrade,
    onSuccess: async () => {
      setToast({ open: true, text: "Հարցումը ուղարկվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2000);
      await qc.invalidateQueries({ queryKey: ["billing", "invoices"] });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? "Չհաջողվեց ուղարկել";
      setToast({ open: true, text: msg, type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2800);
    },
  });

  const cancelInvoiceM = useMutation({
    mutationFn: cancelInvoice,
    onSuccess: async () => {
      setToast({ open: true, text: "Invoice-ը չեղարկվեց ✅", type: "success" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 1800);
      await qc.invalidateQueries({ queryKey: ["billing", "invoices"] });
    },
    onError: (e: any) => {
      setToast({ open: true, text: e?.response?.data?.message ?? "Չհաջողվեց չեղարկել invoice-ը", type: "error" });
      setTimeout(() => setToast((p) => ({ ...p, open: false })), 2500);
    },
  });

  const saving = saveSettingsMut.isPending || saveScheduleMut.isPending;
  const billingBusy = pauseM.isPending || resumeM.isPending || cancelSubM.isPending || upgradeM.isPending || cancelInvoiceM.isPending;

  const badge = statusBadge(billingStatus);

  return (
    <>
      <Toast open={toast.open} text={toast.text} type={toast.type} />

      <motion.div {...page} className="space-y-6 p-6 bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] rounded-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-[#8F6B58] font-light tracking-wide">Բիզնես</div>
            <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
              <Globe size={28} className="text-[#C5A28A]" />
              <span>Կարգավորումներ</span>
              {/* Billing status badge */}
              <span className={cn("ml-2 text-xs px-3 py-1 rounded-full border font-light", badge.cls)}>
                {badge.text}
              </span>
            </div>
            <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
              Ժամային գոտի, slot step, կոնտակտներ, գրաֆիկ և billing կառավարում
            </div>
          </div>

          <div className="flex items-center gap-3">
            {bookingLink && (
              <div className="hidden md:flex items-center gap-2 text-xs text-[#8F6B58] font-light bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E8D5C4]/30">
                <LinkIcon size={14} className="text-[#C5A28A]" />
                <span>{bookingLink}</span>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={saveAll}
                disabled={!canEdit || loading || saving || billingBusy}
                className="gap-2 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-full px-6"
              >
                {saving ? <Spinner size={16} /> : <Save size={16} />}
                Պահպանել
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Billing Controls */}
        <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
          <Card className="p-6 border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-[#C5A28A]" />
                  <div className="text-lg font-light text-[#2C2C2C]">Billing / Subscription</div>
                </div>
                <div className="mt-1 text-xs text-[#8F6B58] font-light">
                  Pause-ը կսահմանափակի app-ը (dashboard/calendar/services/analytics), բայց Settings-ը միշտ հասանելի է։
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Pause */}
                <Button
                  disabled={!canEdit || billingBusy || billingStatus !== "active"}
                  onClick={() => pauseM.mutate()}
                  className="gap-2 rounded-full"
                  variant="secondary"
                >
                  {pauseM.isPending ? <Spinner size={16} /> : <PauseCircle size={16} />}
                  Pause
                </Button>

                {/* Resume */}
                <Button
                  disabled={!canEdit || billingBusy || billingStatus !== "paused"}
                  onClick={() => resumeM.mutate()}
                  className="gap-2 rounded-full"
                  variant="secondary"
                >
                  {resumeM.isPending ? <Spinner size={16} /> : <PlayCircle size={16} />}
                  Resume
                </Button>

                {/* Cancel subscription */}
                <Button
                  disabled={!canEdit || billingBusy || billingStatus === "canceled"}
                  onClick={() => {
                    const ok = window.confirm("Վստա՞հ եք, որ ուզում եք չեղարկել բաժանորդագրությունը։");
                    if (ok) cancelSubM.mutate();
                  }}
                  className="gap-2 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50"
                  variant="secondary"
                >
                  {cancelSubM.isPending ? <Spinner size={16} /> : <Ban size={16} />}
                  Cancel
                </Button>
              </div>
            </div>

            {/* Upgrade request */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="text-sm font-light text-[#2C2C2C] mb-2">Փաթեթ փոխել (Upgrade request)</div>

                <label className="block text-xs text-[#8F6B58] font-light mb-1">Plan code</label>
                <input
                  disabled={!canEdit || billingBusy}
                  className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80 px-4 py-3 outline-none
                             focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                             font-light disabled:bg-gray-50"
                  value={upgrade.plan_code}
                  onChange={(e) => setUpgrade((p) => ({ ...p, plan_code: e.target.value }))}
                  placeholder="օր․ pro / business / free"
                />

                <div className="mt-3">
                  <label className="block text-xs text-[#8F6B58] font-light mb-1">Payment method</label>
                  <select
                    disabled={!canEdit || billingBusy}
                    className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80 px-4 py-3 outline-none
                               focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                               font-light disabled:bg-gray-50"
                    value={upgrade.payment_method}
                    onChange={(e) => setUpgrade((p) => ({ ...p, payment_method: e.target.value }))}
                  >
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="idram">IDram</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="block text-xs text-[#8F6B58] font-light mb-1">Note (optional)</label>
                  <input
                    disabled={!canEdit || billingBusy}
                    className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80 px-4 py-3 outline-none
                               focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                               font-light disabled:bg-gray-50"
                    value={upgrade.note}
                    onChange={(e) => setUpgrade((p) => ({ ...p, note: e.target.value }))}
                    placeholder="օր․ ուզում եմ upgrade..."
                  />
                </div>

                <div className="mt-4">
                  <Button
                    disabled={!canEdit || billingBusy || !upgrade.plan_code.trim()}
                    onClick={() =>
                      upgradeM.mutate({
                        plan_code: upgrade.plan_code.trim(),
                        payment_method: upgrade.payment_method || null,
                        note: upgrade.note?.trim() || null,
                      })
                    }
                    className="gap-2 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white"
                  >
                    {upgradeM.isPending ? <Spinner size={16} /> : <FileText size={16} />}
                    Ուղարկել հարցում
                  </Button>
                </div>

                <div className="mt-2 text-xs text-[#8F6B58] font-light">
                  Եթե plan-ը free է՝ backend-ը կարող է instant activate անել (քո controller-ում արդեն կա)։
                </div>
              </div>

              {/* Invoices list */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-light text-[#2C2C2C]">Invoices</div>
                  <button
                    className="text-xs text-[#8F6B58] hover:text-[#C5A28A] transition-colors font-light"
                    onClick={() => invoicesQ.refetch()}
                    type="button"
                  >
                    Թարմացնել
                  </button>
                </div>

                {invoicesQ.isLoading ? (
                  <div className="p-4 rounded-xl border border-[#E8D5C4]/30 bg-white/70">
                    <div className="flex items-center gap-2 text-[#8F6B58] font-light text-sm">
                      <Spinner size={16} /> Բեռնում…
                    </div>
                  </div>
                ) : invoicesQ.error ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-sm text-red-600 font-light">
                    {(invoicesQ.error as any)?.response?.data?.message ?? "Չհաջողվեց բեռնել invoice-ները"}
                  </div>
                ) : (invoicesQ.data?.length ?? 0) === 0 ? (
                  <div className="p-4 rounded-xl border border-[#E8D5C4]/30 bg-white/70 text-sm text-[#8F6B58] font-light">
                    Դեռ invoice չկա։
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoicesQ.data!.map((inv) => {
                      const st = String(inv.status);
                      const stUi =
                        st === "pending"
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : st === "paid"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : st === "cancelled"
                          ? "text-rose-700 bg-rose-50 border-rose-200"
                          : "text-gray-700 bg-gray-50 border-gray-200";

                      return (
                        <div key={inv.id} className="rounded-xl border border-[#E8D5C4]/30 bg-white/80 p-4">
                          <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className={cn("text-xs px-2.5 py-1 rounded-full border font-light", stUi)}>{st}</div>
                                <div className="text-sm font-light text-[#2C2C2C] truncate">
                                  Plan: {inv.plan?.name ?? inv.plan_id} ({inv.plan?.code ?? "—"})
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-[#8F6B58] font-light">
                                Amount: <span className="text-[#2C2C2C]">{inv.amount}</span> {inv.currency} • Method:{" "}
                                <span className="text-[#2C2C2C]">{inv.payment_method ?? "—"}</span>
                              </div>
                              {inv.note && <div className="mt-1 text-xs text-[#8F6B58] font-light">Note: {inv.note}</div>}
                            </div>

                            {st === "pending" && (
                              <Button
                                disabled={!canEdit || billingBusy}
                                onClick={() => cancelInvoiceM.mutate(inv.id)}
                                className="gap-2 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50"
                                variant="secondary"
                              >
                                {cancelInvoiceM.isPending ? <Spinner size={16} /> : <XCircle size={16} />}
                                Cancel invoice
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Errors */}
        {settingsQ.error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-sm text-red-600 font-light">
            {(settingsQ.error as any)?.response?.data?.message ?? "Չհաջողվեց բեռնել բիզնեսի կարգավորումները"}
          </motion.div>
        )}
        {scheduleQ.error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-sm text-red-600 font-light">
            {(scheduleQ.error as any)?.response?.data?.message ?? "Չհաջողվեց բեռնել գրաֆիկը"}
          </motion.div>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 border border-[#E8D5C4]/30 rounded-xl">
                <div className="flex items-center gap-2 text-[#8F6B58] font-light">
                  <Spinner /> Բեռնում…
                </div>
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-12 rounded-xl bg-gradient-to-r from-[#F9F5F0] to-[#F0E7DD] animate-pulse" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {/* GENERAL */}
            <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
              <Card className="p-6 border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#C5A28A]" />
                    <div className="text-lg font-light text-[#2C2C2C]">Ընդհանուր</div>
                  </div>
                  <div className="text-xs text-[#8F6B58] font-light bg-[#F9F5F0] px-3 py-1 rounded-full">
                    {canEdit ? "Կարող ես խմբագրել" : "Read-only"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                      <span className="flex items-center gap-2">
                        <Phone size={14} className="text-[#C5A28A]" /> Հեռախոս
                      </span>
                    </label>
                    <input
                      disabled={!canEdit || billingBusy}
                      className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                 px-4 py-3 outline-none focus:border-[#C5A28A]
                                 focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                 font-light disabled:bg-gray-50"
                      value={form.phone ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="օր․ 077 12 34 56"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                      <span className="flex items-center gap-2">
                        <Clock size={14} className="text-[#C5A28A]" /> Slot քայլ (րոպե)
                      </span>
                    </label>
                    <select
                      disabled={!canEdit || billingBusy}
                      className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                 px-4 py-3 outline-none focus:border-[#C5A28A]
                                 focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                 font-light disabled:bg-gray-50"
                      value={Number(form.slot_step_minutes ?? 15)}
                      onChange={(e) => setForm((p) => ({ ...p, slot_step_minutes: Number(e.target.value) }))}
                    >
                      {[5, 10, 15, 20, 30].map((v) => (
                        <option key={v} value={v}>
                          {v} րոպե
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#C5A28A]" /> Հասցե
                      </span>
                    </label>
                    <input
                      disabled={!canEdit || billingBusy}
                      className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                 px-4 py-3 outline-none focus:border-[#C5A28A]
                                 focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                 font-light disabled:bg-gray-50"
                      value={form.address ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="օր․ Երևան, ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                      <span className="flex items-center gap-2">
                        <Globe size={14} className="text-[#C5A28A]" /> Timezone
                      </span>
                    </label>
                    <select
                      disabled={!canEdit || billingBusy}
                      className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                 px-4 py-3 outline-none focus:border-[#C5A28A]
                                 focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                 font-light disabled:bg-gray-50"
                      value={form.timezone ?? "Asia/Yerevan"}
                      onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                    >
                      <option value="Asia/Yerevan">Asia/Yerevan (Հայաստան)</option>
                      <option value="Europe/Moscow">Europe/Moscow</option>
                      <option value="Europe/Istanbul">Europe/Istanbul</option>
                      <option value="Asia/Tbilisi">Asia/Tbilisi</option>
                    </select>
                    <div className="mt-1 text-xs text-[#8F6B58] font-light">Հայաստանում հիմնականը՝ Asia/Yerevan</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#2C2C2C] font-light mb-2">Աշխատանքի սկիզբ</label>
                      <input
                        type="time"
                        disabled={!canEdit || billingBusy}
                        className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                   px-4 py-3 outline-none focus:border-[#C5A28A]
                                   focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                   font-light disabled:bg-gray-50"
                        value={form.work_start ?? "09:00"}
                        onChange={(e) => setForm((p) => ({ ...p, work_start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#2C2C2C] font-light mb-2">Աշխատանքի վերջ</label>
                      <input
                        type="time"
                        disabled={!canEdit || billingBusy}
                        className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                   px-4 py-3 outline-none focus:border-[#C5A28A]
                                   focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                   font-light disabled:bg-gray-50"
                        value={form.work_end ?? "18:00"}
                        onChange={(e) => setForm((p) => ({ ...p, work_end: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {bookingLink && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#F9F5F0] to-[#F0E7DD] border border-[#E8D5C4]/30">
                    <div className="text-xs text-[#8F6B58] font-light">Public booking հղում</div>
                    <div className="mt-1 text-sm text-[#2C2C2C] font-light break-all">{bookingLink}</div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* WEEKLY SCHEDULE */}
            <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
              <Card className="p-6 border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-[#C5A28A]" />
                    <div className="text-lg font-light text-[#2C2C2C]">Շաբաթական գրաֆիկ</div>
                  </div>
                  <div className="text-xs text-[#8F6B58] font-light">Break-ը ընտրովի է</div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {WEEKDAYS.map((w) => {
                    const d = days.find((x) => x.weekday === w.k);
                    if (!d) return null;

                    return (
                      <motion.div
                        key={w.k}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: w.k * 0.05 }}
                        className={cn(
                          "rounded-xl border p-4 transition-all duration-300",
                          d.is_closed
                            ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
                            : "bg-white border-[#E8D5C4]/30 hover:border-[#C5A28A]/50"
                        )}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="font-light text-[#2C2C2C]">{w.label}</div>

                          <label className="inline-flex items-center gap-2 text-sm text-[#8F6B58] font-light">
                            <input
                              disabled={!canEdit || billingBusy}
                              type="checkbox"
                              checked={!d.is_closed}
                              onChange={(e) =>
                                setDays((prev) => prev.map((x) => (x.weekday === w.k ? { ...x, is_closed: !e.target.checked } : x)))
                              }
                              className="w-4 h-4 rounded border-[#E8D5C4] text-[#C5A28A] focus:ring-[#C5A28A]/30"
                            />
                            Բաց է
                          </label>
                        </div>

                        {!d.is_closed && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-[#8F6B58] font-light mb-1">Սկիզբ</label>
                              <input
                                disabled={!canEdit || billingBusy}
                                type="time"
                                className="w-full rounded-lg border border-[#E8D5C4]/30 bg-white/80
                                           px-3 py-2 outline-none focus:border-[#C5A28A]
                                           focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                           text-sm font-light disabled:bg-gray-50"
                                value={d.start ?? "09:00"}
                                onChange={(e) => setDays((prev) => prev.map((x) => (x.weekday === w.k ? { ...x, start: e.target.value } : x)))}
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-[#8F6B58] font-light mb-1">Վերջ</label>
                              <input
                                disabled={!canEdit || billingBusy}
                                type="time"
                                className="w-full rounded-lg border border-[#E8D5C4]/30 bg-white/80
                                           px-3 py-2 outline-none focus:border-[#C5A28A]
                                           focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                           text-sm font-light disabled:bg-gray-50"
                                value={d.end ?? "18:00"}
                                onChange={(e) => setDays((prev) => prev.map((x) => (x.weekday === w.k ? { ...x, end: e.target.value } : x)))}
                              />
                            </div>

                            <div className="rounded-lg border border-[#E8D5C4]/30 bg-[#F9F5F0]/50 p-3">
                              <div className="text-xs text-[#8F6B58] font-light mb-2">Break (ընտրովի)</div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  disabled={!canEdit || billingBusy}
                                  type="time"
                                  className="w-full rounded-lg border border-[#E8D5C4]/30 bg-white/80
                                             px-2 py-1.5 text-sm outline-none focus:border-[#C5A28A]
                                             focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                             font-light disabled:bg-gray-50"
                                  value={d.break_start ?? ""}
                                  onChange={(e) =>
                                    setDays((prev) => prev.map((x) => (x.weekday === w.k ? { ...x, break_start: e.target.value || null } : x)))
                                  }
                                  placeholder="13:00"
                                />
                                <input
                                  disabled={!canEdit || billingBusy}
                                  type="time"
                                  className="w-full rounded-lg border border-[#E8D5C4]/30 bg-white/80
                                             px-2 py-1.5 text-sm outline-none focus:border-[#C5A28A]
                                             focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                             font-light disabled:bg-gray-50"
                                  value={d.break_end ?? ""}
                                  onChange={(e) =>
                                    setDays((prev) => prev.map((x) => (x.weekday === w.k ? { ...x, break_end: e.target.value || null } : x)))
                                  }
                                  placeholder="14:00"
                                />
                              </div>

                              <button
                                disabled={!canEdit || billingBusy}
                                className="mt-2 text-xs text-[#8F6B58] hover:text-[#C5A28A] transition-colors font-light disabled:opacity-50"
                                onClick={() => setDays((prev) => prev.map((x) => (x.weekday === w.k ? { ...x, break_start: null, break_end: null } : x)))}
                                type="button"
                              >
                                Ջնջել break-ը
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      disabled={!canEdit || saving || billingBusy}
                      onClick={() => saveScheduleMut.mutate({ days })}
                      className="gap-2 border border-[#C5A28A]/30 text-[#8F6B58] hover:border-[#C5A28A] hover:bg-white rounded-full"
                      variant="secondary"
                    >
                      {saveScheduleMut.isPending ? <Spinner size={16} /> : <Save size={16} />}
                      Պահպանել միայն գրաֆիկը
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
}