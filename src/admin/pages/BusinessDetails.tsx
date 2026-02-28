// src/admin/pages/BusinessDetails.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Building2,
    ArrowLeft,
    Users,
    CalendarCheck,
    DollarSign,
    Clock,
    MapPin,
    Phone,
    Mail,
    Globe,
    Activity,
    Shield,
    Crown,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
    Edit,
    Sparkles,
    Award
} from "lucide-react";
import { adminBusinessesApi } from "../services/adminBusinessesApi";
import { cn } from "@/lib/cn.ts";

// Premium animations
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

// Stat Card Component
function StatCard({
                      icon: Icon,
                      label,
                      value,
                      subValue,
                      gradient = "from-[#C5A28A]/10 to-[#B88E72]/10"
                  }: {
    icon: any;
    label: string;
    value: React.ReactNode;
    subValue?: string;
    gradient?: string;
}) {
    return (
        <motion.div variants={fadeUp} className="relative">
            <div className="relative p-6 overflow-hidden border border-[#E8D5C4]/30 rounded-xl
                          hover:border-[#C5A28A]/50 transition-all duration-700 bg-white/80 backdrop-blur-sm">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", gradient)} />

                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm text-[#8F6B58] font-light mb-1">{label}</div>
                            <div className="text-2xl font-light text-[#2C2C2C]">{value}</div>
                            {subValue && (
                                <div className="text-xs text-[#8F6B58] font-light mt-2">{subValue}</div>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                      flex items-center justify-center text-white shadow-lg shadow-[#C5A28A]/20">
                            <Icon size={22} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Info Row Component
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2 border-b border-[#E8D5C4]/20 last:border-0">
            <Icon size={18} className="text-[#C5A28A] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
                <div className="text-xs text-[#8F6B58] font-light">{label}</div>
                <div className="text-sm text-[#2C2C2C] font-light break-words">{value || '—'}</div>
            </div>
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const config = {
        active: {
            label: 'Ակտիվ',
            icon: CheckCircle2,
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200'
        },
        suspended: {
            label: 'Կասեցված',
            icon: XCircle,
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200'
        },
        pending: {
            label: 'Սպասման մեջ',
            icon: AlertCircle,
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200'
        },
        trialing: {
            label: 'Փորձաշրջան',
            icon: Activity,
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200'
        }
    }[status] || {
        label: status,
        icon: Activity,
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
    };

    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-light border",
            config.bg,
            config.text,
            config.border
        )}>
            <Icon size={14} />
            {config.label}
        </span>
    );
}

// Type Badge Component
function TypeBadge({ type }: { type: 'beauty' | 'dental' }) {
    return type === 'beauty' ? (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs border border-purple-200">
            <Sparkles size={14} />
            Beauty
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
            <Award size={14} />
            Dental
        </span>
    );
}

// Type definitions
interface Business {
    id: number;
    name: string;
    slug: string;
    business_type: 'beauty' | 'dental';
    phone?: string;
    address?: string;
    status: string;
    work_start?: string;
    work_end?: string;
    timezone?: string;
    is_onboarding_completed?: boolean;
    created_at?: string;
}

interface Subscription {
    status: string;
    is_active: boolean;
    plan?: {
        id: number;
        name: string;
        price: number;
        seats: number;
    };
}

interface BusinessDetailsResponse {
    business: Business;
    subscription?: Subscription;
    seats: {
        active: number;
        limit: number | null;
        has_available: boolean;
    };
    stats: {
        users_total: number;
        users_active: number;
        staff_active: number;
        bookings_total: number;
        bookings_confirmed_done: number;
        revenue_all_time: number;
        currency: string;
    };
}

export default function BusinessDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const businessId = Number(id);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["admin", "business", businessId],
        queryFn: async () => {
            const response = await adminBusinessesApi.get(businessId);
            console.log('Business details API response:', response.data);
            return response.data as { data: BusinessDetailsResponse };
        },
        enabled: Number.isFinite(businessId) && businessId > 0,
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#C5A28A] mx-auto mb-4" />
                    <p className="text-[#8F6B58] font-light">Բեռնում է բիզնեսի տվյալները...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-light text-[#2C2C2C] mb-2">Սխալ</h3>
                    <p className="text-sm text-[#8F6B58] font-light">
                        {error instanceof Error ? error.message : 'Չհաջողվեց բեռնել բիզնեսի տվյալները'}
                    </p>
                    <button
                        onClick={() => navigate('/admin/businesses')}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white rounded-xl hover:shadow-lg transition"
                    >
                        <ArrowLeft size={18} />
                        Վերադառնալ ցուցակ
                    </button>
                </div>
            </div>
        );
    }

    if (!data?.data) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Տվյալներ չեն գտնվել</p>
                </div>
            </div>
        );
    }

    const d = data.data;
    const business = d.business;
    const stats = d.stats;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto"
        >
            {/* Header with Back Button and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/businesses')}
                        className="p-2 hover:bg-white/80 rounded-xl transition-colors group"
                        aria-label="Վերադառնալ"
                    >
                        <ArrowLeft size={20} className="text-[#8F6B58] group-hover:text-[#C5A28A]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl md:text-3xl font-light text-[#2C2C2C]">{business.name}</h1>
                            <TypeBadge type={business.business_type} />
                        </div>
                        <p className="text-sm text-[#8F6B58] font-light mt-1 flex items-center gap-2">
                            <Building2 size={14} />
                            {business.slug}
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-center gap-3">
                    <StatusBadge status={business.status} />
                </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <StatCard
                    icon={Users}
                    label="Աշխատակիցներ"
                    value={`${d.seats.active} / ${d.seats.limit ?? '∞'}`}
                    subValue={`${stats?.users_total || 0} օգտատեր · ${stats?.staff_active || 0} ակտիվ`}
                    gradient="from-blue-500/10 to-cyan-500/10"
                />

                <StatCard
                    icon={CalendarCheck}
                    label="Ամրագրումներ"
                    value={stats?.bookings_total || 0}
                    subValue={`${stats?.bookings_confirmed_done || 0} հաստատված`}
                    gradient="from-green-500/10 to-emerald-500/10"
                />

                <StatCard
                    icon={DollarSign}
                    label="Ընդհանուր եկամուտ"
                    value={`${(stats?.revenue_all_time || 0).toLocaleString()} ${stats?.currency || 'AMD'}`}
                    gradient="from-purple-500/10 to-pink-500/10"
                />

                <StatCard
                    icon={Activity}
                    label="Բաժանորդագրություն"
                    value={d.subscription?.plan?.name || 'Ակտիվ չէ'}
                    subValue={d.subscription?.status || '—'}
                    gradient="from-amber-500/10 to-orange-500/10"
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Business Info */}
                <motion.div variants={scaleIn} className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-sm border border-[#E8D5C4]/30 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-light text-[#2C2C2C] flex items-center gap-2">
                            <Building2 size={18} className="text-[#C5A28A]" />
                            Բիզնեսի տվյալներ
                        </h2>

                        <div className="space-y-1">
                            <InfoRow icon={Phone} label="Հեռախոս" value={business.phone} />
                            <InfoRow icon={MapPin} label="Հասցե" value={business.address} />
                            <InfoRow icon={Clock} label="Աշխատանքային ժամեր" value={`${business.work_start || '09:00'} - ${business.work_end || '20:00'}`} />
                            <InfoRow icon={Globe} label="Ժամային գոտի" value={business.timezone || 'Asia/Yerevan'} />
                            <InfoRow icon={Activity} label="Onboarding" value={business.is_onboarding_completed ? 'Ավարտված' : 'Թերի'} />
                            <InfoRow icon={CalendarCheck} label="Ստեղծված" value={business.created_at ? new Date(business.created_at).toLocaleDateString('hy-AM') : '—'} />
                        </div>

                        {/* Subscription Details */}
                        {d.subscription && (
                            <div className="mt-6 pt-4 border-t border-[#E8D5C4]/20">
                                <h3 className="text-sm font-light text-[#2C2C2C] mb-3 flex items-center gap-2">
                                    <Crown size={16} className="text-[#C5A28A]" />
                                    Բաժանորդագրություն
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8F6B58] font-light">Փաթեթ</span>
                                        <span className="text-[#2C2C2C] font-light">{d.subscription.plan?.name || '—'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8F6B58] font-light">Կարգավիճակ</span>
                                        <StatusBadge status={d.subscription.status} />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8F6B58] font-light">Տեղեր</span>
                                        <span className="text-[#2C2C2C] font-light">{d.subscription.plan?.seats || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column - Users Stats */}
                <motion.div variants={scaleIn} className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm border border-[#E8D5C4]/30 rounded-xl p-6">
                        <h2 className="text-lg font-light text-[#2C2C2C] flex items-center gap-2 mb-4">
                            <Users size={18} className="text-[#C5A28A]" />
                            Աշխատակիցների վիճակագրություն
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#F9F5F0]/50 rounded-xl border border-[#E8D5C4]/20">
                                <div className="text-sm text-[#8F6B58] font-light mb-1">Ընդհանուր օգտատերեր</div>
                                <div className="text-3xl font-light text-[#2C2C2C]">{stats?.users_total || 0}</div>
                            </div>

                            <div className="p-4 bg-[#F9F5F0]/50 rounded-xl border border-[#E8D5C4]/20">
                                <div className="text-sm text-[#8F6B58] font-light mb-1">Ակտիվ աշխատակիցներ</div>
                                <div className="text-3xl font-light text-[#2C2C2C]">{stats?.staff_active || 0}</div>
                            </div>

                            <div className="p-4 bg-[#F9F5F0]/50 rounded-xl border border-[#E8D5C4]/20">
                                <div className="text-sm text-[#8F6B58] font-light mb-1">Զբաղեցված տեղեր</div>
                                <div className="text-3xl font-light text-[#2C2C2C]">{d.seats.active} / {d.seats.limit || '∞'}</div>
                            </div>

                            <div className="p-4 bg-[#F9F5F0]/50 rounded-xl border border-[#E8D5C4]/20">
                                <div className="text-sm text-[#8F6B58] font-light mb-1">Ազատ տեղեր</div>
                                <div className="text-3xl font-light text-[#2C2C2C]">
                                    {d.seats.limit ? d.seats.limit - d.seats.active : '∞'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/30">
                            <p className="text-sm text-blue-700 font-light">
                                <AlertCircle size={16} className="inline mr-2" />
                                Աշխատակիցների մանրամասն ցուցակը հասանելի չէ: API-ն չի վերադարձնում users տվյալները:
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}