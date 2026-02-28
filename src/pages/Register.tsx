import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft, Mail, Lock, User, Phone, MapPin, Store,
    Eye, EyeOff, UserPlus, Sparkles, Award, Check, AlertCircle
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { cn } from "../lib/cn";
import { getDeviceFingerprint } from "../lib/fingerprint";

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
        transition: { staggerChildren: 0.1 }
    }
};

type BusinessType = 'salon' | 'clinic';

export default function Register() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [searchParams] = useSearchParams();
    const businessType = (searchParams.get('type') as BusinessType) || 'salon';

    // Business fields
    const [business_name, setBusinessName] = useState("");
    const [business_phone, setBusinessPhone] = useState("");
    const [business_address, setBusinessAddress] = useState("");
    const [business_type, setBusinessType] = useState<BusinessType>(businessType);

    // Owner fields
    const [owner_name, setOwnerName] = useState("");
    const [owner_email, setOwnerEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

    // Password strength checker
    useEffect(() => {
        if (password.length === 0) {
            setPasswordStrength(null);
            return;
        }

        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const length = password.length;

        let strength = 0;
        if (length >= 8) strength += 1;
        if (hasUpper) strength += 1;
        if (hasLower) strength += 1;
        if (hasNumber) strength += 1;
        if (hasSpecial) strength += 1;

        if (strength <= 2) setPasswordStrength('weak');
        else if (strength <= 4) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    }, [password]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validate password match
        if (password !== password_confirmation) {
            setError("Գաղտնաբառերը չեն համընկնում");
            setLoading(false);
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            setError("Գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ");
            setLoading(false);
            return;
        }

        // Business phone is required (anti-abuse trial policy)
        if (!business_phone.trim()) {
            setError("Հեռախոսահամարը պարտադիր է");
            setLoading(false);
            return;
        }

        try {
            const fp = getDeviceFingerprint();

            const res = await api.post("/auth/register", {
                business_name,
                business_phone,
                business_address: business_address || null,
                business_type,
                name: owner_name,
                email: owner_email,
                password,
                password_confirmation,
            }, {
                headers: { "X-Device-Fingerprint": fp },
            });

            setAuth(res.data.token, res.data.user);
            navigate("/app/dashboard");
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Գրանցման սխալ";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const nextStep = () => setCurrentStep(2);
    const prevStep = () => setCurrentStep(1);

    // Business type specific texts
    const businessText = {
        salon: {
            name: 'Սրահ',
            title: 'Գեղեցկության սրահ',
            icon: Sparkles,
            placeholder: 'e.g. Beauty Salon',
            color: 'from-[#C5A28A] to-[#B88E72]'
        },
        clinic: {
            name: 'Կլինիկա',
            title: 'Դենտալ կլինիկա',
            icon: Award,
            placeholder: 'e.g. Dental Clinic',
            color: 'from-[#8F6B58] to-[#C5A28A]'
        }
    };

    const currentBusiness = businessText[business_type];

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
                className="w-full max-w-2xl relative"
            >
                {/* Logo/Brand with Business Type */}
                <motion.div variants={fadeUp} className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-light tracking-tight">
                            Beauty<span className="text-[#C5A28A]">Book</span>
                        </h1>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${currentBusiness.color} bg-opacity-10 border border-[#C5A28A]/20`}>
                            <currentBusiness.icon size={14} className="text-[#C5A28A]" />
                            <span className="text-xs text-[#8F6B58]">{currentBusiness.title}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Register Card */}
                <motion.div
                    variants={scaleIn}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8
                             border border-[#E8D5C4]/30 shadow-2xl shadow-black/5"
                >
                    <motion.div variants={fadeUp} className="text-center mb-8">
                        <h2 className="text-2xl font-light text-[#2C2C2C]">Ստեղծել հաշիվ</h2>
                        <p className="text-sm text-[#8F6B58] font-light mt-2">
                            {business_type === 'salon'
                                ? 'Գրանցվեք և սկսեք կառավարել Ձեր սրահը'
                                : 'Գրանցվեք և սկսեք կառավարել Ձեր կլինիկան'}
                        </p>
                    </motion.div>

                    {/* Business Type Selector (if not from URL) */}
                    {!searchParams.get('type') && (
                        <motion.div variants={fadeUp} className="mb-8">
                            <label className="block text-sm text-[#2C2C2C] font-light mb-3">
                                Ընտրեք բիզնեսի տեսակը
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBusinessType('salon')}
                                    className={cn(
                                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                        business_type === 'salon'
                                            ? 'border-[#C5A28A] bg-[#C5A28A]/5'
                                            : 'border-[#E8D5C4]/30 hover:border-[#C5A28A]/50'
                                    )}
                                >
                                    <Sparkles size={18} className={business_type === 'salon' ? 'text-[#C5A28A]' : 'text-[#8F6B58]'} />
                                    <span className="text-sm font-light">Beauty</span>
                                    {business_type === 'salon' && <Check size={16} className="ml-auto text-[#C5A28A]" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBusinessType('clinic')}
                                    className={cn(
                                        "flex items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                        business_type === 'clinic'
                                            ? 'border-[#C5A28A] bg-[#C5A28A]/5'
                                            : 'border-[#E8D5C4]/30 hover:border-[#C5A28A]/50'
                                    )}
                                >
                                    <Award size={18} className={business_type === 'clinic' ? 'text-[#C5A28A]' : 'text-[#8F6B58]'} />
                                    <span className="text-sm font-light">Dental</span>
                                    {business_type === 'clinic' && <Check size={16} className="ml-auto text-[#C5A28A]" />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step Indicator */}
                    <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-8">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                            currentStep >= 1
                                ? `bg-gradient-to-r ${currentBusiness.color} text-white`
                                : "bg-gray-100 text-gray-400"
                        )}>
                            1
                        </div>
                        <div className={cn(
                            "w-16 h-px transition-all duration-300",
                            currentStep >= 2 ? `bg-[#C5A28A]` : "bg-gray-200"
                        )} />
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                            currentStep >= 2
                                ? `bg-gradient-to-r ${currentBusiness.color} text-white`
                                : "bg-gray-100 text-gray-400"
                        )}>
                            2
                        </div>
                    </motion.div>

                    <form onSubmit={submit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50
                                         border border-red-200 text-sm text-red-600 font-light flex items-start gap-2"
                            >
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Step 1: Business Info */}
                        {currentStep === 1 && (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        {business_type === 'salon' ? 'Սրահի անուն' : 'Կլինիկայի անուն'} *
                                    </label>
                                    <div className="relative">
                                        <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            value={business_name}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder={business_type === 'salon' ? "My Beauty Salon" : "My Dental Clinic"}
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Հեռախոս
                                    </label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            value={business_phone}
                                            onChange={(e) => setBusinessPhone(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="+374 77 123456"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Հասցե
                                    </label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            value={business_address}
                                            onChange={(e) => setBusinessAddress(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="Երևան, Հայաստան"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="pt-4">
                                    <motion.button
                                        type="button"
                                        onClick={nextStep}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "w-full py-4 rounded-xl bg-gradient-to-r",
                                            currentBusiness.color,
                                            "text-white font-light tracking-wide relative overflow-hidden",
                                            "transition-all duration-300 hover:shadow-lg"
                                        )}
                                        disabled={!business_name}
                                    >
                                        <span className="relative z-10">Շարունակել</span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-[#B88E72] to-[#C5A28A]"
                                            initial={{ x: "100%" }}
                                            whileHover={{ x: 0 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 2: Owner Info */}
                        {currentStep === 2 && (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        {business_type === 'salon' ? 'Սեփականատիրոջ' : 'Պատասխանատուի'} անուն *
                                    </label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            value={owner_name}
                                            onChange={(e) => setOwnerName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="Անուն Ազգանուն"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Էլ. փոստ *
                                    </label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            type="email"
                                            value={owner_email}
                                            onChange={(e) => setOwnerEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="owner@example.com"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Գաղտնաբառ *
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

                                    {/* Password Strength Indicator */}
                                    {passwordStrength && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 h-1">
                                                <div className={cn(
                                                    "flex-1 h-full rounded-l-full transition-all",
                                                    passwordStrength === 'weak' && 'bg-red-400',
                                                    passwordStrength === 'medium' && 'bg-yellow-400',
                                                    passwordStrength === 'strong' && 'bg-green-400'
                                                )} />
                                                <div className={cn(
                                                    "flex-1 h-full transition-all",
                                                    passwordStrength === 'medium' && 'bg-yellow-400',
                                                    passwordStrength === 'strong' && 'bg-green-400'
                                                )} />
                                                <div className={cn(
                                                    "flex-1 h-full rounded-r-full transition-all",
                                                    passwordStrength === 'strong' && 'bg-green-400'
                                                )} />
                                            </div>
                                            <p className={cn(
                                                "text-xs mt-1",
                                                passwordStrength === 'weak' && 'text-red-500',
                                                passwordStrength === 'medium' && 'text-yellow-600',
                                                passwordStrength === 'strong' && 'text-green-600'
                                            )}>
                                                {passwordStrength === 'weak' && 'Թույլ գաղտնաբառ'}
                                                {passwordStrength === 'medium' && 'Միջին գաղտնաբառ'}
                                                {passwordStrength === 'strong' && 'Ուժեղ գաղտնաբառ'}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div variants={fadeUp}>
                                    <label className="block text-sm text-[#2C2C2C] font-light mb-2">
                                        Հաստատել գաղտնաբառը *
                                    </label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F6B58]" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={password_confirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3 rounded-xl
                                                     border border-[#E8D5C4]/30 bg-white
                                                     focus:border-[#C5A28A] focus:ring-1 focus:ring-[#C5A28A]/30
                                                     transition-all duration-300 outline-none font-light"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F6B58]
                                                     hover:text-[#C5A28A] transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Password match indicator */}
                                    {password && password_confirmation && (
                                        <p className={cn(
                                            "text-xs mt-1",
                                            password === password_confirmation ? 'text-green-600' : 'text-red-500'
                                        )}>
                                            {password === password_confirmation
                                                ? '✓ Գաղտնաբառերը համընկնում են'
                                                : '✗ Գաղտնաբառերը չեն համընկնում'}
                                        </p>
                                    )}
                                </motion.div>

                                <motion.div variants={fadeUp} className="flex gap-3 pt-4">
                                    <motion.button
                                        type="button"
                                        onClick={prevStep}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-4 rounded-xl border border-[#C5A28A]/30
                                                 text-[#8F6B58] font-light tracking-wide
                                                 hover:border-[#C5A28A] hover:bg-white
                                                 transition-all duration-300"
                                    >
                                        Հետ
                                    </motion.button>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "flex-1 py-4 rounded-xl bg-gradient-to-r",
                                            currentBusiness.color,
                                            "text-white font-light tracking-wide relative overflow-hidden",
                                            "disabled:opacity-50 disabled:cursor-not-allowed",
                                            "transition-all duration-300 hover:shadow-lg"
                                        )}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Գրանցվում...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={18} />
                                                    <span>Գրանցվել</span>
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
                                </motion.div>
                            </motion.div>
                        )}
                    </form>

                    {/* Login Link */}
                    <motion.div variants={fadeUp} className="text-center pt-6">
                        <p className="text-sm text-[#8F6B58] font-light">
                            Արդեն ունեք հաշիվ?{" "}
                            <Link
                                to={`/login?type=${business_type}`}
                                className="text-[#C5A28A] hover:text-[#B88E72]
                                         transition-colors font-light underline-offset-2 hover:underline"
                            >
                                Մուտք գործել
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Password Requirements */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 rounded-xl bg-white/30 backdrop-blur-sm
                             border border-[#E8D5C4]/20"
                >
                    <p className="text-xs text-[#8F6B58] font-light">
                        Գաղտնաբառը պետք է պարունակի առնվազն 8 նիշ, մեկ մեծատառ և մեկ թիվ
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}