// src/admin/pages/AdminBusinesses.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    Search,
    MoreHorizontal,
    Users,
    CalendarCheck,
    DollarSign,
    Plus,
    Download,
    Sparkles,
    Award,
    AlertCircle
} from 'lucide-react';
import { adminBusinessesApi } from '../services/adminBusinessesApi';

interface Business {
    id: number;
    name: string;
    slug: string;
    business_type: 'beauty' | 'dental';
    status: 'active' | 'suspended' | 'pending';
    users_count?: number;
    bookings_count?: number;
    total_revenue?: number;
    created_at: string;
}

interface PaginatedResponse {
    current_page: number;
    data: Business[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface ApiResponse {
    success: boolean;
    data: PaginatedResponse;
}

export default function AdminBusinesses() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'businesses', search, statusFilter, typeFilter, page],
        queryFn: async () => {
            const res = await adminBusinessesApi.list({
                search: search || undefined,
                status: statusFilter || undefined,
                business_type: typeFilter || undefined,
                page: page,
                per_page: 20,
            });
            return res.data as ApiResponse;
        },
    });

    // Debug: log the response
    console.log('Businesses API response:', data);

    // Extract businesses array from paginated response
    const businesses = data?.data?.data || [];
    const pagination = data?.data;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Ակտիվ</span>;
            case 'suspended':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Կասեցված</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Սպասման մեջ</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        return type === 'beauty'
            ? <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
                <Sparkles size={12} /> Beauty
            </span>
            : <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
                <Award size={12} /> Dental
            </span>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Չհաջողվեց բեռնել բիզնեսների ցուցակը</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light text-gray-900">Բիզնեսներ</h1>
                    <p className="text-sm text-gray-500 mt-1">Բոլոր գրանցված սրահները և կլինիկաները</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-[#C5A28A] text-white rounded-lg hover:bg-[#B88E72] transition flex items-center gap-2">
                        <Plus size={18} />
                        <span>Նոր բիզնես</span>
                    </button>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Download size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Որոնել բիզնեսներ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                    >
                        <option value="">Բոլոր կարգավիճակները</option>
                        <option value="active">Ակտիվ</option>
                        <option value="suspended">Կասեցված</option>
                        <option value="pending">Սպասման մեջ</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                    >
                        <option value="">Բոլոր տեսակները</option>
                        <option value="beauty">✨ Beauty</option>
                        <option value="dental">🦷 Dental</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Բիզնես</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Տեսակ</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Կարգավիճակ</th>
                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Աշխատակիցներ</th>
                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Ամրագրումներ</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Եկամուտ</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Գործողություններ</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {Array.isArray(businesses) && businesses.map((business: Business, index: number) => (
                            <motion.tr
                                key={business.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="hover:bg-gray-50 cursor-pointer transition"
                                onClick={() => navigate(`/admin/businesses/${business.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                                              flex items-center justify-center">
                                            <Building2 size={20} className="text-[#C5A28A]" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{business.name}</div>
                                            <div className="text-xs text-gray-500">{business.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getTypeBadge(business.business_type)}</td>
                                <td className="px-6 py-4">{getStatusBadge(business.status)}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Users size={14} className="text-gray-400" />
                                        <span>{business.users_count || 0}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <CalendarCheck size={14} className="text-gray-400" />
                                        <span>{business.bookings_count || 0}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <DollarSign size={14} className="text-gray-400" />
                                        <span>{(business.total_revenue || 0).toLocaleString()} ֏</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <MoreHorizontal size={18} className="text-gray-500" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {(!Array.isArray(businesses) || businesses.length === 0) && (
                    <div className="text-center py-12">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Բիզնեսներ չեն գտնվել</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Ցուցադրվում է {pagination.from} - {pagination.to} ընդհանուր {pagination.total}-ից
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Նախորդ
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Էջ {page} / {pagination.last_page}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Հաջորդ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}