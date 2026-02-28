import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    FileText,
    Search,
    User,
    Clock,
    ChevronDown,
    Download,
    AlertCircle
} from 'lucide-react';
import { adminLogsApi } from '../services/adminLogsApi';
import { cn } from '@/lib/cn';

interface AdminLog {
    id: number;
    admin_id: number;
    admin?: {
        id: number;
        name: string;
        email: string;
    };
    action: string;
    model_type?: string;
    model_id?: number;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

interface PaginatedResponse {
    current_page: number;
    data: AdminLog[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface ApiResponse {
    data: PaginatedResponse;
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
    };
}

export default function AdminLogs() {
    const [search, setSearch] = useState('');
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [page] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'logs', search, page],
        queryFn: async () => {
            const res = await adminLogsApi.list({
                search: search || undefined,
                page: page,
                per_page: 50,
            });
            return res.data as ApiResponse;
        },
    });

    // Debug: log the response
    console.log('Logs API response:', data);

    // Extract logs from response
    const pagination = data?.data;
    const logs = pagination?.data || [];

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'text-green-600 bg-green-50';
        if (action.includes('update')) return 'text-blue-600 bg-blue-50';
        if (action.includes('delete')) return 'text-red-600 bg-red-50';
        if (action.includes('login')) return 'text-purple-600 bg-purple-50';
        return 'text-gray-600 bg-gray-50';
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return '—';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
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
                    <span>Չհաջողվեց բեռնել գործողությունների մատյանը</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light text-gray-900">Գործողությունների մատյան</h1>
                    <p className="text-sm text-gray-500 mt-1">Ադմինների կատարած գործողությունները</p>
                </div>

                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                    <Download size={18} className="text-gray-600" />
                    <span>Ներբեռնել</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Որոնել գործողություններ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                    />
                </div>
            </div>

            {/* Logs */}
            <div className="space-y-3">
                {logs.map((log: AdminLog) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div
                            className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50"
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        getActionColor(log.action)
                                    )}>
                                        {log.action}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(log.created_at).toLocaleString('hy-AM')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <User size={14} />
                                        <span>{log.admin?.name || 'Unknown'}</span>
                                    </div>
                                    {log.model_type && (
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <FileText size={14} />
                                            <span>{log.model_type.split('\\').pop()}</span>
                                            {log.model_id && <span> #{log.model_id}</span>}
                                        </div>
                                    )}
                                    {log.ip_address && (
                                        <div className="text-xs text-gray-400">
                                            IP: {log.ip_address}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ChevronDown
                                size={18}
                                className={cn(
                                    "text-gray-400 transition-transform",
                                    expandedLog === log.id && "rotate-180"
                                )}
                            />
                        </div>

                        {expandedLog === log.id && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                className="border-t border-gray-100 bg-gray-50 p-4"
                            >
                                <div className="space-y-3">
                                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-500 mb-2">Հին արժեքներ</h4>
                                            <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto">
                                                {formatValue(log.old_values)}
                                            </pre>
                                        </div>
                                    )}

                                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-500 mb-2">Նոր արժեքներ</h4>
                                            <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto">
                                                {formatValue(log.new_values)}
                                            </pre>
                                        </div>
                                    )}

                                    {log.user_agent && (
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">User Agent:</span> {log.user_agent}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}

                {logs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Գործողություններ չեն գտնվել</p>
                    </div>
                )}
            </div>
        </div>
    );
}