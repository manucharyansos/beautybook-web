import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { cn } from "../lib/cn";

// Premium animations
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
};

export default function Login() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { setAuth } = useAuth();

    const [email, setEmail] = useState("owner@mail.com");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });

            const { token, user } = res.data;

            setAuth(token, user);
            queryClient.clear();

            const next = user.needs_onboarding
                ? "/app/onboarding"
                : "/app/dashboard";

            navigate(next, { replace: true });
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                err?.response?.data?.errors?.email?.[0] ??
                "Մուտքի սխալ"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDFAF7] to-[#FAF4ED] flex items-center justify-center p-4 relative">
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

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2
                         bg-white/80 backdrop-blur-sm rounded-full border border-[#E8D5C4]/30
                         text-[#8F6B58] hover:text-[#C5A28A] hover:border-[#C5A28A]/50
                         transition-all duration-300 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-light">Հետ</span>
            </motion.button>

            <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="show"
                className="w-full max-w-md relative"
            >
                {/* Logo/Brand */}
                <motion.div
                    variants={fadeUp}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-light tracking-tight">
                            Beauty<span className="text-[#C5A28A]">Book</span>
                        </h1>
                    </Link>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    variants={scaleIn}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8
                             border border-[#E8D5C4]/30 shadow-2xl shadow-black/5"
                >
                    <motion.div variants={fadeUp} className="text-center mb-8">
                        <h2 className="text-2xl font-light text-[#2C2C2C]">Մուտք</h2>
                        <p className="text-sm text-[#8F6B58] font-light mt-2">
                            Մուտք գործեք Ձեր հաշիվ
                        </p>
                    </motion.div>

                    <form onSubmit={submit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50
                                         border border-red-200 text-sm text-red-600 font-light"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Email Field */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Էլ. փոստ
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl
                                             border border-[#E8D5C4]/30 bg-white
                                             focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                             transition-all duration-300 outline-none font-light"
                                    placeholder="owner@mail.com"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                Գաղտնաբառ
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl
                                             border border-[#E8D5C4]/30 bg-white
                                             focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                             transition-all duration-300 outline-none font-light"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F6B58]
                                             hover:text-[#C5A28A] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Forgot Password */}
                        <motion.div variants={fadeUp} className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-xs text-[#8F6B58] hover:text-[#C5A28A]
                                         transition-colors font-light"
                            >
                                Մոռացե՞լ եք գաղտնաբառը
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={fadeUp}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className={cn(
                                "w-full py-4 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]",
                                "text-white font-light tracking-wide relative overflow-hidden",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "transition-all duration-300 hover:shadow-lg"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Մուտք գործել...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        <span>Մուտք գործել</span>
                                    </>
                                )}
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[#B88E72] to-[#C5A28A]"
                                initial={{ x: "100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.button>

                        {/* Register Link */}
                        <motion.div variants={fadeUp} className="text-center pt-4">
                            <p className="text-sm text-[#8F6B58] font-light">
                                Դեռ հաշիվ չունե՞ք{" "}
                                <Link
                                    to="/register"
                                    className="text-[#C5A28A] hover:text-[#B88E72]
                                             transition-colors font-light underline-offset-2 hover:underline"
                                >
                                    Գրանցվել
                                </Link>
                            </p>

                            <p className="mt-2 text-sm text-[#8F6B58] font-light">
                                <Link
                                    to="/forgot-password"
                                    className="text-[#C5A28A] hover:text-[#B88E72] transition-colors font-light underline-offset-2 hover:underline"
                                >
                                    Մոռացե՞լ եք գաղտնաբառը
                                </Link>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>

                {/* Demo Credentials */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 rounded-xl bg-white/30 backdrop-blur-sm
                             border border-[#E8D5C4]/20 text-center"
                >
                    <p className="text-xs text-[#8F6B58] font-light">
                        Demo: owner@mail.com / password
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}