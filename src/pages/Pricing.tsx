// src/pages/Pricing.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Sparkles, Award } from "lucide-react";
import Navigation from "../components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { publicPlansApi, type BusinessType, type PublicPlan } from "@/lib/planApi";

function planFeaturesToList(plan: PublicPlan): string[] {
    const f = plan.features ?? {};

    // եթե backend-ում features-ը key/value JSON է
    const out: string[] = [];

    if (f.staff_limit != null) out.push(`Մինչև ${f.staff_limit} աշխատակից`);
    if (f.bookings === "unlimited") out.push("Անսահմանափակ ամրագրումներ");
    if (f.sms_reminders != null) {
        out.push(
            `SMS հիշեցումներ (${
                f.sms_reminders === "unlimited" ? "անսահմանափակ" : `${f.sms_reminders}/ամիս`
            })`
        );
    }
    if (f.analytics) out.push("Վերլուծություն / վիճակագրություն");
    if (f.api_access) out.push("API հասանելիություն");
    if (f.priority_support) out.push("Առաջնահերթ աջակցություն");
    if (f.dedicated_manager) out.push("Անհատական մենեջեր");
    if (f.support_24_7) out.push("24/7 աջակցություն");

    // fallback՝ եթե ոչ մի բան չհավաքվեց, բայց features-ը կա
    if (out.length === 0 && f && typeof f === "object") {
        for (const [k, v] of Object.entries(f)) out.push(`${k}: ${String(v)}`);
    }

    return out;
}

export default function Pricing() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedType, setSelectedType] = useState<BusinessType>("salon");

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const q = useQuery({
        queryKey: ["public-plans", selectedType],
        queryFn: async () => {
            const r = await publicPlansApi.list(selectedType);
            return r.data?.data ?? [];
        },
        enabled: !!selectedType,
    });

    const plans = useMemo(() => (q.data ?? []) as PublicPlan[], [q.data]);

    return (
        <div className="min-h-screen bg-[#FDFAF7]">
            <Navigation isScrolled={isScrolled} />

            {/* Header */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-light text-[#2C2C2C] mb-6"
                    >
                        Պարզ և <span className="text-[#C5A28A]">թափանցիկ</span> գներ
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-[#8F6B58] font-light mb-10"
                    >
                        Ընտրեք Ձեզ հարմար փաթեթը
                    </motion.p>

                    {/* Business Type Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center p-1 bg-white rounded-2xl shadow-lg"
                    >
                        <button
                            onClick={() => setSelectedType("salon")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all
                ${
                                selectedType === "salon"
                                    ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white"
                                    : "text-[#8F6B58]"
                            }`}
                        >
                            <Sparkles size={18} />
                            <span>Beauty</span>
                        </button>

                        <button
                            onClick={() => setSelectedType("clinic")}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all
                ${
                                selectedType === "clinic"
                                    ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white"
                                    : "text-[#8F6B58]"
                            }`}
                        >
                            <Award size={18} />
                            <span>Dental</span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {q.isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A28A] mx-auto mb-4" />
                            <p className="text-[#8F6B58] font-light">Բեռնում է փաթեթները...</p>
                        </div>
                    ) : q.isError ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">
                                Չհաջողվեց բեռնել փաթեթները: {(q.error as Error).message}
                            </p>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#8F6B58] font-light">Փաթեթներ չեն գտնվել</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {plans.map((plan, idx) => {
                                const featured = plan.code === "business" || plan.code === "premium";
                                const perks = planFeaturesToList(plan);

                                return (
                                    <motion.div
                                        key={plan.id ?? idx}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        whileHover={{ y: -10 }}
                                        className={`relative rounded-3xl p-8 transition-all
                      ${
                                            featured
                                                ? "bg-gradient-to-b from-white to-[#F9F5F0] shadow-2xl border-2 border-[#C5A28A]/30 scale-105"
                                                : "bg-white/80 border border-[#E8D5C4]/30"
                                        }`}
                                    >
                                        {featured && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span
                            className="bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                   text-white text-xs px-4 py-2 rounded-full whitespace-nowrap"
                        >
                          Ամենատարածված
                        </span>
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-light text-[#2C2C2C] mb-2">{plan.name}</h3>
                                        <p className="text-[#8F6B58] text-sm mb-6">{plan.description ?? ""}</p>

                                        <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-5xl font-light text-[#2C2C2C]">
                        {Number(plan.price).toLocaleString()}
                      </span>
                                            <span className="text-[#8F6B58] text-sm">
                        /{plan.period ?? "ամիս"}
                      </span>
                                        </div>

                                        <ul className="space-y-4 mb-8">
                                            {perks.map((perk, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <Check size={18} className="text-[#C5A28A] flex-shrink-0" />
                                                    <span className="text-[#2C2C2C]">{perk}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            to={`/register?type=${selectedType}`}
                                            className={`block text-center px-6 py-4 rounded-2xl transition-all
                        ${
                                                featured
                                                    ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white hover:shadow-xl"
                                                    : "border border-[#C5A28A]/30 text-[#8F6B58] hover:border-[#C5A28A]"
                                            }`}
                                        >
                                            Ընտրել փաթեթը
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-light text-center text-[#2C2C2C] mb-12">
                        Հաճախ տրվող հարցեր
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Կարո՞ղ եմ փոխել փաթեթը հետագայում",
                                a: "Այո, դուք կարող եք փոխել Ձեր փաթեթը ցանկացած պահի։ Տարբերությունը կհաշվարկվի համամասնորեն։",
                            },
                            {
                                q: "Ինչպե՞ս է աշխատում անվճար փորձաշրջանը",
                                a: "14 օր անվճար օգտվում եք բոլոր ֆունկցիաներից առանց որևէ պարտավորության։",
                            },
                            {
                                q: "Կա՞ արդյոք երկարաժամկետ պայմանագիր",
                                a: "Ոչ, դուք կարող եք չեղարկել ցանկացած պահի առանց տուգանքի։",
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl border border-[#E8D5C4]/30"
                            >
                                <h3 className="text-lg font-light text-[#2C2C2C] mb-2">{item.q}</h3>
                                <p className="text-[#8F6B58] text-sm">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}