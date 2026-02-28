import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Loader2, TrendingUp, PauseCircle, PlayCircle } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

type MrrItem = {
    currency: string;
    active_count: number;
    mrr: number;
};

type Invoice = {
    id: number;
    status: string;
    amount: number;
    currency: string;
    business: { id: number; name: string; slug: string };
    plan: { id: number; name: string; code: string; price: number; currency: string };
};

type BusinessRow = {
    id: number;
    name: string;
    slug: string;
    billing_status: string | null;
    suspended_at: string | null;
    business_type?: string | null;
    subscription: {
        status: string;
        trial_ends_at: string | null;
        current_period_ends_at: string | null;
        plan: {
            code: string;
            name: string;
            price: number;
            currency: string;
            seats: number;
        } | null;
    } | null;
};

async function fetchMrr(): Promise<MrrItem[]> {
    const r = await api.get("/admin/mrr");
    return r.data.data.mrr_by_currency as MrrItem[];
}

async function fetchPendingInvoices(): Promise<Invoice[]> {
    const r = await api.get("/admin/invoices", { params: { status: "pending" } });
    return r.data.data as Invoice[];
}

async function approveInvoice(id: number) {
    const r = await api.patch(`/admin/invoices/${id}/approve`);
    return r.data;
}

async function rejectInvoice(id: number) {
    const r = await api.patch(`/admin/invoices/${id}/reject`);
    return r.data;
}

async function fetchBusinesses(): Promise<BusinessRow[]> {
    const r = await api.get("/admin/businesses");
    return r.data.data as BusinessRow[];
}

async function changeBusinessPlan(payload: { businessId: number; planCode: string }) {
    const r = await api.patch(`/admin/businesses/${payload.businessId}/plan`, {
        plan_code: payload.planCode,
    });
    return r.data;
}

async function extendBusinessTrial(payload: { businessId: number; days: number }) {
    const r = await api.patch(`/admin/businesses/${payload.businessId}/trial`, {
        days: payload.days,
    });
    return r.data;
}

async function toggleBusinessSuspend(payload: { businessId: number; suspend: boolean }) {
    const endpoint = payload.suspend ? "suspend" : "restore";
    const r = await api.patch(`/admin/businesses/${payload.businessId}/${endpoint}`);
    return r.data;
}

export default function SuperAdmin() {
    const qc = useQueryClient();

    const mrrQ = useQuery({
        queryKey: ["admin", "mrr"],
        queryFn: fetchMrr,
        staleTime: 60_000,
    });

    const invoicesQ = useQuery({
        queryKey: ["admin", "invoices", "pending"],
        queryFn: fetchPendingInvoices,
        staleTime: 10_000,
    });

    const businessesQ = useQuery({
        queryKey: ["admin", "businesses"],
        queryFn: fetchBusinesses,
        staleTime: 30_000,
    });

    const approveMut = useMutation({
        mutationFn: approveInvoice,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "invoices", "pending"] });
            qc.invalidateQueries({ queryKey: ["billing", "me"] });
            qc.invalidateQueries({ queryKey: ["admin", "mrr"] });
        },
    });

    const rejectMut = useMutation({
        mutationFn: rejectInvoice,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "invoices", "pending"] });
        },
    });

    const planMut = useMutation({
        mutationFn: changeBusinessPlan,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "businesses"] });
            qc.invalidateQueries({ queryKey: ["admin", "mrr"] });
        },
    });

    const trialMut = useMutation({
        mutationFn: extendBusinessTrial,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "businesses"] });
        },
    });

    const suspendMut = useMutation({
        mutationFn: toggleBusinessSuspend,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "businesses"] });
        },
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full min-w-0 bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] p-6 rounded-3xl"
        >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="text-sm text-[#8F6B58] font-light tracking-wide">Super Admin</div>
                    <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
                        <TrendingUp size={28} className="text-[#C5A28A]" />
                        <span>Կենտրոնական վահանակ</span>
                    </div>
                    <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                        MRR, հաշիվներ և սրահների billing վիճակ
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
                {/* Left: MRR & salons */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-[#E8D5C4]/40 bg-white/80 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-[#2C2C2C] font-light">MRR ըստ արժույթների</div>
                            {mrrQ.isFetching && (
                                <Loader2 className="w-4 h-4 text-[#8F6B58] animate-spin" />
                            )}
                        </div>

                        {mrrQ.isError && (
                            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50/70 border border-red-200 rounded-xl px-3 py-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Չհաջողվեց բեռնել MRR տվյալները</span>
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {mrrQ.data?.map((item) => (
                                <div
                                    key={item.currency}
                                    className="rounded-xl border border-[#E8D5C4]/40 bg-gradient-to-br from-[#F9F5F0] to-[#F0E7DD] p-3"
                                >
                                    <div className="text-xs text-[#8F6B58] font-light mb-1">
                                        {item.currency}
                                    </div>
                                    <div className="text-2xl font-light text-[#2C2C2C]">
                                        {item.mrr.toLocaleString("hy-AM")}
                                    </div>
                                    <div className="mt-1 text-[11px] text-[#8F6B58] font-light">
                                        Ակտիվ բաժանորդագրություններ՝ {item.active_count}
                                    </div>
                                </div>
                            ))}

                            {mrrQ.data && mrrQ.data.length === 0 && (
                                <div className="text-xs text-[#8F6B58] font-light">
                                    Առայժմ ակտիվ բաժանորդագրություններ չկան։
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[#E8D5C4]/40 bg-white/80 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-[#2C2C2C] font-light">Սրահներ և փաթեթներ</div>
                            {businessesQ.isFetching && (
                                <Loader2 className="w-4 h-4 text-[#8F6B58] animate-spin" />
                            )}
                        </div>

                        {businessesQ.isError && (
                            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50/70 border border-red-200 rounded-xl px-3 py-2 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Չհաջողվեց բեռնել սրահների ցուցակը</span>
                            </div>
                        )}

                        <div className="space-y-2 max-h-80 overflow-auto pr-1 text-xs text-[#2C2C2C] font-light">
                            {businessesQ.data?.map((s) => {
                                const sub = s.subscription;
                                const plan = sub?.plan;
                                const isSuspended = s.billing_status === "suspended";

                                return (
                                    <div
                                        key={s.id}
                                        className="rounded-xl border border-[#E8D5C4]/50 bg-white/70 px-3 py-2 flex flex-col gap-1"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate">
                                                #{s.id} • {s.name}
                                            </span>
                                            <span className="text-[11px] text-[#8F6B58] truncate">
                                                {plan ? `${plan.name} (${plan.price.toLocaleString("hy-AM")} ${plan.currency})` : "Առանց փաթեթի"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                                            <span className="text-[11px] text-[#8F6B58] truncate">
                                                slug: {s.slug} • status: {sub?.status ?? "no-sub"}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => planMut.mutate({ businessId: s.id, planCode: "starter" })}
                                                    disabled={planMut.isPending}
                                                    className="px-2 py-1 rounded-lg border border-[#E8D5C4]/70 bg-white text-[11px] hover:bg-[#F9F5F0]"
                                                >
                                                    Essential
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => planMut.mutate({ businessId: s.id, planCode: "pro" })}
                                                    disabled={planMut.isPending}
                                                    className="px-2 py-1 rounded-lg border border-[#E8D5C4]/70 bg-white text-[11px] hover:bg-[#F9F5F0]"
                                                >
                                                    Premium
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => planMut.mutate({ businessId: s.id, planCode: "business" })}
                                                    disabled={planMut.isPending}
                                                    className="px-2 py-1 rounded-lg border border-[#E8D5C4]/70 bg-white text-[11px] hover:bg-[#F9F5F0]"
                                                >
                                                    Business
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => trialMut.mutate({ businessId: s.id, days: 7 })}
                                                    disabled={trialMut.isPending}
                                                    className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50/80 text-[11px] hover:bg-emerald-100"
                                                >
                                                    +7 օր trial
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => suspendMut.mutate({ businessId: s.id, suspend: !isSuspended })}
                                                    disabled={suspendMut.isPending}
                                                    className={cn(
                                                        "px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1",
                                                        isSuspended
                                                            ? "border-emerald-300 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100"
                                                            : "border-red-300 text-red-700 bg-red-50/80 hover:bg-red-100"
                                                    )}
                                                >
                                                    {isSuspended ? (
                                                        <>
                                                            <PlayCircle className="w-3 h-3" /> Վերականգնել
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PauseCircle className="w-3 h-3" /> Սառեցնել
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {businessesQ.data && businessesQ.data.length === 0 && (
                                <div className="text-xs text-[#8F6B58] font-light">
                                    Սրահներ առայժմ չկան։
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: pending invoices */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-[#E8D5C4]/40 bg-white/80 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-[#2C2C2C] font-light">Սպասող հաշիվներ</div>
                            {invoicesQ.isFetching && (
                                <Loader2 className="w-4 h-4 text-[#8F6B58] animate-spin" />
                            )}
                        </div>

                        {invoicesQ.isError && (
                            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50/70 border border-red-200 rounded-xl px-3 py-2 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Չհաջողվեց բեռնել հաշիվները</span>
                            </div>
                        )}

                        <div className="space-y-3 max-h-80 overflow-auto pr-1">
                            {invoicesQ.data?.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="rounded-xl border border-[#E8D5C4]/50 bg-white/60 px-3 py-2 text-xs text-[#2C2C2C] font-light flex flex-col gap-1"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate">
                                            #{inv.id} • {inv.business?.name}
                                        </span>
                                        <span className="text-[#8F6B58]">
                                            {inv.plan?.name} ({inv.plan?.price.toLocaleString("hy-AM")} {inv.plan?.currency})
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <span className="text-[11px] text-[#8F6B58] truncate">
                                            slug: {inv.business?.slug}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => approveMut.mutate(inv.id)}
                                                disabled={approveMut.isPending || rejectMut.isPending}
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 border text-[11px]",
                                                    "border-emerald-300 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100",
                                                    (approveMut.isPending || rejectMut.isPending) && "opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                <Check className="w-3 h-3" />
                                                Հաստատել
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => rejectMut.mutate(inv.id)}
                                                disabled={approveMut.isPending || rejectMut.isPending}
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 border text-[11px]",
                                                    "border-red-300 text-red-700 bg-red-50/80 hover:bg-red-100",
                                                    (approveMut.isPending || rejectMut.isPending) && "opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                Մերժել
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {invoicesQ.data && invoicesQ.data.length === 0 && (
                                <div className="text-xs text-[#8F6B58] font-light">
                                    Սպասող հաշիվներ չկան։
                                </div>
                            )}
                        </div>

                        <p className="mt-3 text-[11px] text-[#8F6B58] font-light flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Հաշիվների հաստատումը ավտոմատ ակտիվացնում է բաժանորդագրությունը ընտրված փաթեթով։
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


