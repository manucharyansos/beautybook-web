// src/admin/components/AdminSidebar.tsx
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Building2,
    Users,
    Shield,
    FileText,
    ChevronLeft,
    ChevronRight, Package,
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export default function AdminSidebar({ isOpen, onToggle }: Props) {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const isSuperAdmin = admin.role === 'super_admin';

    const menuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Վահանակ' },
        { path: '/admin/businesses', icon: Building2, label: 'Բիզնեսներ' },
        { path: '/admin/users', icon: Users, label: 'Օգտատերեր' },
        ...(isSuperAdmin ? [
            { path: '/admin/plans', icon: Package, label: 'Փաթեթներ' }, // Ավելացնել
            { path: '/admin/admins', icon: Shield, label: 'Ադմիններ' },
            { path: '/admin/logs', icon: FileText, label: 'Մատյան' },
        ] : []),
    ];

    return (
        <motion.aside
            initial={{ width: isOpen ? 256 : 80 }}
            animate={{ width: isOpen ? 256 : 80 }}
            className="fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-40"
        >
            <div className="relative h-full flex flex-col">
                {/* Logo */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
                    {isOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-light"
                        >
                            Beauty<span className="text-[#C5A28A]">Book</span>
                        </motion.span>
                    )}
                    <button
                        onClick={onToggle}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                        title={isOpen ? 'Փակել' : 'Բացել'}
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 mx-2 rounded-lg transition
                                ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="ml-3 text-sm"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Version */}
                {isOpen && (
                    <div className="p-4 text-center text-xs text-white/20 border-t border-white/10">
                        Տարբերակ 1.0.0
                    </div>
                )}
            </div>
        </motion.aside>
    );
}