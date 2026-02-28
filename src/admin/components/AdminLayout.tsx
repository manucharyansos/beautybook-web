
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useState } from 'react';
import { Menu, LogOut, User } from 'lucide-react';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Menu size={20} className="text-gray-600" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                    <div className="text-xs text-gray-500">{admin.role}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                              flex items-center justify-center text-white">
                                    <User size={20} />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}