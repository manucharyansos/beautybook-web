import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    createPublicBooking,
    fetchPublicAvailability,
    fetchPublicBusiness, // փոխել fetchPublicSalon-ից
    fetchPublicServices,
    fetchPublicStaff,
} from "../lib/publicApi";
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle, AlertCircle, Globe, Loader2, Sparkles, Award } from "lucide-react";
import { cn } from "../lib/cn";

function ymd(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
const todayYmd = ymd(new Date());

// Premium animations
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
};

// Timezone display helper
function getTimezoneDisplay(timezone: string): string {
    const tzMap: Record<string, string> = {
        'Asia/Yerevan': 'Հայաստան (Երևան)',
        'Europe/Moscow': 'Ռուսաստան (Մոսկվա)',
        'Europe/Istanbul': 'Թուրքիա (Ստամբուլ)',
        'Asia/Tbilisi': 'Վրաստան (Թբիլիսի)',
    };
    return tzMap[timezone] || timezone;
}

export default function PublicBooking() {
    const { slug = "" } = useParams();

    const [serviceId, setServiceId] = useState<number>(0);
    const [staffId, setStaffId] = useState<number | "any">("any");
    const [date, setDate] = useState<string>(() => todayYmd);
    const [time, setTime] = useState<string>("");

    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [msg, setMsg] = useState<string | null>(null);
    const [msgType, setMsgType] = useState<"success" | "error">("success");

    // Fetch business details (փոխել fetchPublicSalon-ից fetchPublicBusiness)
    const businessQ = useQuery({
        queryKey: ["public-business", slug],
        queryFn: () => fetchPublicBusiness(slug),
        enabled: !!slug,
    });

    const servicesQ = useQuery({
        queryKey: ["public-services", slug],
        queryFn: () => fetchPublicServices(slug),
        enabled: !!slug,
    });

    const staffQ = useQuery({
        queryKey: ["public-staff", slug],
        queryFn: () => fetchPublicStaff(slug),
        enabled: !!slug,
    });

    const services = servicesQ.data ?? [];
    const staff = staffQ.data ?? [];

    useEffect(() => {
        if (!serviceId && services.length) {
            setServiceId(services[0].id);
        }
    }, [serviceId, services]);

    const availabilityQ = useQuery({
        queryKey: ["public-availability", slug, serviceId, staffId, date],
        queryFn: () =>
            fetchPublicAvailability({
                slug,
                service_id: serviceId,
                date,
                staff_id: staffId === "any" ? undefined : staffId,
            }),
        enabled: !!slug && !!serviceId && !!date && serviceId !== 0,
        retry: false,
    });

    const slots = availabilityQ.data ?? [];

    useEffect(() => {
        if (!slots.length) return;
        const first = slots[0].starts_at.slice(11, 16);
        if (!time) setTime(first);
    }, [slots, time]);

    const createMut = useMutation({
        mutationFn: createPublicBooking,
        onSuccess: () => {
            setMsgType("success");
            setMsg("✅ Ամրագրումը հաջողությամբ ուղարկվեց։ Շուտով կկապնվենք Ձեզ հետ։");
            setClientName("");
            setClientPhone("");
            setNotes("");
        },
        onError: (err: any) => {
            setMsgType("error");
            setMsg(err?.response?.data?.message ?? "Չհաջողվեց ամրագրել");
            console.error("Booking error:", err);
        },
    });

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);

        // Validation
        if (!serviceId) {
            setMsgType("error");
            return setMsg("Ընտրիր ծառայություն");
        }

        if (!slots.length) {
            setMsgType("error");
            return setMsg("Այս օրվա համար ազատ ժամ չկա");
        }

        if (!time) {
            setMsgType("error");
            return setMsg("Ընտրիր ժամ");
        }

        if (clientName.trim().length < 2) {
            setMsgType("error");
            return setMsg("Անունը պարտադիր է");
        }

        if (clientPhone.trim().length < 5) {
            setMsgType("error");
            return setMsg("Հեռախոսը պարտադիր է");
        }

        const chosen = slots.find((s) => s.starts_at.slice(11, 16) === time);
        if (!chosen) {
            setMsgType("error");
            return setMsg("Ընտրված ժամը այլևս ազատ չէ։");
        }

        await createMut.mutateAsync({
            slug,
            service_id: serviceId,
            staff_id: staffId === "any" ? undefined : staffId,
            starts_at: chosen.starts_at.slice(0, 16),
            client_name: clientName.trim(),
            client_phone: clientPhone.trim(),
            notes: notes?.trim() || null,
        });
    }

    // Loading state
    if (servicesQ.isLoading || staffQ.isLoading || businessQ.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-[#C5A28A] mx-auto mb-4" />
                    <p className="text-[#8F6B58] font-light">Բեռնում...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] p-4 relative">
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
                initial="hidden"
                animate="show"
                variants={scaleIn}
                className="mx-auto max-w-xl relative"
            >
                {/* Business Info */}
                <motion.div variants={fadeUp} className="text-center mb-8">
                    <h1 className="text-3xl font-light text-[#2C2C2C]">
                        {businessQ.data?.name ?? slug}
                    </h1>

                    {/* Business Type Badge */}
                    {businessQ.data?.business_type && (
                        <div className="mt-2 flex justify-center">
                            <div className={cn(
                                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs",
                                businessQ.data.business_type === 'beauty'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                            )}>
                                {businessQ.data.business_type === 'beauty' ? (
                                    <>
                                        <Sparkles size={12} />
                                        <span>Beauty Salon</span>
                                    </>
                                ) : (
                                    <>
                                        <Award size={12} />
                                        <span>Dental Clinic</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {businessQ.data && (
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-[#8F6B58] font-light">
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {businessQ.data.work_start} - {businessQ.data.work_end}
                            </span>

                            {/* Timezone display */}
                            {businessQ.data.timezone && (
                                <span className="flex items-center gap-1">
                                    <Globe size={14} />
                                    {getTimezoneDisplay(businessQ.data.timezone)}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Main Card */}
                <motion.div
                    variants={scaleIn}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8
                             border border-[#E8D5C4]/30 shadow-2xl shadow-black/5"
                >
                    {/* Status Message */}
                    {msg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "mb-6 p-4 rounded-xl border flex items-center gap-3",
                                msgType === "success"
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700"
                                    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-600"
                            )}
                        >
                            {msgType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="text-sm font-light">{msg}</span>
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        {/* Service */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Ծառայություն *
                            </label>
                            <select
                                className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                         px-4 py-3 outline-none focus:border-[#C5A28A]
                                         focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                                value={serviceId}
                                onChange={(e) => {
                                    setServiceId(Number(e.target.value));
                                    setTime("");
                                }}
                                required
                            >
                                {services.length === 0 && (
                                    <option value="">Ծառայություններ չկան</option>
                                )}
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.duration_minutes} ր)
                                    </option>
                                ))}
                            </select>
                        </motion.div>

                        {/* Staff */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Աշխատակից (ընտրովի)
                            </label>
                            <select
                                className="w-full rounded-xl border border-[#E8D5C4]/30 bg-white/80
                                         px-4 py-3 outline-none focus:border-[#C5A28A]
                                         focus:ring-1 focus:ring-[#C5A28A]/30 transition-all duration-300 font-light"
                                value={staffId}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setStaffId(v === "any" ? "any" : Number(v));
                                    setTime("");
                                }}
                            >
                                <option value="any">Ցանկացած աշխատակից</option>
                                {staff.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </motion.div>

                        {/* Date & Time */}
                        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                    Ամսաթիվ *
                                </label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                    <input
                                        type="date"
                                        min={todayYmd}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl
                                                 border border-[#E8D5C4]/30 bg-white/80
                                                 focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                 transition-all duration-300 outline-none font-light"
                                        value={date}
                                        onChange={(e) => {
                                            setDate(e.target.value);
                                            setTime("");
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                    Ժամ *
                                </label>
                                <div className="relative">
                                    <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                    <select
                                        className="w-full pl-11 pr-4 py-3 rounded-xl
                                                 border border-[#E8D5C4]/30 bg-white/80
                                                 focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                 transition-all duration-300 font-light disabled:bg-gray-50"
                                        disabled={availabilityQ.isLoading || slots.length === 0}
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                    >
                                        {availabilityQ.isLoading && (
                                            <option value="">Բեռնում է ազատ ժամերը...</option>
                                        )}
                                        {!availabilityQ.isLoading && slots.length === 0 && (
                                            <option value="">Ազատ ժամեր չկան</option>
                                        )}
                                        {slots.map((s) => {
                                            const st = s.starts_at.slice(11, 16);
                                            const en = s.ends_at.slice(11, 16);
                                            return (
                                                <option key={s.starts_at} value={st}>
                                                    {st}–{en}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                {availabilityQ.isLoading && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-[#8F6B58] font-light">
                                        <Loader2 size={12} className="animate-spin" />
                                        Բեռնում է ազատ ժամերը...
                                    </div>
                                )}
                                {slots.length > 0 && !availabilityQ.isLoading && (
                                    <div className="mt-2 text-xs text-[#8F6B58] font-light">
                                        Առկա է {slots.length} ազատ ժամ
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Client Name */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Ձեր անունը *
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                <input
                                    className="w-full pl-11 pr-4 py-3 rounded-xl
                                             border border-[#E8D5C4]/30 bg-white/80
                                             focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                             transition-all duration-300 outline-none font-light"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Օրինակ՝ Մարիամ"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Client Phone */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Հեռախոսահամար *
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                <input
                                    type="tel"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl
                                             border border-[#E8D5C4]/30 bg-white/80
                                             focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                             transition-all duration-300 outline-none font-light"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    placeholder="Օրինակ՝ 077123456"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Notes */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Լրացուցիչ նշումներ
                            </label>
                            <div className="relative">
                                <MessageSquare size={18} className="absolute left-4 top-3 text-[#8F6B58]" />
                                <textarea
                                    className="w-full pl-11 pr-4 py-3 rounded-xl
                                             border border-[#E8D5C4]/30 bg-white/80
                                             focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                             transition-all duration-300 outline-none font-light resize-none"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ընտրովի..."
                                />
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={fadeUp}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={createMut.isPending || availabilityQ.isLoading || slots.length === 0}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                     text-white font-light tracking-wide relative overflow-hidden
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-all duration-300 hover:shadow-lg"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {createMut.isPending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Ուղարկվում է...</span>
                                    </>
                                ) : (
                                    <span>Ամրագրել</span>
                                )}
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#B88E72] to-[#C5A28A]"
                                initial={{ x: "100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.button>
                    </form>
                </motion.div>

                {/* Powered by */}
                <motion.div
                    variants={fadeUp}
                    className="mt-6 text-center text-xs text-[#8F6B58] font-light"
                >
                    © {new Date().getFullYear()} BeautyBook - {businessQ.data?.business_type === 'dental' ? 'Դենտալ կլինիկաների' : 'Գեղեցկության սրահների'} ամրագրման համակարգ
                </motion.div>
            </motion.div>
        </div>
    );
}