// src/admin/pages/AdminLogin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { adminService } from '../services/adminApi';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setValidationErrors({});

        try {
            // ✅ Ուղղված - ուղարկում ենք email և password
            const res = await adminService.login(email, password);
            const payload = res.data;

            // Ստուգել պատասխանի կառուցվածքը
            if (payload?.data?.token && payload?.data?.admin) {
                const { token, admin } = payload.data;

                localStorage.setItem("admin_token", token);
                localStorage.setItem("admin", JSON.stringify(admin));

                navigate("/admin/dashboard");
            } else if (payload?.token && payload?.admin) {
                // Alternative response format
                const { token, admin } = payload;

                localStorage.setItem("admin_token", token);
                localStorage.setItem("admin", JSON.stringify(admin));

                navigate("/admin/dashboard");
            } else {
                console.log("Unexpected payload:", payload);
                setError("Սխալ պատասխան սերվերից");
            }
        } catch (err: any) {
            if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                setValidationErrors(errors);

                // Վերցնել առաջին error-ը
                const firstErrorKey = Object.keys(errors)[0];
                const firstError = errors[firstErrorKey]?.[0];
                setError(firstError || 'Վավերացման սխալ');

                console.log('Validation errors:', errors);
            } else {
                setError(err.response?.data?.message || 'Մուտքի սխալ։ Փորձեք կրկին։');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-light text-white mb-2">Ադմինի մուտք</h1>
                        <p className="text-white/60">SmartBook Կառավարում</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-white"
                        >
                            <AlertCircle size={20} />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-white/80 mb-2">Էլ․ փոստ</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl 
                                             text-white placeholder-white/40 focus:outline-none
                                             ${validationErrors.email ? 'border-red-500' : 'border-white/10 focus:border-white/30'}`}
                                    placeholder="admin@smartbook.am"
                                    required
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.email[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-white/80 mb-2">Գաղտնաբառ</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl 
                                             text-white placeholder-white/40 focus:outline-none
                                             ${validationErrors.password ? 'border-red-500' : 'border-white/10 focus:border-white/30'}`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {validationErrors.password && (
                                <p className="mt-1 text-xs text-red-400">{validationErrors.password[0]}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white 
                                     rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50
                                     flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Մուտք...</span>
                                </>
                            ) : (
                                'Մուտք'
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-xs text-white/30 text-center">
                        Demo: super@smartbook.am / password
                    </div>
                </div>
            </motion.div>
        </div>
    );
}