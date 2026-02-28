import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Scissors } from "lucide-react";
import { Spinner } from "../components/ui/Spinner";
import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";

import {
    type Service,
    fetchServices,
    createService,
    updateService,
    deleteService,
} from "../lib/servicesApi";

const schema = z.object({
    name: z.string().min(2, "Ծառայության անունը պարտադիր է").max(120),
    duration_minutes: z.coerce
        .number()
        .int()
        .min(5, "Նվազագույնը՝ 5 րոպե")
        .max(600, "Առավելագույնը՝ 600 րոպե"),
    price: z
        .union([z.coerce.number().int().min(0).max(999999), z.literal(""), z.null()])
        .transform((v) => (v === "" ? null : v)),
    is_active: z.coerce.boolean(),
});

type FormState = z.infer<typeof schema>;

function toForm(s?: Service): FormState {
    return {
        name: s?.name ?? "",
        duration_minutes: s?.duration_minutes ?? 30,
        price: s?.price ?? null,
        is_active: s?.is_active ?? true,
    };
}

function formatAmd(price: number | null) {
    if (price === null) return "—";
    return `${price.toLocaleString("hy-AM")} դրամ`;
}

function formatDuration(mins: number) {
    if (mins < 60) return `${mins} րոպե`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}ժ ${m}ր` : `${h}ժ`;
}

export default function Services() {
    const qc = useQueryClient();
    const businessId = useAuth((s) => s.user?.business_id);

    const { data, isLoading, error } = useQuery({
        queryKey: ["services", businessId],
        queryFn: fetchServices,
        enabled: !!businessId,
        staleTime: 10_000,
    });

    const services = data ?? [];

    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return services;
        return services.filter((s) => s.name.toLowerCase().includes(t));
    }, [q, services]);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [form, setForm] = useState<FormState>(() => toForm());
    const [formError, setFormError] = useState<string | null>(null);

    const createMut = useMutation({
        mutationFn: createService,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["services", businessId] });
            setOpen(false);
        },
        onError: (err: any) => {
            setFormError(err?.response?.data?.message ?? "Չհաջողվեց ստեղծել");
        },
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<FormState> }) =>
            updateService(id, payload),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["services", businessId] });
            setOpen(false);
        },
        onError: (err: any) => {
            setFormError(err?.response?.data?.message ?? "Չհաջողվեց պահպանել");
        },
    });

    const deleteMut = useMutation({
        mutationFn: deleteService,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["services", businessId] });
        },
    });

    const toggleActiveMut = useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
            updateService(id, { is_active }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["services", businessId] });
        },
    });

    function openCreate() {
        setEditing(null);
        setForm(toForm());
        setFormError(null);
        setOpen(true);
    }

    function openEdit(s: Service) {
        setEditing(s);
        setForm(toForm(s));
        setFormError(null);
        setOpen(true);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        const parsed = schema.safeParse(form);
        if (!parsed.success) {
            setFormError(parsed.error.issues[0]?.message ?? "Սխալ տվյալներ");
            return;
        }

        const payload = parsed.data;

        if (!editing) {
            await createMut.mutateAsync({
                name: payload.name,
                duration_minutes: payload.duration_minutes,
                price: payload.price ?? null,
                is_active: payload.is_active,
            });
        } else {
            await updateMut.mutateAsync({
                id: editing.id,
                payload: {
                    name: payload.name,
                    duration_minutes: payload.duration_minutes,
                    price: payload.price ?? null,
                    is_active: payload.is_active,
                },
            });
        }
    }

    return (
        <motion.div {...page} className="space-y-6 p-6 bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] rounded-3xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <div className="text-sm text-[#8F6B58] font-light tracking-wide">Կատալոգ</div>
                    <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
                        <Scissors size={28} className="text-[#C5A28A]" />
                        <span>Ծառայություններ</span>
                    </div>
                    <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                        Ստեղծիր ծառայություններ, որ ամրագրումները սկսեն աշխատել
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                        <input
                            className="w-full rounded-full border border-[#E8D5C4]/30 bg-white/80
                                     pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#C5A28A]
                                     focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                            placeholder="Փնտրել ծառայություն…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={openCreate}
                            className="gap-2 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-full px-6"
                            disabled={!businessId}
                        >
                            <Plus size={16} />
                            Նոր ծառայություն
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Card */}
            <Card className="border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8D5C4]/20 flex items-center justify-between">
                    <div className="text-sm text-[#8F6B58] font-light">
                        {!businessId
                            ? "Սրահը չի ընտրված"
                            : isLoading
                                ? "Բեռնում…"
                                : `${filtered.length} ծառայություն`}
                    </div>

                    {(createMut.isPending || updateMut.isPending || deleteMut.isPending || toggleActiveMut.isPending) && (
                        <div className="flex items-center gap-2 text-xs text-[#8F6B58] font-light">
                            <Spinner size={14} />
                            Պահպանվում է…
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-6 text-sm text-red-600 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-200">
                        {(error as any)?.message ?? "Չհաջողվեց բեռնել"}
                    </div>
                )}

                {!isLoading && filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-[#F9F5F0] to-[#F0E7DD]
                                    flex items-center justify-center border border-[#E8D5C4]/30">
                            <Scissors size={24} className="text-[#C5A28A]" />
                        </div>
                        <h3 className="text-lg font-light text-[#2C2C2C] mb-2">Ծառայություններ դեռ չկան</h3>
                        <p className="text-sm text-[#8F6B58] font-light mb-6">
                            Սեղմիր “Նոր ծառայություն”, ավելացնենք առաջինը
                        </p>
                        <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-full px-6">
                            <Plus size={16} />
                            Նոր ծառայություն
                        </Button>
                    </div>
                ) : (
                    <div className="w-full overflow-auto">
                        <table className="min-w-[920px] w-full text-sm">
                            <thead className="bg-gradient-to-r from-[#F9F5F0] to-[#F0E7DD] text-[#8F6B58]">
                            <tr>
                                <th className="text-left font-light px-6 py-4">Անուն</th>
                                <th className="text-left font-light px-6 py-4">Տևողություն</th>
                                <th className="text-left font-light px-6 py-4">Գին</th>
                                <th className="text-left font-light px-6 py-4">Տեսանելի</th>
                                <th className="text-right font-light px-6 py-4">Գործողություններ</th>
                            </tr>
                            </thead>

                            <tbody className="text-[#2C2C2C]">
                            {filtered.map((s, index) => (
                                <motion.tr
                                    key={s.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-t border-[#E8D5C4]/20 hover:bg-gradient-to-r hover:from-[#F9F5F0]/30 hover:to-[#F0E7DD]/30 transition-all duration-300"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-light text-[#2C2C2C]">{s.name}</div>
                                        <div className="text-xs text-[#8F6B58] font-light">ID՝ {s.id}</div>
                                    </td>

                                    <td className="px-6 py-4 font-light">{formatDuration(s.duration_minutes)}</td>
                                    <td className="px-6 py-4 font-light">{formatAmd(s.price ?? null)}</td>

                                    <td className="px-6 py-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-light transition-all duration-300",
                                                s.is_active
                                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:bg-green-100"
                                                    : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                            )}
                                            onClick={() =>
                                                toggleActiveMut.mutate({
                                                    id: s.id,
                                                    is_active: !s.is_active,
                                                })
                                            }
                                            title="Փոխել տեսանելիությունը"
                                        >
                                            {s.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                            {s.is_active ? "Տեսանելի" : "Թաքնված"}
                                        </motion.button>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="gap-2 border border-[#E8D5C4]/30 text-[#8F6B58]
                                                                 hover:border-[#C5A28A] hover:bg-white rounded-full"
                                                    onClick={() => openEdit(s)}
                                                >
                                                    <Pencil size={14} />
                                                    Խմբագրել
                                                </Button>
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="gap-2 border border-red-200 text-red-600
                                                                 hover:bg-red-50 hover:border-red-300 rounded-full"
                                                    onClick={() => {
                                                        if (confirm(`Ջնջե՞լ "${s.name}" ծառայությունը`))
                                                            deleteMut.mutate(s.id);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                    Ջնջել
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal */}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={editing ? "Խմբագրել ծառայություն" : "Նոր ծառայություն"}
            >
                <form onSubmit={submit} className="space-y-4">
                    {formError && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-sm text-red-600 font-light">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                            Անուն
                        </label>
                        <input
                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                     focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Օր․ Մանիկյուր, Սանրվածք…"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Տևողություն (րոպե)
                            </label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                         px-4 py-3 outline-none focus:border-[#C5A28A]
                                         focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                                value={form.duration_minutes}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, duration_minutes: Number(e.target.value) }))
                                }
                                min={5}
                                max={600}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Գին (դրամ)
                            </label>
                            <input
                                type="number"
                                className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                         px-4 py-3 outline-none focus:border-[#C5A28A]
                                         focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                                value={form.price ?? ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        price: e.target.value === "" ? null : Number(e.target.value),
                                    }))
                                }
                                min={0}
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-[#2C2C2C] font-light">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                            className="w-4 h-4 rounded border-[#E8D5C4] text-[#C5A28A] focus:ring-[#C5A28A]/30"
                        />
                        Տեսանելի (Public booking-ում երևա)
                    </label>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Փակել
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMut.isPending || updateMut.isPending}
                            className="bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white hover:shadow-lg"
                        >
                            {editing ? "Պահպանել" : "Ստեղծել"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}