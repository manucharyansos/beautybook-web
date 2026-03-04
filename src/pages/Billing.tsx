import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Crown, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

type Plan = {
    code: string;
    name: string;
    price: number;
    currency: string;
    seats: number;
    locations?: number;
};

type BillingMeResponse = {
    is_billable: boolean;
    reason: string | null;
    next_action: string | null;
    salon: {
        id: number;
        name: string;
        slug: string;
        billing_status: string | null;
        suspended_at: string | null;
    };
    subscription: {
        status: string;
        trial_ends_at: string | null;
        current_period_ends_at: string | null;
        plan: Plan | null;
    } | null;
};

async function fetchBillingMe(): Promise<BillingMeResponse> {
    const r = await api.get("/admin/billing/me");
    return r.data.data as BillingMeResponse;
}

async function fetchPlans(): Promise<Plan[]> {
    const r = await api.get("/admin/plans");
    return r.data.data as Plan[];
}

async function upgradePlan(planCode: string) {
    const r = await api.post("/admin/billing/upgrade", { plan_code: planCode });
    return r.data;
}

export default function Billing() {
    const queryClient = useQueryClient();

    const billingQ = useQuery({
        queryKey: ["billing", "me"],
        queryFn: fetchBillingMe,
        staleTime: 30_000,
    });

    const plansQ = useQuery({
        queryKey: ["plans"],
        queryFn: fetchPlans,
        staleTime: 60_000,
    });

    const upgradeMut = useMutation({
        mutationFn: (planCode: string) => upgradePlan(planCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
        },
    });

    const currentPlanCode = billingQ.data?.subscription?.plan?.code ?? null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full min-w-0 bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] p-6 rounded-3xl"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="text-sm text-[#8F6B58] font-light tracking-wide">Բաժանորդագրություն</div>
                    <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
                        <Crown size={28} className="text-[#C5A28A]" />
                        <span>Փաթեթներ</span>
                    </div>
                    <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                        Ընտրեք այն փաթեթը, որը համապատասխանում է Ձեր սրահին
                    </div>
                </div>
            </div>

            {/* Status / errors */}
            {billingQ.isError && (
                <div className="p-4 rounded-xl border border-red-200/60 bg-red-50/60 text-sm text-red-700 font-light">
                    {(billingQ.error as any)?.response?.data?.message ?? "Չհաջողվեց բեռնել billing տեղեկությունները"}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {/* Plans list */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-[#E8D5C4]/40 bg-white/80 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-[#C5A28A]" />
                                <span className="text-sm text-[#8F6B58] font-light">
                                    Ընթացիկ փաթեթը՝{" "}
                                    <span className="font-normal">
                                        {billingQ.data?.subscription?.plan?.name ?? "—"}
                                    </span>
                                </span>
                            </div>

                            {billingQ.data?.subscription?.status === "trialing" && billingQ.data.subscription.trial_ends_at && (
                                <span className="text-xs text-[#8F6B58] font-light">
                                    Փորձաշրջան մինչև{" "}
                                    {new Date(billingQ.data.subscription.trial_ends_at).toLocaleDateString("hy-AM")}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {plansQ.isLoading && (
                                <div className="col-span-3 flex items-center justify-center py-6 text-sm text-[#8F6B58]">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Բեռնում ենք փաթեթները…
                                </div>
                            )}

                            {plansQ.data?.map((plan) => {
                                const isCurrent = plan.code === currentPlanCode;
                                const isEnterprise = plan.code === "business";

                                return (
                                    <div
                                        key={plan.code}
                                        className={cn(
                                            "relative rounded-2xl border p-4 bg-white/80 backdrop-blur-sm",
                                            "border-[#E8D5C4]/40 hover:border-[#C5A28A]/60 transition-all duration-300",
                                            isCurrent && "ring-2 ring-[#C5A28A]/60 border-transparent"
                                        )}
                                    >
                                        {isCurrent && (
                                            <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-light bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white shadow">
                                                <Check size={10} />
                                                Ձեր ընթացիկ փաթեթը
                                            </span>
                                        )}

                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <div>
                                                <div className="text-sm font-light text-[#2C2C2C]">{plan.name}</div>
                                                <div className="text-xs text-[#8F6B58] font-light">
                                                    Մինչև {plan.seats} աշխատակից
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="text-2xl font-light text-[#2C2C2C]">
                                                {plan.price.toLocaleString("hy-AM")}{" "}
                                                <span className="text-sm text-[#8F6B58]">{plan.currency}</span>
                                            </div>
                                            <div className="text-xs text-[#8F6B58] font-light">
                                                ամսական (կամ համարժեք)
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isCurrent || upgradeMut.isPending || isEnterprise}
                                            onClick={() => upgradeMut.mutate(plan.code)}
                                            className={cn(
                                                "w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-light transition-all duration-300",
                                                isCurrent
                                                    ? "border-[#C5A28A]/40 text-[#8F6B58] bg-[#F9F5F0]"
                                                    : isEnterprise
                                                        ? "border-[#C5A28A]/40 text-[#8F6B58] hover:bg-[#F9F5F0]"
                                                        : "border-[#C5A28A] text-white bg-gradient-to-r from-[#C5A28A] to-[#B88E72] hover:shadow",
                                                (upgradeMut.isPending && !isCurrent) && "opacity-70 cursor-wait"
                                            )}
                                        >
                                            {isEnterprise
                                                ? "Կապվել վաճառքի բաժնի հետ"
                                                : isCurrent
                                                    ? "Ընթացիկ փաթեթ"
                                                    : "Անցնել այս փաթեթին"}
                                            {upgradeMut.isPending && !isCurrent && (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Side info */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-[#E8D5C4]/40 bg-gradient-to-br from-[#F9F5F0] to-[#F0E7DD] p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20 flex items-center justify-center">
                                <Sparkles size={16} className="text-[#C5A28A]" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-light text-[#2C2C2C]">
                                    Ինչպես է աշխատում բաժանորդագրությունը
                                </div>
                                <p className="text-xs text-[#8F6B58] font-light leading-relaxed">
                                    Փոփոխելով փաթեթը՝ Ձեր սրահը անմիջապես կստանա նոր սահմանաչափերը (աշխատակիցների քանակ,
                                    ֆունկցիոնալություն և այլն)։ Վճարումների մանրամասն ինտեգրացիան կարող ենք ավելացնել ավելի ուշ՝ ըստ կարիքների։
                                </p>
                            </div>
                        </div>
                    </div>

                    {billingQ.data && (
                        <div className="rounded-2xl border border-[#E8D5C4]/40 bg-white/80 backdrop-blur-sm p-4 text-xs text-[#8F6B58] font-light space-y-1">
                            <div className="font-normal text-[#2C2C2C] mb-1">Սրահի վիճակ</div>
                            <div>Սրահ․ {billingQ.data.business.name}</div>
                            <div>Billing կարգավիճակ․ {billingQ.data.business.billing_status || "active"}</div>
                            <div>Subscription կարգավիճակ․ {billingQ.data.subscription?.status ?? "չկա"}</div>
                            {billingQ.data.reason && (
                                <div>Reason․ {billingQ.data.reason}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}


