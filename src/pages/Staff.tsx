import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
    Plus,
    UserCheck,
    UserX,
    Shield,
    UserCog,
    Users,
    Search,
    Info,
} from "lucide-react";

import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";
import {
    type StaffUser,
    fetchStaff,
    createStaff,
    activateStaff,
    deactivateStaff,
} from "../lib/staffApi";

const schema = z.object({
    name: z.string().min(2, "Անունը պետք է առնվազն 2 նիշ լինի").max(120),
    email: z.string().email("Մուտքագրեք ճիշտ էլ․ հասցե"),
    password: z.string().min(8, "Գաղտնաբառը պետք է առնվազն 8 նիշ լինի").max(255),
    role: z.enum(["staff", "manager"]).default("staff"),
});

type FormState = z.infer<typeof schema>;

function roleLabel(role: StaffUser["role"]) {
    switch (role) {
        case "owner":
            return "Սրահի սեփականատեր";
        case "manager":
            return "Կառավարիչ";
        case "staff":
            return "Աշխատակից";
        case "super_admin":
            return "Սուպեր ադմին";
        default:
            return role;
    }
}

function roleBadge(role: StaffUser["role"]) {
    switch (role) {
        case "owner":
            return { cls: "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200", icon: Shield };
        case "manager":
            return { cls: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200", icon: UserCog };
        case "staff":
            return { cls: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200", icon: Users };
        case "super_admin":
            return { cls: "bg-gradient-to-r from-black to-gray-800 text-white border-black", icon: Shield };
        default:
            return { cls: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200", icon: Users };
    }
}

function statusPill(isActive: boolean) {
    return isActive
        ? { label: "Ակտիվ", cls: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200" }
        : { label: "Ապաակտիվ", cls: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200" };
}

export default function Staff() {
    const qc = useQueryClient();
    const { user } = useAuth();

    const canManage =
        user?.role === "owner" || user?.role === "manager" || user?.role === "super_admin";

    const { data, isLoading, error } = useQuery({
        queryKey: ["staff"],
        queryFn: fetchStaff,
        enabled: !!canManage,
    });

    const staff = data ?? [];

    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return staff;
        return staff.filter(
            (u) => u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t)
        );
    }, [q, staff]);

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        password: "",
        role: "staff",
    });
    const [formError, setFormError] = useState<string | null>(null);

    const createMut = useMutation({
        mutationFn: createStaff,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["staff"] });
            setOpen(false);
            setForm({ name: "", email: "", password: "", role: "staff" });
            setFormError(null);
        },
        onError: (err: any) => {
            setFormError(err?.response?.data?.message ?? "Չհաջողվեց ստեղծել աշխատակցին");
        },
    });

    const toggleMut = useMutation({
        mutationFn: async ({ id, nextActive }: { id: number; nextActive: boolean }) => {
            if (nextActive) return activateStaff(id);
            return deactivateStaff(id);
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["staff"] });
        },
    });

    function openCreate() {
        setFormError(null);
        setForm({ name: "", email: "", password: "", role: "staff" });
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

        await createMut.mutateAsync(parsed.data);
    }

    if (!canManage) {
        return (
            <motion.div {...page} className="space-y-6 p-6 bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] rounded-3xl">
                <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
                    <Users size={28} className="text-[#C5A28A]" />
                    <span>Աշխատակիցներ</span>
                </div>
                <Card className="p-8 border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                        <Shield size={48} className="mx-auto mb-4 text-[#C5A28A]/50" />
                        <div className="text-[#8F6B58] font-light">
                            Այս բաժինը հասանելի է միայն Սրահի սեփականատիրոջ և Կառավարիչի համար։
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
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
                    <div className="text-sm text-[#8F6B58] font-light tracking-wide">Կազմ</div>
                    <div className="text-3xl font-light text-[#2C2C2C] flex items-center gap-3">
                        <Users size={28} className="text-[#C5A28A]" />
                        <span>Աշխատակիցներ</span>
                    </div>
                    <div className="mt-2 text-xs text-[#8F6B58] font-light flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#C5A28A]" />
                        Ավելացրու աշխատակիցներ, որպեսզի ամրագրումները լինեն ճիշտ մարդկանց վրա
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                        <input
                            className="w-full rounded-full border border-[#E8D5C4]/30 bg-white/80
                                     pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#C5A28A]
                                     focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                            placeholder="Փնտրել անունով կամ էլ․ հասցեով…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={openCreate}
                            className="gap-2 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-full px-6"
                        >
                            <Plus size={16} />
                            Ավելացնել
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Card */}
            <Card className="border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8D5C4]/20 flex items-center justify-between">
                    <div className="text-sm text-[#8F6B58] font-light">
                        {isLoading ? "Բեռնում…" : `${filtered.length} օգտատեր`}
                    </div>
                    {toggleMut.isPending && (
                        <div className="flex items-center gap-2 text-xs text-[#8F6B58] font-light">
                            <Spinner size={14} />
                            Թարմացվում է…
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
                            <Users size={24} className="text-[#C5A28A]" />
                        </div>
                        <h3 className="text-lg font-light text-[#2C2C2C] mb-2">Աշխատակիցներ դեռ չկան</h3>
                        <p className="text-sm text-[#8F6B58] font-light mb-6">
                            Սեղմիր “Ավելացնել”, ստեղծենք առաջին աշխատակցին
                        </p>
                        <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-full px-6">
                            <Plus size={16} />
                            Ավելացնել
                        </Button>
                    </div>
                ) : (
                    <div className="w-full overflow-auto">
                        <table className="min-w-[920px] w-full text-sm">
                            <thead className="bg-gradient-to-r from-[#F9F5F0] to-[#F0E7DD] text-[#8F6B58]">
                            <tr>
                                <th className="text-left font-light px-6 py-4">Անուն</th>
                                <th className="text-left font-light px-6 py-4">Էլ․ հասցե</th>
                                <th className="text-left font-light px-6 py-4">Դեր</th>
                                <th className="text-left font-light px-6 py-4">Կարգավիճակ</th>
                                <th className="text-right font-light px-6 py-4">Գործողություն</th>
                            </tr>
                            </thead>

                            <tbody className="text-[#2C2C2C]">
                            {filtered.map((u, index) => {
                                const badge = roleBadge(u.role);
                                const Icon = badge.icon;
                                const st = statusPill(!!u.is_active);
                                const canToggle = u.role !== "owner" && u.role !== "super_admin";

                                return (
                                    <motion.tr
                                        key={u.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-t border-[#E8D5C4]/20 hover:bg-gradient-to-r hover:from-[#F9F5F0]/30 hover:to-[#F0E7DD]/30 transition-all duration-300"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-light text-[#2C2C2C]">{u.name}</div>
                                            <div className="text-xs text-[#8F6B58] font-light">ID՝ {u.id}</div>
                                        </td>

                                        <td className="px-6 py-4 font-light">{u.email}</td>

                                        <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-light",
                                                        badge.cls
                                                    )}
                                                >
                                                    <Icon size={14} />
                                                    {roleLabel(u.role)}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-light",
                                                        st.cls
                                                    )}
                                                >
                                                    {st.label}
                                                </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end items-center gap-3">
                                                {!canToggle && (
                                                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#8F6B58] font-light">
                                                            <Info size={14} /> պաշտպանված
                                                        </span>
                                                )}

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={cn(
                                                        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-light transition-all duration-300",
                                                        u.is_active
                                                            ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                            : "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300",
                                                        !canToggle && "opacity-50 cursor-not-allowed"
                                                    )}
                                                    disabled={!canToggle || toggleMut.isPending}
                                                    onClick={() => {
                                                        if (!canToggle) return;

                                                        const nextActive = !u.is_active;
                                                        const ok = confirm(
                                                            nextActive
                                                                ? `Ակտիվացնե՞լ "${u.name}"-ին։`
                                                                : `Ապաակտիվացնե՞լ "${u.name}"-ին։`
                                                        );

                                                        if (ok) toggleMut.mutate({ id: u.id, nextActive });
                                                    }}
                                                >
                                                    {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                                    {u.is_active ? "Ապաակտիվացնել" : "Ակտիվացնել"}
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)} title="Ավելացնել աշխատակից">
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
                            placeholder="Օր․ Աննա Գրիգորյան"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                            Էլ․ հասցե
                        </label>
                        <input
                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                     focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="name@mail.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                            Գաղտնաբառ
                        </label>
                        <input
                            type="password"
                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                     focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            placeholder="առնվազն 8 նիշ"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                            Դեր
                        </label>
                        <select
                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                     focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                            value={form.role}
                            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as any }))}
                        >
                            <option value="staff">Աշխատակից</option>
                            <option value="manager">Կառավարիչ</option>
                        </select>

                        <div className="mt-1 text-xs text-[#8F6B58] font-light">
                            Կառավարիչը կարող է կառավարել staff, services, calendar
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Չեղարկել
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMut.isPending}
                            className="bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white hover:shadow-lg"
                        >
                            {createMut.isPending ? "Ստեղծվում է…" : "Ստեղծել"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}