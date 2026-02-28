import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../components/ui/Spinner";
import {
    CheckCircle2,
    Clock,
    User,
    Mail,
    Lock,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Store,
    DollarSign,
    Sparkles
} from "lucide-react";
import { cn } from "../lib/cn";

const steps = ["Ծառայություններ", "Աշխատակից", "Աշխատանքային ժամեր", "Ավարտ"];

type SeatLimitError = {
    message?: string;
    limit?: number | null;
    current?: number | null;
};

function extractErrorMessage(e: any) {
    return (
        e?.response?.data?.message ||
        e?.message ||
        "Սխալ է տեղի ունեցել"
    );
}

// Premium Badge
function PremiumBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`relative inline-flex items-center px-4 py-2 overflow-hidden rounded-full 
                         bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10 
                         border border-[#C5A28A]/20 text-[#8F6B58] text-xs font-medium 
                         backdrop-blur-sm ${className}`}>
            <span className="relative z-10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72] animate-pulse" />
                {children}
            </span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
            />
        </span>
    );
}

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Step 0 (Service)
    const [serviceName, setServiceName] = useState("");
    const [duration, setDuration] = useState<number>(30);
    const [price, setPrice] = useState<number | "">("");

    // Step 1 (Staff)
    const [staffName, setStaffName] = useState("");
    const [staffEmail, setStaffEmail] = useState("");
    const [staffPassword, setStaffPassword] = useState("password123");
    const [staffRole, setStaffRole] = useState<"staff" | "manager">("staff");

    // Step 2 (Work hours)
    const [workStart, setWorkStart] = useState("09:00");
    const [workEnd, setWorkEnd] = useState("18:00");
    const [slotStep, setSlotStep] = useState<number>(15);

    const navigate = useNavigate();
    const qc = useQueryClient();
    const { user, setUser } = useAuth();

    const bookingLink = useMemo(
        () => `beautybook.am/b/${user?.salon_slug ?? "your-salon"}`,
        [user?.salon_slug]
    );

    async function createServiceNext() {
        setError(null);

        const name = serviceName.trim();
        if (name.length < 2) return setError("Ծառայության անունը պարտադիր է (առնվազն 2 նիշ)։");
        if (duration < 5) return setError("Տևողությունը պետք է լինի առնվազն 5 րոպե։");

        setSaving(true);
        try {
            await api.post("/services", {
                name,
                duration_minutes: duration,
                price: price === "" ? null : price,
                is_active: true,
                currency: "AMD",
            });

            await qc.invalidateQueries({ queryKey: ["services"] });
            setCurrentStep(1);
        } catch (e: any) {
            setError(extractErrorMessage(e) || "Չհաջողվեց ստեղծել ծառայությունը");
        } finally {
            setSaving(false);
        }
    }

    async function createStaffNext() {
        setError(null);

        const n = staffName.trim();
        const em = staffEmail.trim();

        if (n.length < 2) return setError("Աշխատակցի անունը պարտադիր է։");
        if (!em.includes("@")) return setError("Email-ը սխալ է։");
        if (staffPassword.length < 8) return setError("Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։");

        setSaving(true);
        try {
            await api.post("/staff", {
                name: n,
                email: em,
                password: staffPassword,
                role: staffRole,
            });

            await qc.invalidateQueries({ queryKey: ["staff"] });
            setCurrentStep(2);
        } catch (e: any) {
            if (e?.response?.status === 409) {
                const d = (e.response.data ?? {}) as SeatLimitError;
                const limit = d.limit ?? "—";
                const current = d.current ?? "—";
                setError(
                    `Չհաջողվեց ավելացնել աշխատակից․ տեղերի սահմանաչափը լրացել է: ${current} / ${limit}։`
                );
            } else {
                setError(extractErrorMessage(e) || "Չհաջողվեց ավելացնել աշխատակից");
            }
        } finally {
            setSaving(false);
        }
    }

    async function saveHoursNext() {
        setError(null);

        if (!workStart || !workEnd) return setError("Ընտրիր աշխատանքային ժամերը։");
        if (workStart >= workEnd) return setError("Սկիզբը պետք է փոքր լինի վերջից։");
        if (slotStep < 5 || slotStep > 60) return setError("Քայլը պետք է լինի 5-60 րոպե։");

        setSaving(true);
        try {
            await api.patch("/salon/settings", {
                work_start: workStart,
                work_end: workEnd,
                slot_step_minutes: slotStep,
                timezone: "Asia/Yerevan",
            });

            await qc.invalidateQueries();
            setCurrentStep(3);
        } catch (e: any) {
            setError(extractErrorMessage(e) || "Չհաջողվեց պահպանել աշխատանքային ժամերը");
        } finally {
            setSaving(false);
        }
    }

    async function skipHours() {
        setError(null);
        setCurrentStep(3);
    }

    async function finish() {
        setError(null);
        setSaving(true);
        try {
            await api.post("/salon/complete-onboarding");

            if (user) setUser({ ...user, needs_onboarding: false });

            await qc.invalidateQueries();
            navigate("/app/dashboard", { replace: true });
        } catch (e: any) {
            setError(extractErrorMessage(e) || "Չստացվեց ավարտել onboarding-ը");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] flex items-center justify-center p-6 relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#C5A28A]/5">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                </div>
                <div className="absolute bottom-20 right-10 w-96 h-96">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#B88E72]/5 rotate-45">
                        <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5
                         p-8 sm:p-10 w-full max-w-2xl border border-[#E8D5C4]/30 relative"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <PremiumBadge className="mb-3">
                            Սկզբնական կարգավորում
                        </PremiumBadge>
                        <h1 className="text-3xl font-light text-[#2C2C2C]">
                            {steps[currentStep]}
                        </h1>
                    </div>
                    <div className="text-sm text-[#8F6B58] font-light bg-[#F9F5F0] px-4 py-2 rounded-full">
                        Քայլ {currentStep + 1} / {steps.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 grid grid-cols-4 gap-2">
                    {steps.map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: i <= currentStep ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                i <= currentStep
                                    ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72]"
                                    : "bg-[#E8D5C4]/30"
                            )}
                        />
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50
                                 border border-red-200 text-sm text-red-600 font-light"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Step Content */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                >
                    {/* STEP 0: Service */}
                    {currentStep === 0 && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-[#8F6B58] text-sm font-light">
                                <Store size={16} />
                                <span>Ավելացրեք առաջին ծառայությունը</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Ծառայության անվանում
                                    </label>
                                    <input
                                        value={serviceName}
                                        onChange={(e) => setServiceName(e.target.value)}
                                        className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                                 px-4 py-3 outline-none focus:border-[#C5A28A]
                                                 focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300
                                                 font-light"
                                        placeholder="Օր․ Մանիկյուր, Սանրվածք…"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                            Տևողություն (րոպե)
                                        </label>
                                        <div className="relative">
                                            <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(Number(e.target.value))}
                                                min={5}
                                                max={600}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl
                                                         border border-[#E8D5C4]/30 bg-white/80
                                                         focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                         transition-all duration-300 outline-none font-light"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                            Գին (դրամ)
                                        </label>
                                        <div className="relative">
                                            <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                                min={0}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl
                                                         border border-[#E8D5C4]/30 bg-white/80
                                                         focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                         transition-all duration-300 outline-none font-light"
                                                placeholder="5000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: Staff */}
                    {currentStep === 1 && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-[#8F6B58] text-sm font-light">
                                <User size={16} />
                                <span>Ավելացրեք առաջին աշխատակցին</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Անուն
                                    </label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            value={staffName}
                                            onChange={(e) => setStaffName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white/80
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="Օր․ Աննա"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            value={staffEmail}
                                            onChange={(e) => setStaffEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white/80
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="anna@mail.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                            Գաղտնաբառ
                                        </label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                            <input
                                                type="password"
                                                value={staffPassword}
                                                onChange={(e) => setStaffPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl
                                                         border border-[#E8D5C4]/30 bg-white/80
                                                         focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                         transition-all duration-300 outline-none font-light"
                                            />
                                        </div>
                                        <div className="mt-1 text-xs text-[#8F6B58] font-light">
                                            Նվազագույնը՝ 8 նիշ
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                            Դեր
                                        </label>
                                        <select
                                            value={staffRole}
                                            onChange={(e) => setStaffRole(e.target.value as any)}
                                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                                     focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 font-light"
                                        >
                                            <option value="staff">Աշխատակից</option>
                                            <option value="manager">Կառավարիչ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Hours */}
                    {currentStep === 2 && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-[#8F6B58] text-sm font-light">
                                <Calendar size={16} />
                                <span>Աշխատանքային ժամեր (ընտրովի)</span>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                            Սկիզբ
                                        </label>
                                        <input
                                            type="time"
                                            value={workStart}
                                            onChange={(e) => setWorkStart(e.target.value)}
                                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                                     focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 font-light"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                            Վերջ
                                        </label>
                                        <input
                                            type="time"
                                            value={workEnd}
                                            onChange={(e) => setWorkEnd(e.target.value)}
                                            className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                                     px-4 py-3 outline-none focus:border-[#C5A28A]
                                                     focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 font-light"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Slot քայլ (րոպե)
                                    </label>
                                    <select
                                        value={slotStep}
                                        onChange={(e) => setSlotStep(Number(e.target.value))}
                                        className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                                 px-4 py-3 outline-none focus:border-[#C5A28A]
                                                 focus:ring-1 focus:ring-[#C5A28A]/30
                                                 transition-all duration-300 font-light"
                                    >
                                        {[5, 10, 15, 20, 30, 60].map((v) => (
                                            <option key={v} value={v}>
                                                {v} րոպե
                                            </option>
                                        ))}
                                    </select>
                                    <div className="mt-2 text-xs text-[#8F6B58] font-light">
                                        Օրինակ՝ 15 րոպե նշանակում է ազատ slot-երը կստեղծվեն 15-րոպեանոց քայլերով
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Complete */}
                    {currentStep === 3 && (
                        <div className="text-center space-y-6">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                          flex items-center justify-center"
                            >
                                <CheckCircle2 size={40} className="text-white" />
                            </motion.div>

                            <div>
                                <h2 className="text-3xl font-light text-[#2C2C2C] mb-2">
                                    Պատրաստ է! 🎉
                                </h2>
                                <p className="text-[#8F6B58] font-light">
                                    Ձեր ամրագրման հղումը
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-[#F9F5F0] to-[#F0E7DD] p-4 rounded-xl
                                          border border-[#E8D5C4]/30">
                                <div className="text-sm text-[#2C2C2C] font-light break-all">
                                    {bookingLink}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-[#8F6B58] font-light">
                                <Sparkles size={16} className="text-[#C5A28A]" />
                                <span>Կարող եք փոխել ցանկացած պահի կարգավորումներում</span>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                    {currentStep > 0 && currentStep < 3 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="px-6 py-3 rounded-xl border border-[#E8D5C4]/30
                                     text-[#8F6B58] hover:border-[#C5A28A] hover:bg-white
                                     transition-all duration-300 flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span className="font-light">Հետ</span>
                        </motion.button>
                    )}

                    {currentStep < 2 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={currentStep === 0 ? createServiceNext :
                                currentStep === 1 ? createStaffNext : saveHoursNext}
                            disabled={saving}
                            className={cn(
                                "ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]",
                                "text-white font-light relative overflow-hidden",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                            )}
                        >
                            {saving ? (
                                <>
                                    <Spinner size="sm" className="border-white/30 border-t-white" />
                                    <span>Պահպանվում...</span>
                                </>
                            ) : (
                                <>
                                    <span>Շարունակել</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#B88E72] to-[#C5A28A]"
                                initial={{ x: "100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.button>
                    )}

                    {currentStep === 2 && (
                        <div className="ml-auto flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={skipHours}
                                className="px-6 py-3 rounded-xl border border-[#E8D5C4]/30
                                         text-[#8F6B58] hover:border-[#C5A28A] hover:bg-white
                                         transition-all duration-300 font-light"
                            >
                                Բաց թողնել
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={saveHoursNext}
                                disabled={saving}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                         text-white font-light relative overflow-hidden
                                         disabled:opacity-50 disabled:cursor-not-allowed
                                         transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Spinner size="sm" className="border-white/30 border-t-white" />
                                        <span>Պահպանվում...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Պահպանել</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={finish}
                            disabled={saving}
                            className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                     text-white font-light relative overflow-hidden
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Spinner size="sm" className="border-white/30 border-t-white" />
                                    <span>Բեռնվում...</span>
                                </>
                            ) : (
                                <>
                                    <span>Գնալ Dashboard</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}