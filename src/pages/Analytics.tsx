import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    TrendingUp,
    CalendarDays,
    Users,
    DollarSign,
    BarChart3,
    PieChart,
    Award,
    Loader2
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Legend
} from "recharts";
import { Card } from "../components/ui/Card";
import { fetchAnalyticsOverview, fetchRevenue, fetchServiceStats, fetchStaffStats } from "../lib/analyticsApi";
import { cn } from "../lib/cn";
import { page } from "../lib/motion";

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

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-[#E8D5C4]/30 shadow-lg">
                <p className="text-sm text-[#2C2C2C] font-light">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs text-[#8F6B58] font-light">
                        {entry.name === 'bookings' ? 'Ամրագրումներ' :
                            entry.name === 'revenue' ? 'Եկամուտ' : entry.name}: {entry.value.toLocaleString()}
                        {entry.name === 'revenue' ? ' դր' : ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Stat Card Component
function StatCard({
                      icon: Icon,
                      label,
                      value,
                      subValue,
                      trend,
                      gradient = "from-[#C5A28A]/10 to-[#B88E72]/10"
                  }: {
    icon: any;
    label: string;
    value: string | number;
    subValue?: string;
    trend?: number;
    gradient?: string;
}) {
    return (
        <motion.div variants={fadeUp} className="relative">
            <Card className="relative p-6 overflow-hidden border border-[#E8D5C4]/30
                           hover:border-[#C5A28A]/50 transition-all duration-700 bg-white/80 backdrop-blur-sm">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", gradient)} />

                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm text-[#8F6B58] font-light mb-2">{label}</div>
                            <div className="text-3xl font-light text-[#2C2C2C]">{value}</div>
                            {subValue && (
                                <div className="text-xs text-[#8F6B58] font-light mt-2">{subValue}</div>
                            )}
                            {trend !== undefined && (
                                <div className="mt-2 flex items-center gap-1">
                                    <span className={cn(
                                        "text-xs",
                                        trend >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                        {trend >= 0 ? '+' : ''}{trend}%
                                    </span>
                                    <span className="text-xs text-[#8F6B58] font-light">նախորդ շրջանից</span>
                                </div>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                      flex items-center justify-center text-white shadow-lg shadow-[#C5A28A]/20">
                            <Icon size={22} />
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// Chart Card Component
function ChartCard({
                       title,
                       icon: Icon,
                       children,
                       className
                   }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div variants={scaleIn}>
            <Card className={cn(
                "p-6 border border-[#E8D5C4]/30 rounded-xl bg-white/80 backdrop-blur-sm",
                className
            )}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                  flex items-center justify-center">
                        <Icon size={18} className="text-[#C5A28A]" />
                    </div>
                    <h3 className="text-lg font-light text-[#2C2C2C]">{title}</h3>
                </div>
                {children}
            </Card>
        </motion.div>
    );
}

// Loading State
function LoadingState() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] flex items-center justify-center">
            <div className="text-center">
                <Loader2 size={48} className="animate-spin text-[#C5A28A] mx-auto mb-4" />
                <p className="text-[#8F6B58] font-light">Բեռնում է վիճակագրությունը...</p>
            </div>
        </div>
    );
}

// Error State
function ErrorState({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] flex items-center justify-center">
            <Card className="p-8 max-w-md border border-red-200 bg-red-50/50">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <TrendingUp size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-light text-[#2C2C2C] mb-2">Վիճակագրությունը հասանելի չէ</h3>
                    <p className="text-sm text-[#8F6B58] font-light">{message}</p>
                </div>
            </Card>
        </div>
    );
}

export default function Analytics() {
    const overviewQ = useQuery({
        queryKey: ["analytics", "overview"],
        queryFn: fetchAnalyticsOverview,
        staleTime: 5 * 60 * 1000
    });

    const revenueQ = useQuery({
        queryKey: ["analytics", "revenue", 12],
        queryFn: () => fetchRevenue(12),
        staleTime: 5 * 60 * 1000
    });

    const servicesQ = useQuery({
        queryKey: ["analytics", "services"],
        queryFn: fetchServiceStats,
        staleTime: 5 * 60 * 1000
    });

    const staffQ = useQuery({
        queryKey: ["analytics", "staff"],
        queryFn: fetchStaffStats,
        staleTime: 5 * 60 * 1000
    });

    if (overviewQ.isLoading || revenueQ.isLoading || servicesQ.isLoading || staffQ.isLoading) {
        return <LoadingState />;
    }

    if (overviewQ.isError || revenueQ.isError || servicesQ.isError || staffQ.isError) {
        return <ErrorState message="Փորձեք մի փոքր ուշ կրկին" />;
    }

    const o = overviewQ.data!;
    const revenue = revenueQ.data!;
    const services = servicesQ.data!;
    const staff = staffQ.data!;

    // Format revenue data for chart
    const revenueChartData = revenue.months.map(m => ({
        name: m.year_month,
        revenue: m.revenue,
        bookings: m.bookings
    }));

    // ✅ FIXED: Use actual service names from backend
    const servicesChartData = services.top.map(s => ({
        name: s.service_name,
        service_name: s.service_name,
        bookings: s.bookings,
        revenue: s.revenue
    }));

    // ✅ FIXED: Use actual staff names from backend
    const staffChartData = staff.rows.map(s => ({
        name: s.staff_name,
        staff_name: s.staff_name,
        bookings: s.bookings,
        revenue: s.revenue
    }));

    // Calculate trends
    const todayVsYesterday = o.trend.length >= 2
        ? ((o.trend[o.trend.length - 1].bookings - o.trend[o.trend.length - 2].bookings) / o.trend[o.trend.length - 2].bookings * 100).toFixed(1)
        : 0;

    return (
        <motion.div
            {...page}
            className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] p-6"
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                  flex items-center justify-center shadow-lg shadow-[#C5A28A]/20">
                        <BarChart3 size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-light text-[#2C2C2C]">Վիճակագրություն</h1>
                        <p className="text-sm text-[#8F6B58] font-light mt-1">
                            Ձեր սրահի ցուցանիշները և վերլուծությունները
                        </p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <StatCard
                        icon={CalendarDays}
                        label="Այսօրվա ամրագրումներ"
                        value={o.today.bookings}
                        subValue={`${o.currency} ${o.today.revenue.toLocaleString()} եկամուտ`}
                        trend={Number(todayVsYesterday)}
                        gradient="from-blue-500/10 to-cyan-500/10"
                    />

                    <StatCard
                        icon={TrendingUp}
                        label="7 օրվա ամրագրումներ"
                        value={o.last_7_days.bookings}
                        subValue={`${o.currency} ${o.last_7_days.revenue.toLocaleString()} եկամուտ`}
                        gradient="from-green-500/10 to-emerald-500/10"
                    />

                    <StatCard
                        icon={DollarSign}
                        label="Միջին եկամուտ"
                        value={o.last_7_days.bookings > 0
                            ? `${o.currency} ${Math.round(o.last_7_days.revenue / o.last_7_days.bookings).toLocaleString()}`
                            : `${o.currency} 0`
                        }
                        subValue="մեկ ամրագրման համար"
                        gradient="from-purple-500/10 to-pink-500/10"
                    />

                    <StatCard
                        icon={Award}
                        label="Օրական միջին"
                        value={Math.round(o.last_7_days.bookings / 7)}
                        subValue="ամրագրումներ օրական"
                        gradient="from-amber-500/10 to-orange-500/10"
                    />
                </motion.div>

                {/* Charts Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Revenue Chart */}
                    <ChartCard title="Եկամուտների դինամիկա" icon={TrendingUp}>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ color: '#8F6B58', fontSize: 12 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#C5A28A"
                                        strokeWidth={2}
                                        dot={{ fill: '#C5A28A', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: '#B88E72' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bookings"
                                        stroke="#B88E72"
                                        strokeWidth={2}
                                        dot={{ fill: '#B88E72', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: '#8F6B58' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    {/* Trend Chart */}
                    <ChartCard title="Օրական ամրագրումներ (7 օր)" icon={BarChart3}>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={o.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="bookings"
                                        fill="url(#colorGradient)"
                                        radius={[4, 4, 0, 0]}
                                        name="Ամրագրումներ"
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#C5A28A" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="#B88E72" stopOpacity={0.4}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </motion.div>

                {/* Second Row - Service & Staff Performance */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Services Chart */}
                    <ChartCard title="Ծառայությունների վարկանիշ" icon={PieChart}>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={servicesChartData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    layout="horizontal"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="bookings"
                                        fill="#C5A28A"
                                        radius={[4, 4, 0, 0]}
                                        name="Ամրագրումներ"
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="revenue"
                                        fill="#B88E72"
                                        radius={[4, 4, 0, 0]}
                                        name="Եկամուտ (դր)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {services.top.length === 0 && (
                            <p className="text-center text-[#8F6B58] font-light py-8">
                                Տվյալներ չկան այս ժամանակահատվածում
                            </p>
                        )}
                    </ChartCard>

                    {/* Staff Chart */}
                    <ChartCard title="Աշխատակիցների արդյունավետություն" icon={Users}>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={staffChartData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    layout="horizontal"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fill: '#8F6B58', fontSize: 12 }}
                                        axisLine={{ stroke: '#E8D5C4' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="bookings"
                                        fill="#C5A28A"
                                        radius={[4, 4, 0, 0]}
                                        name="Ամրագրումներ"
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="revenue"
                                        fill="#B88E72"
                                        radius={[4, 4, 0, 0]}
                                        name="Եկամուտ (դր)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {staff.rows.length === 0 && (
                            <p className="text-center text-[#8F6B58] font-light py-8">
                                Տվյալներ չկան այս ժամանակահատվածում
                            </p>
                        )}
                    </ChartCard>
                </motion.div>
            </div>
        </motion.div>
    );
}