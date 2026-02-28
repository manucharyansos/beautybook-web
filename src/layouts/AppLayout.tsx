import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    CalendarDays,
    LogOut,
    Menu,
    Scissors,
    Users,
    LayoutDashboard,
    Settings,
    ChevronRight,
    Sparkles,
    X,
    Award,
} from "lucide-react";

import { cn } from "../lib/cn";
import { useAuth } from "../store/auth";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
    { to: "/app/dashboard", label: "Վահանակ", icon: LayoutDashboard, color: "from-blue-500/20 to-cyan-500/20" },
    { to: "/app/calendar", label: "Օրացույց", icon: CalendarDays, color: "from-purple-500/20 to-pink-500/20" },
    { to: "/app/services", label: "Ծառայություններ", icon: Scissors, color: "from-green-500/20 to-emerald-500/20" },
    { to: "/app/staff", label: "Աշխատակիցներ", icon: Users, color: "from-amber-500/20 to-orange-500/20" },
    { to: "/app/analytics", label: "Վերլուծություն", icon: BarChart3, color: "from-red-500/20 to-rose-500/20" },
    { to: "/app/settings", label: "Կարգավորումներ", icon: Settings, color: "from-gray-500/20 to-slate-500/20" },
];

// Premium animations
const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", damping: 25, stiffness: 200 }
    },
    exit: {
        x: -320,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
};

export function AppLayout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, clear } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Track scroll for header effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    function handleLogout() {
        clear();
        // Clear persisted auth storage if exists
        useAuth.persist?.clearStorage?.();
        // Clear all queries
        queryClient.clear();
        navigate("/", { replace: true });
    }

    // Get user role display name
    const getRoleDisplay = () => {
        switch (user?.role) {
            case "owner": return "Սրահի սեփականատեր";
            case "manager": return "Կառավարիչ";
            case "staff": return "Աշխատակից";
            case "super_admin": return "Սուպեր ադմին";
            default: return user?.role ?? "";
        }
    };

    // @ts-ignore
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED]">
            {/* Topbar */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={cn(
                    "sticky top-0 z-30 transition-all duration-300",
                    isScrolled
                        ? "bg-white/90 backdrop-blur-xl border-b border-[#E8D5C4]/30 shadow-sm"
                        : "bg-white/70 backdrop-blur-md border-b border-[#E8D5C4]/20"
                )}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Left side */}
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="md:hidden inline-flex items-center justify-center rounded-xl
                                         border border-[#E8D5C4]/30 bg-white/80 px-3 py-2.5
                                         hover:border-[#C5A28A]/50 hover:bg-white
                                         transition-all duration-300"
                                onClick={() => setIsMobileMenuOpen(true)}
                                aria-label="Բացել մենյուն"
                            >
                                <Menu size={20} className="text-[#8F6B58]" />
                            </motion.button>

                            {/* Logo */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate("/app/dashboard")}
                            >
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                              text-white grid place-items-center font-light text-xl
                                              shadow-lg shadow-[#C5A28A]/20">
                                    B
                                </div>
                                <div className="hidden sm:block">
                                    <div className="font-light text-lg tracking-tight text-[#2C2C2C]">
                                        Beauty<span className="text-[#C5A28A]">Book</span>
                                    </div>
                                    <div className="text-xs text-[#8F6B58] font-light">
                                        {user?.business_name || 'Բիզնեսի կառավարում'}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4">
                            {/* Business type badge */}
                            {user?.business_type && (
                                <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C5A28A]/10 border border-[#C5A28A]/20">
                                    {user.business_type === 'beauty' ? (
                                        <>
                                            <Sparkles size={14} className="text-[#C5A28A]" />
                                            <span className="text-xs text-[#8F6B58]">Beauty</span>
                                        </>
                                    ) : (
                                        <>
                                            <Award size={14} className="text-[#C5A28A]" />
                                            <span className="text-xs text-[#8F6B58]">Dental</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* User info */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="hidden sm:block text-right"
                            >
                                <div className="text-sm font-light text-[#2C2C2C]">{user?.name || "—"}</div>
                                <div className="text-xs text-[#8F6B58] font-light flex items-center gap-1 justify-end">
                                    <Sparkles size={12} className="text-[#C5A28A]" />
                                    {getRoleDisplay()}
                                </div>
                            </motion.div>

                            {/* Logout button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#E8D5C4]/30
                                         bg-white/80 px-4 py-2.5 text-sm font-light text-[#8F6B58]
                                         hover:border-[#C5A28A]/50 hover:bg-white hover:text-[#C5A28A]
                                         transition-all duration-300"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Ելք</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                    {/* Desktop sidebar */}
                    <aside className="hidden md:block">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-28 space-y-4"
                        >
                            {/* Navigation */}
                            <div className="rounded-2xl border border-[#E8D5C4]/30 bg-white/80 backdrop-blur-sm
                                          p-4 shadow-lg shadow-black/5">
                                <div className="text-xs text-[#8F6B58] font-light tracking-wide mb-3 px-2">
                                    ՆԱՎԻԳԱՑԻԱ
                                </div>
                                <nav className="space-y-1">
                                    {navItems.map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            className={({ isActive }) => cn(
                                                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                                                "text-sm font-light transition-all duration-300 overflow-hidden",
                                                isActive
                                                    ? "text-white"
                                                    : "text-[#2C2C2C] hover:text-[#8F6B58]"
                                            )}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {/* Background gradient for active item */}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeNav"
                                                            className={cn(
                                                                "absolute inset-0 bg-gradient-to-r",
                                                                item.color,
                                                                "rounded-xl"
                                                            )}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    )}

                                                    {/* Icon */}
                                                    <span className="relative z-10">
                                                        <item.icon size={18} className={cn(
                                                            "transition-colors duration-300",
                                                            isActive ? "text-white" : "text-[#8F6B58] group-hover:text-[#C5A28A]"
                                                        )} />
                                                    </span>

                                                    {/* Label */}
                                                    <span className="relative z-10 flex-1">{item.label}</span>

                                                    {/* Active indicator arrow */}
                                                    {isActive && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="relative z-10"
                                                        >
                                                            <ChevronRight size={16} className="text-white" />
                                                        </motion.div>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>

                            {/* Tip card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-2xl border border-[#E8D5C4]/30 bg-gradient-to-br
                                          from-[#F9F5F0] to-[#F0E7DD] p-4 shadow-lg"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                                  flex items-center justify-center">
                                        <Sparkles size={16} className="text-[#C5A28A]" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-light text-[#2C2C2C] mb-1">Հուշում</div>
                                        <div className="text-xs text-[#8F6B58] font-light leading-relaxed">
                                            Սկսեք ծառայություններից, հետո ավելացրեք աշխատակիցներ, ապա ամրագրումներ։
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </aside>

                    {/* Mobile drawer */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />

                                {/* Drawer */}
                                <motion.div
                                    variants={sidebarVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="md:hidden fixed left-0 top-0 z-50 h-full w-[300px]
                                             bg-white border-r border-[#E8D5C4]/30 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-[#E8D5C4]/20">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                                          text-white grid place-items-center text-sm">
                                                B
                                            </div>
                                            <span className="font-light text-[#2C2C2C]">Մենյու</span>
                                        </div>
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-8 h-8 rounded-lg border border-[#E8D5C4]/30
                                                     flex items-center justify-center hover:bg-[#F9F5F0]
                                                     transition-colors"
                                        >
                                            <X size={16} className="text-[#8F6B58]" />
                                        </button>
                                    </div>

                                    {/* Business type in mobile menu */}
                                    {user?.business_type && (
                                        <div className="px-4 py-3 border-b border-[#E8D5C4]/20">
                                            <div className="flex items-center gap-2">
                                                {user.business_type === 'beauty' ? (
                                                    <Sparkles size={16} className="text-[#C5A28A]" />
                                                ) : (
                                                    <Award size={16} className="text-[#C5A28A]" />
                                                )}
                                                <span className="text-sm font-light text-[#2C2C2C]">
                                                    {user.business_type === 'beauty' ? 'Beauty Salon' : 'Dental Clinic'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <nav className="p-4 space-y-1">
                                        {navItems.map((item) => (
                                            <NavLink
                                                key={item.to}
                                                to={item.to}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={({ isActive }) => cn(
                                                    "flex items-center gap-3 rounded-xl px-3 py-3",
                                                    "text-sm font-light transition-all duration-300",
                                                    isActive
                                                        ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white"
                                                        : "text-[#2C2C2C] hover:bg-[#F9F5F0]"
                                                )}
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </NavLink>
                                        ))}
                                    </nav>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full inline-flex items-center justify-center gap-2 
                                                     rounded-xl border border-[#E8D5C4]/30 bg-white/80 
                                                     px-4 py-3 text-sm font-light text-[#8F6B58]
                                                     hover:border-[#C5A28A]/50 hover:bg-white hover:text-[#C5A28A]
                                                     transition-all duration-300"
                                        >
                                            <LogOut size={16} />
                                            Ելք
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Content */}
                    <motion.main
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        className="min-w-0"
                    >
                        <Outlet />
                    </motion.main>
                </div>
            </div>
        </div>
    );
}