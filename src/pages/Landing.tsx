import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {  useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { plansApi } from "@/lib/planApi.ts"
import {
    Sparkles,
    Award,
    ArrowRight,
    Check,
    Star,
    Calendar,
    Users,
    TrendingUp,
    Shield,
    ChevronRight,
    Menu,
    X,
    Zap,
    Crown,
    Scissors,
    HeartPulse,
    Smartphone,
    MessageCircle,
    Instagram,
    Facebook,
    Youtube,
    Linkedin
} from "lucide-react";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type BusinessType = 'salon' | 'clinic' | null;

// ------------------------------------------------------------
// Animation Variants
// ------------------------------------------------------------
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 100,
            duration: 0.6
        }
    }
};

const fadeInScale = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 90,
            duration: 0.5
        }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 100
        }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 100
        }
    }
};

const floatingAnimation = {
    initial: { y: 0 },
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const pulseAnimation = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const rotateAnimation = {
    initial: { rotate: 0 },
    animate: {
        rotate: 360,
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
        }
    }
};

// ------------------------------------------------------------
// API functions
// ------------------------------------------------------------
const fetchPlans = async (businessType: string) => {
    const res = await plansApi.list(businessType);
    return res.data.data || [];
};

// ------------------------------------------------------------
// Custom Cursor Component
// ------------------------------------------------------------
const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        const mouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const mouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role="button"], input, select, textarea')) {
                setIsHovering(true);
            }
        };

        const mouseOut = () => setIsHovering(false);
        const mouseLeave = () => setIsVisible(false);

        if (!isMobile) {
            window.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseover', mouseOver);
            document.addEventListener('mouseout', mouseOut);
            document.addEventListener('mouseleave', mouseLeave);
        }

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseover', mouseOver);
            document.removeEventListener('mouseout', mouseOut);
            document.removeEventListener('mouseleave', mouseLeave);
            window.removeEventListener('resize', checkMobile);
        };
    }, [isVisible, isMobile]);

    if (!isVisible || isMobile) return null;

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[100] hidden lg:block"
                animate={{
                    x: mousePosition.x - 8,
                    y: mousePosition.y - 8,
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
            >
                <div className="w-4 h-4 bg-[#C5A28A] rounded-full opacity-30" />
            </motion.div>
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[100] hidden lg:block"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    scale: isHovering ? 1.2 : 1,
                }}
                transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
            >
                <div className="w-8 h-8 border border-[#C5A28A] rounded-full opacity-50" />
            </motion.div>
        </>
    );
};

// ------------------------------------------------------------
// Premium Badge Component
// ------------------------------------------------------------
const PremiumBadge = ({ children, className = "", icon }: { children: React.ReactNode; className?: string; icon?: any }) => {
    const Icon = icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className={`relative inline-flex items-center px-5 py-2.5 overflow-hidden rounded-full 
                       bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10 
                       border border-[#C5A28A]/30 text-[#8F6B58] text-xs font-medium 
                       backdrop-blur-sm ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]"
                />
                {Icon && <Icon size={14} className="text-[#C5A28A]" />}
                {children}
            </span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
            />
        </motion.div>
    );
};

// ------------------------------------------------------------
// Premium Button Component
// ------------------------------------------------------------
const PremiumButton = ({
                           to,
                           children,
                           variant = "primary",
                           className = "",
                           icon: Icon,
                           onClick
                       }: {
    to?: string;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    className?: string;
    icon?: any;
    onClick?: () => void;
}) => {
    const navigate = useNavigate();

    const baseClasses = "relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm tracking-widest uppercase overflow-hidden transition-all duration-700 group cursor-pointer";

    const variants = {
        primary: "bg-[#2C2C2C] text-white hover:bg-[#8F6B58]",
        secondary: "bg-white text-[#2C2C2C] hover:bg-[#C5A28A] hover:text-white",
        outline: "border border-[#C5A28A]/30 text-[#8F6B58] hover:border-[#C5A28A]"
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
                {Icon && <Icon size={18} className="group-hover:translate-x-1 transition-transform" />}
            </span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#C5A28A] to-[#B88E72]"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.5 }}
            />
        </motion.button>
    );
};

// ------------------------------------------------------------
// Business Type Card Component
// ------------------------------------------------------------
const BusinessTypeCard = ({
                              type,
                              title,
                              description,
                              icon: Icon,
                              features,
                              price,
                              isSelected,
                              onSelect
                          }: {
    type: 'salon' | 'clinic';
    title: string;
    description: string;
    icon: any;
    features: string[];
    price?: string;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`
                relative cursor-pointer rounded-3xl border-2 p-8
                transition-all duration-500 overflow-hidden
                ${isSelected
                ? 'border-[#C5A28A] bg-white shadow-2xl shadow-[#C5A28A]/20'
                : 'border-[#E8D5C4]/30 bg-white/70 hover:border-[#C5A28A]/50 hover:bg-white'
            }
            `}
        >
            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#C5A28A]/5 to-[#B88E72]/5"
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48">
                <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-[#C5A28A]/20 rounded-tr-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48">
                <div className="absolute bottom-0 left-0 w-full h-full border-b-2 border-l-2 border-[#C5A28A]/20 rounded-bl-3xl" />
            </div>

            <div className="relative">
                <div className="flex items-start justify-between mb-8">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.7 }}
                        className={`
                            h-20 w-20 rounded-2xl flex items-center justify-center
                            ${isSelected
                            ? 'bg-gradient-to-r from-[#C5A28A] to-[#B88E72] shadow-lg shadow-[#C5A28A]/30'
                            : 'bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20'
                        }
                        `}
                    >
                        <Icon size={36} className={isSelected ? 'text-white' : 'text-[#C5A28A]'} />
                    </motion.div>

                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                         flex items-center justify-center text-white"
                            >
                                <Check size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <h3 className="text-3xl font-light text-[#2C2C2C] mb-3">{title}</h3>
                <p className="text-[#8F6B58] font-light mb-4 text-lg">{description}</p>
                {price && (
                    <p className="text-[#C5A28A] font-light mb-6 text-sm">
                        Սկսած <span className="text-2xl">{price}</span>/ամիս
                    </p>
                )}

                <div className="space-y-4">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 text-[#2C2C2C]"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]" />
                            <span className="text-sm">{feature}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ------------------------------------------------------------
// Feature Card Component
// ------------------------------------------------------------
const FeatureCard = ({
                         icon: Icon,
                         title,
                         description,
                         gradient = "from-[#C5A28A] to-[#B88E72]"
                     }: {
    icon: any;
    title: string;
    description: string;
    gradient?: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-black/5
                     border border-[#E8D5C4]/30 hover:border-[#C5A28A]/50
                     transition-all duration-700 overflow-hidden"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#F9F5F0] to-[#F0E7DD]"
                animate={{
                    opacity: isHovered ? 1 : 0.5,
                    scale: isHovered ? 1.1 : 1
                }}
                transition={{ duration: 0.7 }}
            />

            <div className="relative">
                <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 0.7 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} 
                              flex items-center justify-center text-white text-2xl
                              shadow-lg shadow-[#C5A28A]/20 mb-6`}
                >
                    <Icon size={28} />
                </motion.div>

                <h3 className="text-xl font-light text-[#2C2C2C] mb-3">{title}</h3>
                <p className="text-[#8F6B58] text-sm leading-relaxed font-light">{description}</p>
            </div>

            {/* Decorative corner */}
            <motion.div
                className="absolute -bottom-2 -right-2 w-20 h-20 opacity-20"
                animate={{ rotate: isHovered ? 90 : 0 }}
                transition={{ duration: 0.5 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#C5A28A]">
                    <path d="M80,20 L80,80 L20,80" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
            </motion.div>
        </motion.div>
    );
};

// ------------------------------------------------------------
// Stat Counter Component
// ------------------------------------------------------------
const StatCounter = ({ value, label, suffix = "", duration = 2000 }: { value: number; label: string; suffix?: string; duration?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let start = 0;
                        const increment = value / (duration / 16);

                        const timer = setInterval(() => {
                            start += increment;
                            if (start > value) {
                                setCount(value);
                                clearInterval(timer);
                            } else {
                                setCount(Math.floor(start));
                            }
                        }, 16);

                        return () => clearInterval(timer);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [value, duration]);

    return (
        <motion.div
            ref={ref}
            variants={fadeInScale}
            className="text-center"
        >
            <div className="text-5xl md:text-6xl font-light text-[#2C2C2C] mb-2">
                {count}{suffix}
            </div>
            <div className="text-sm text-[#8F6B58] font-light tracking-wide">{label}</div>
        </motion.div>
    );
};

// ------------------------------------------------------------
// Testimonial Card Component
// ------------------------------------------------------------
const TestimonialCard = ({
                             quote,
                             author,
                             role,
                             rating = 5,
                             type,
                             businessName
                         }: {
    quote: string;
    author: string;
    role: string;
    rating?: number;
    type: 'salon' | 'clinic';
    businessName: string;
}) => {
    return (
        <motion.div
            variants={fadeInUp}
            className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-black/5
                     border border-[#E8D5C4]/20 hover:border-[#C5A28A]/30
                     transition-all duration-500 group"
        >
            {/* Type indicator */}
            <div className="absolute -top-3 -right-3">
                <div className={`
                    px-4 py-2 rounded-full text-xs font-light shadow-lg
                    ${type === 'salon'
                    ? 'bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white'
                    : 'bg-gradient-to-r from-[#8F6B58] to-[#C5A28A] text-white'
                }
                `}>
                    <div className="flex items-center gap-1">
                        {type === 'salon' ? <Sparkles size={12} /> : <Award size={12} />}
                        <span>{businessName}</span>
                    </div>
                </div>
            </div>

            {/* Quote mark */}
            <div className="absolute top-6 right-6 text-6xl text-[#C5A28A]/10 font-serif">"</div>

            <div className="flex gap-1 mb-6">
                {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#C5A28A] text-[#C5A28A]" />
                ))}
            </div>

            <p className="text-[#2C2C2C] text-base leading-relaxed font-light mb-6 italic">
                "{quote}"
            </p>

            <div className="flex items-center gap-4">
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-white font-light text-xl
                    ${type === 'salon'
                    ? 'bg-gradient-to-r from-[#C5A28A] to-[#B88E72]'
                    : 'bg-gradient-to-r from-[#8F6B58] to-[#C5A28A]'
                }
                `}>
                    {author.charAt(0)}
                </div>
                <div>
                    <div className="text-[#2C2C2C] font-light">{author}</div>
                    <div className="text-[#8F6B58] text-sm font-light">{role}</div>
                </div>
            </div>

            {/* Animated border */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C5A28A] to-[#B88E72]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
            />
        </motion.div>
    );
};

// ------------------------------------------------------------
// Pricing Card Component (updated to use backend data)
// ------------------------------------------------------------
const PricingCard = ({
                         plan,
                         businessType
                     }: {
    plan: any;
    businessType: BusinessType;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    if (!plan) return null;

    return (
        <motion.div
            variants={fadeInScale}
            whileHover={{ scale: plan.code === 'business' ? 1.05 : 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`
                relative rounded-3xl p-8 transition-all duration-700 h-full flex flex-col
                ${plan.code === 'business'
                ? 'bg-gradient-to-b from-white to-[#F9F5F0] shadow-2xl shadow-[#C5A28A]/20 border-2 border-[#C5A28A]/30'
                : 'bg-white/50 backdrop-blur-sm border border-[#E8D5C4]/20 hover:border-[#C5A28A]/30'
            }
            `}
        >
            {plan.code === 'business' && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                >
                    <span className="bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                   text-white text-xs px-6 py-2 rounded-full shadow-lg">
                        Ամենատարածված
                    </span>
                </motion.div>
            )}

            <div className="relative flex-grow">
                <h3 className={`text-2xl font-light mb-2 ${plan.code === 'business' ? 'text-[#8F6B58]' : 'text-[#2C2C2C]'}`}>
                    {plan.name}
                </h3>
                <p className="text-[#8F6B58] text-sm font-light mb-6">{plan.description || ''}</p>

                <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-light text-[#2C2C2C]">
                        {plan.price?.toLocaleString()}
                    </span>
                    <span className="text-[#8F6B58] text-sm font-light">/{plan.period || 'ամիս'}</span>
                </div>

                {!businessType && (
                    <div className="mb-6 p-3 bg-[#C5A28A]/5 rounded-xl border border-[#C5A28A]/20">
                        <p className="text-xs text-[#8F6B58] text-center">
                            Ընտրեք բիզնեսի տեսակը գինը տեսնելու համար
                        </p>
                    </div>
                )}

                <ul className="space-y-4 mb-8">
                    {plan.features && Object.entries(plan.features).map(([key, value], i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 text-[#2C2C2C] text-sm font-light"
                        >
                            <Check size={18} className="text-[#C5A28A] flex-shrink-0" />
                            <span>
                                {key === 'staff_limit' && `Մինչև ${value} աշխատակից`}
                                {key === 'sms_reminders' && `SMS հիշեցումներ (${value}/ամիս)`}
                                {key === 'api_access' && (value ? 'API հասանելիություն' : 'API հասանելիություն չկա')}
                                {key === 'priority_support' && (value ? 'Առաջնահերթ աջակցություն' : 'Ստանդարտ աջակցություն')}
                                {key === 'dedicated_manager' && (value ? 'Անհատական մենեջեր' : '')}
                                {!['staff_limit', 'sms_reminders', 'api_access', 'priority_support', 'dedicated_manager'].includes(key) &&
                                    `${key}: ${value}`}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            <PremiumButton
                onClick={() => navigate(`/register?type=${businessType || 'salon'}`)}
                variant={plan.code === 'business' ? "primary" : "outline"}
                className="w-full justify-center mt-auto"
                icon={ArrowRight}
            >
                Սկսել անվճար
            </PremiumButton>
        </motion.div>
    );
};

// ------------------------------------------------------------
// FAQ Item Component
// ------------------------------------------------------------
const FAQItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            variants={fadeInUp}
            className="border-b border-[#E8D5C4]/30 last:border-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between gap-4 text-left group"
            >
                <span className="text-[#2C2C2C] font-light flex items-center gap-4">
                    <span className="text-[#C5A28A] text-sm font-mono">0{index + 1}</span>
                    {q}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-6 h-6 flex-shrink-0"
                >
                    <div className="absolute top-1/2 left-0 w-full h-px bg-[#C5A28A] -translate-y-1/2" />
                    <div className={`absolute top-0 left-1/2 w-px h-full bg-[#C5A28A] -translate-x-1/2 
                                  transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-[#8F6B58] font-light leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ------------------------------------------------------------
// Navigation Component
// ------------------------------------------------------------
const Navigation = ({ isScrolled, selectedType }: { isScrolled: boolean; selectedType: BusinessType }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { name: 'Գլխավոր', path: '/' },
        { name: 'Առանձնահատկություններ', path: '/features' },
        { name: 'Գներ', path: '/pricing' },
        { name: 'Կապ', path: '/contact' }
    ];

    const handleNavClick = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`
                    fixed top-0 left-0 right-0 z-50 transition-all duration-500
                    ${isScrolled
                    ? 'bg-white/80 backdrop-blur-lg shadow-lg py-3'
                    : 'bg-transparent py-5'
                }
                `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handleNavClick('/')}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                          flex items-center justify-center shadow-lg shadow-[#C5A28A]/20">
                                <span className="text-white font-light text-xl">B</span>
                            </div>
                            <span className="text-xl font-light text-[#2C2C2C]">SmartBook</span>
                        </motion.div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className="px-5 py-2 rounded-full text-sm text-[#2C2C2C]
                                             hover:text-[#C5A28A] transition-colors relative group"
                                >
                                    {item.name}
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1
                                                 bg-[#C5A28A] rounded-full opacity-0 group-hover:opacity-100"
                                        transition={{ duration: 0.3 }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <PremiumButton
                                onClick={() => handleNavClick('/login')}
                                variant="outline"
                                className="px-6 py-2.5 text-sm"
                            >
                                Մուտք
                            </PremiumButton>
                            <PremiumButton
                                onClick={() => handleNavClick(`/register?type=${selectedType || 'salon'}`)}
                                variant="primary"
                                className="px-6 py-2.5 text-sm"
                                icon={ArrowRight}
                            >
                                Գրանցում
                            </PremiumButton>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden relative z-50 w-10 h-10 rounded-full bg-white shadow-lg
                                     flex items-center justify-center"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed inset-0 bg-white z-40 md:hidden"
                    >
                        <div className="flex flex-col h-full pt-24 p-6">
                            {/* Mobile Navigation Items */}
                            <div className="flex-1 space-y-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavClick(item.path)}
                                        className="w-full text-left py-4 px-6 rounded-xl text-lg
                                                 text-[#2C2C2C] hover:bg-[#F5F0EB] transition-colors"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile Auth Buttons */}
                            <div className="space-y-3 pt-6 border-t border-[#E8D5C4]/30">
                                <button
                                    onClick={() => handleNavClick('/login')}
                                    className="w-full py-4 text-center text-[#2C2C2C] border border-[#C5A28A]/30
                                             rounded-xl hover:bg-[#C5A28A]/5 transition-colors"
                                >
                                    Մուտք
                                </button>
                                <button
                                    onClick={() => handleNavClick(`/register?type=${selectedType || 'salon'}`)}
                                    className="w-full py-4 text-center bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                             text-white rounded-xl shadow-lg shadow-[#C5A28A]/30"
                                >
                                    Գրանցում
                                </button>
                            </div>

                            {/* Mobile Footer */}
                            <div className="mt-8 text-center text-sm text-[#8F6B58]">
                                <p>© 2024 SmartBook</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ------------------------------------------------------------
// Footer Component
// ------------------------------------------------------------
const Footer = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'Մեր մասին', path: '/about' },
            { name: 'Կարիերա', path: '/careers' },
            { name: 'Բլոգ', path: '/blog' },
            { name: 'Մամուլ', path: '/press' }
        ],
        product: [
            { name: 'Առանձնահատկություններ', path: '/features' },
            { name: 'Գներ', path: '/pricing' },
            { name: 'FAQ', path: '/faq' },
            { name: 'Աջակցություն', path: '/support' }
        ],
        legal: [
            { name: 'Գաղտնիության քաղաքականություն', path: '/privacy-policy' },
            { name: 'Օգտագործման պայմաններ', path: '/terms' },
            { name: 'Կուկիներ', path: '/cookies' }
        ]
    };

    const socialLinks = [
        { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
        { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
        { icon: Youtube, url: 'https://youtube.com', label: 'Youtube' },
        { icon: Linkedin, url: 'https://linkedin.com', label: 'LinkedIn' }
    ];

    return (
        <footer className="bg-[#2C2C2C] text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* About */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                          flex items-center justify-center shadow-lg">
                                <span className="text-white font-light text-2xl">B</span>
                            </div>
                            <span className="text-2xl font-light">SmartBook</span>
                        </div>
                        <p className="text-[#E8D5C4] text-sm leading-relaxed font-light mb-6 max-w-md">
                            Պրեմիում լուծում գեղեցկության սրահների և դենտալ կլինիկաների համար։
                            Մենք օգնում ենք բիզնեսներին ավտոմատացնել ամրագրումները և բարձրացնել եկամուտը։
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, idx) => (
                                <motion.a
                                    key={idx}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ y: -3 }}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                                             hover:bg-gradient-to-r hover:from-[#C5A28A] hover:to-[#B88E72]
                                             transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-lg font-light mb-6">Ընկերություն</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-[#E8D5C4] hover:text-[#C5A28A] transition-colors text-sm font-light"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-lg font-light mb-6">Արտադրանք</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-[#E8D5C4] hover:text-[#C5A28A] transition-colors text-sm font-light"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-lg font-light mb-6">Իրավական</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-[#E8D5C4] hover:text-[#C5A28A] transition-colors text-sm font-light"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="mb-16 p-8 rounded-3xl bg-white/5 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h4 className="text-xl font-light mb-2">Տեղեկագիր</h4>
                            <p className="text-[#E8D5C4] text-sm">Բաժանորդագրվեք և ստացեք նորությունները առաջինը</p>
                        </div>
                        <div className="flex w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Ձեր էլ․ փոստը"
                                className="flex-1 md:w-80 px-6 py-4 bg-white/10 border border-white/20
                                         rounded-l-xl text-white placeholder:text-white/50
                                         focus:outline-none focus:border-[#C5A28A] transition-colors"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => alert('Շուտով կհասանելի լինի 🤍')}
                                className="px-6 py-4 bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                         rounded-r-xl flex items-center justify-center"
                            >
                                <ArrowRight size={20} />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[#E8D5C4] text-sm">
                            &copy; {currentYear} SmartBook. Բոլոր իրավունքները պաշտպանված են.
                        </p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => navigate('/privacy-policy')} className="text-[#E8D5C4] hover:text-[#C5A28A] text-sm">
                                Գաղտնիության քաղաքականություն
                            </button>
                            <button onClick={() => navigate('/terms')} className="text-[#E8D5C4] hover:text-[#C5A28A] text-sm">
                                Օգտագործման պայմաններ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ------------------------------------------------------------
// Main Landing Component
// ------------------------------------------------------------
export default function Landing() {
    const [selectedType, setSelectedType] = useState<BusinessType>('salon');
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const smoothProgress = useSpring(scrollYProgress, { damping: 30, stiffness: 100 });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fetch plans from backend
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['public-plans', selectedType],
        queryFn: () => fetchPlans(selectedType || 'salon'),
        enabled: !!selectedType,
    });

    // Data
    const beautyFeatures = [
        'Բազմակի ծառայությունների միաժամանակյա ամրագրում',
        'Լոյալության քարտեր և բոնուսային համակարգ',
        'Նվերի վկայագրերի վաճառք',
        'Ինտեգրում սոցիալական ցանցերի հետ',
        'Հաճախորդների բազա և պատմություն'
    ];

    const dentalFeatures = [
        'Աթոռների/սենյակների կառավարում',
        'Պացիենտի էլեկտրոնային քարտ',
        'Բուժման պլանների կազմում',
        'Բժշկական նշումներ և ֆայլեր',
        'Հիշեցումներ SMS-ով և email-ով'
    ];

    const coreFeatures = [
        {
            icon: Calendar,
            title: 'Խելացի օրացույց',
            description: 'Հեշտ կառավարեք ամրագրումները, տեսեք ազատ ժամերը իրական ժամանակում'
        },
        {
            icon: Users,
            title: 'Աշխատակիցների կառավարում',
            description: 'Աշխատակիցների գրաֆիկ, աշխատաժամանակ և աշխատավարձ'
        },
        {
            icon: TrendingUp,
            title: 'Վերլուծություն',
            description: 'Մանրամասն վիճակագրություն և հաշվետվություններ'
        },
        {
            icon: Shield,
            title: 'Անվտանգություն',
            description: 'Տվյալների պաշտպանություն և գաղտնագրում'
        },
        {
            icon: Smartphone,
            title: 'Բջջային հավելված',
            description: 'Կառավարեք բիզնեսը ցանկացած վայրից'
        },
        {
            icon: MessageCircle,
            title: '24/7 Աջակցություն',
            description: 'Միշտ պատրաստ ենք օգնել'
        }
    ];

    const testimonials = [
        {
            quote: "SmartBook-ը փոխեց մեր աշխատանքի որակը։ Հաճախորդներն ավելի գոհ են, իսկ ես՝ ավելի հանգիստ։",
            author: "Աննա Մարտիրոսյան",
            role: "Հիմնադիր",
            businessName: "Beauty Lab Studio",
            type: "salon" as const,
            rating: 5
        },
        {
            quote: "Դենտալ կլինիկայի համար կատարյալ լուծում է։ Պացիենտների քարտերը, աթոռների կառավարումը՝ ամեն ինչ մտածված է։",
            author: "Դոկտոր Արմեն Պետրոսյան",
            role: "Գլխավոր բժիշկ",
            businessName: "Armen Dental Clinic",
            type: "clinic" as const,
            rating: 5
        }
    ];

    const faqData = [
        {
            q: "Ինչպե՞ս է աշխատում անվճար փորձաշրջանը",
            a: "Դուք կարող եք օգտվել բոլոր ֆունկցիաներից 14 օր անվճար՝ առանց որևէ պարտավորության։ Ձեզ անհրաժեշտ է միայն գրանցվել և սկսել օգտագործել։ Ոչ մի վճարային քարտ պետք չէ։"
        },
        {
            q: "Կարո՞ղ եմ հետագայում փոխել բիզնեսի տեսակը",
            a: "Այո, դուք կարող եք փոխել Ձեր բիզնեսի տեսակը ցանկացած պահի։ Մենք կօգնենք Ձեզ տվյալների միգրացիայի հարցում և կապահովենք անխափան անցումը։"
        },
        {
            q: "Ինչպիսի՞ աջակցություն եք տրամադրում",
            a: "Մենք տրամադրում ենք 24/7 աջակցություն բոլոր հաճախորդներին՝ էլ․ փոստի, զանգի և chat-ի միջոցով։ Պրեմիում փաթեթի համար հասանելի է անհատական մենեջեր։"
        },
        {
            q: "Արդյո՞ք անվտանգ է իմ տվյալները",
            a: "Այո, մենք օգտագործում ենք ժամանակակից գաղտնագրման տեխնոլոգիաներ և հետևում ենք տվյալների պաշտպանության միջազգային ստանդարտներին։ Ձեր տվյալները պահպանվում են անվտանգ սերվերներում։"
        },
        {
            q: "Կարո՞ղ եմ ինտեգրել իմ գործիքների հետ",
            a: "Այո, մենք տրամադրում ենք API հասանելիություն, որը թույլ է տալիս ինտեգրել SmartBook-ը Ձեր գործիքների հետ։"
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFAF7] text-[#2C2C2C] font-light overflow-x-hidden">
            <CustomCursor />
            <Navigation isScrolled={isScrolled} selectedType={selectedType} />

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] z-50"
                style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
            />

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full
                                 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white
                                 shadow-lg shadow-[#C5A28A]/30 flex items-center justify-center
                                 hover:shadow-xl transition-all"
                    >
                        <ChevronRight size={20} className="rotate-[-90deg]" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden pt-20">
                {/* Parallax Background */}
                <motion.div
                    style={{ y: heroY }}
                    className="absolute inset-0 -z-10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FDFAF7] via-[#FAF4ED] to-[#F5ECE3]" />

                    {/* Animated decorative elements */}
                    <motion.div
                        variants={rotateAnimation}
                        initial="initial"
                        animate="animate"
                        className="absolute top-20 left-10 w-96 h-96 opacity-10"
                    >
                        <div className="w-full h-full rounded-full border-2 border-[#C5A28A]" />
                    </motion.div>

                    <motion.div
                        variants={floatingAnimation}
                        initial="initial"
                        animate="animate"
                        className="absolute bottom-20 right-10 w-64 h-64 opacity-10"
                    >
                        <div className="w-full h-full border-2 border-[#B88E72] rotate-45" />
                    </motion.div>

                    <motion.div
                        variants={pulseAnimation}
                        initial="initial"
                        animate="animate"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                 w-[800px] h-[800px] opacity-5"
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]" />
                    </motion.div>
                </motion.div>

                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="mx-auto max-w-6xl text-center relative z-10"
                >
                    <PremiumBadge className="mb-8" icon={Zap}>
                        SmartBook Պրեմիում 2026
                    </PremiumBadge>

                    <motion.h1
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="text-5xl sm:text-6xl md:text-8xl font-light leading-tight tracking-tight"
                    >
                        Կառավարեք Ձեր
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#C5A28A] to-[#B88E72]">
                            բիզնեսը խելացի
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                        className="mt-8 text-lg sm:text-xl text-[#8F6B58] max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Մեկ հարթակ գեղեցկության սրահների և դենտալ կլինիկաների համար
                    </motion.p>

                    {/* Business Type Selection */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mt-16 max-w-4xl mx-auto"
                    >
                        <motion.div
                            variants={fadeInUp}
                            className="text-sm text-[#8F6B58] font-light tracking-wide uppercase mb-8"
                        >
                            Ընտրեք Ձեր բիզնեսի տեսակը
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <BusinessTypeCard
                                type="salon"
                                title="Սալոն / Beauty"
                                description="Գեղեցկության սրահներ, սպա, բարբեր շոփ"
                                icon={Sparkles}
                                features={beautyFeatures}
                                price="7,000"
                                isSelected={selectedType === 'salon'}
                                onSelect={() => setSelectedType('salon')}
                            />

                            <BusinessTypeCard
                                type="clinic"
                                title="Dental Clinic"
                                description="Ստոմատոլոգիական կլինիկաներ"
                                icon={Award}
                                features={dentalFeatures}
                                price="9,000"
                                isSelected={selectedType === 'clinic'}
                                onSelect={() => setSelectedType('clinic')}
                            />
                        </div>

                        {/* Register Button */}
                        <AnimatePresence>
                            {selectedType && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="mt-12"
                                >
                                    <PremiumButton
                                        onClick={() => window.location.href = `/register?type=${selectedType}`}
                                        variant="primary"
                                        className="px-12 py-5 text-base"
                                        icon={ArrowRight}
                                    >
                                        Սկսել անվճար փորձաշրջանը
                                    </PremiumButton>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm text-[#8F6B58]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Check size={16} className="text-[#C5A28A]" />
                                            14 օր անվճար
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Check size={16} className="text-[#C5A28A]" />
                                            Առանց քարտի
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Check size={16} className="text-[#C5A28A]" />
                                            Չեղարկեք ցանկացած պահի
                                        </span>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <div className="w-6 h-10 rounded-full border border-[#C5A28A]/30 flex justify-center">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-3 bg-gradient-to-r from-[#C5A28A] to-[#B88E72] rounded-full mt-2"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-12"
                    >
                        <StatCounter value={500} suffix="+" label="Ակտիվ բիզնեսներ" />
                        <StatCounter value={50} suffix="K" label="Ամրագրումներ" />
                        <StatCounter value={98} suffix="%" label="Գոհ հաճախորդներ" />
                        <StatCounter value={24} suffix="/7" label="Աջակցություն" />
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-[#FDFAF7]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <PremiumBadge className="mb-6" icon={Sparkles}>
                            Ինչու մենք
                        </PremiumBadge>
                        <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
                            Հարմարեցված <span className="text-[#8F6B58]">Ձեր բիզնեսին</span>
                        </h2>
                        <p className="text-lg text-[#8F6B58] font-light">
                            Մեկ հարթակ, երկու ուղղություն
                        </p>
                    </motion.div>

                    {/* Core Features Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
                    >
                        {coreFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </motion.div>

                    {/* Type-specific Features */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            variants={slideInLeft}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative p-8 rounded-3xl bg-gradient-to-br from-[#C5A28A]/5 to-[#B88E72]/5
                                     border border-[#C5A28A]/20 hover:border-[#C5A28A]/40 transition-all"
                        >
                            <div className="absolute -top-4 -right-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                              flex items-center justify-center text-white shadow-lg">
                                    <Sparkles size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-light text-[#2C2C2C] mb-6 flex items-center gap-2">
                                <Scissors size={24} className="text-[#C5A28A]" />
                                Beauty-ի համար
                            </h3>
                            <ul className="space-y-4">
                                {beautyFeatures.map((feature, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <Check size={18} className="text-[#C5A28A]" />
                                        <span className="text-[#8F6B58]">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            variants={slideInRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="relative p-8 rounded-3xl bg-gradient-to-br from-[#C5A28A]/5 to-[#B88E72]/5
                                     border border-[#C5A28A]/20 hover:border-[#C5A28A]/40 transition-all"
                        >
                            <div className="absolute -top-4 -right-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                              flex items-center justify-center text-white shadow-lg">
                                    <Award size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-light text-[#2C2C2C] mb-6 flex items-center gap-2">
                                <HeartPulse size={24} className="text-[#C5A28A]" />
                                Dental-ի համար
                            </h3>
                            <ul className="space-y-4">
                                {dentalFeatures.map((feature, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <Check size={18} className="text-[#C5A28A]" />
                                        <span className="text-[#8F6B58]">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4 sm:px-6 bg-[#FDFAF7]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <PremiumBadge className="mb-6" icon={Crown}>
                            Գնային փաթեթներ
                        </PremiumBadge>
                        <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
                            Ընտրեք Ձեր <span className="text-[#8F6B58]">փաթեթը</span>
                        </h2>
                        <p className="text-lg text-[#8F6B58] font-light">
                            Թափանցիկ գներ առանց թաքնված վճարների
                        </p>
                    </motion.div>

                    {plansLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A28A]" />
                        </div>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                        >
                            {plans.map((plan: any, index: number) => (
                                <PricingCard
                                    key={index}
                                    plan={plan}
                                    businessType={selectedType}
                                />
                            ))}
                        </motion.div>
                    )}

                    {!selectedType && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mt-12 text-center"
                        >
                            <p className="text-[#8F6B58] text-sm">
                                * Ընտրեք բիզնեսի տեսակը գինը տեսնելու համար
                            </p>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <PremiumBadge className="mb-6" icon={Star}>
                            Հաճախորդների կարծիքներ
                        </PremiumBadge>
                        <h2 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
                            Վստահում են <span className="text-[#8F6B58]">պրոֆեսիոնալները</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid gap-8 md:grid-cols-2"
                    >
                        {testimonials.map((testimonial, index) => (
                            <TestimonialCard
                                key={index}
                                {...testimonial}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-4 sm:px-6 bg-[#FDFAF7]">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <PremiumBadge className="mb-6" icon={MessageCircle}>
                            ՀՏՀ
                        </PremiumBadge>
                        <h2 className="text-4xl font-light text-[#2C2C2C]">
                            Հաճախ տրվող <span className="text-[#8F6B58]">հարցեր</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-2"
                    >
                        {faqData.map((item, index) => (
                            <FAQItem
                                key={index}
                                index={index}
                                q={item.q}
                                a={item.a}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl bg-gradient-to-br from-[#2C2C2C] to-[#1E1E1E]
                                 p-12 lg:p-20 overflow-hidden"
                    >
                        {/* Animated background elements */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1],
                                rotate: [0, 90, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C5A28A]/20 to-[#B88E72]/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.1, 0.15, 0.1],
                                rotate: [0, -90, 0]
                            }}
                            transition={{ duration: 12, repeat: Infinity }}
                            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#8F6B58]/20 to-[#C5A28A]/20 rounded-full blur-3xl"
                        />

                        <div className="relative text-center text-white">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-5xl font-light mb-6"
                            >
                                Պատրա՞ստ եք զարգացնել <span className="text-[#C5A28A]">Ձեր բիզնեսը</span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-lg text-[#E8D5C4] font-light max-w-2xl mx-auto mb-10"
                            >
                                Միացեք 500+ բիզնեսների, որոնք արդեն վստահում են մեզ
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-6"
                            >
                                <PremiumButton
                                    onClick={() => window.location.href = `/register?type=${selectedType || 'salon'}`}
                                    variant="secondary"
                                    className="px-12 py-5 text-base"
                                    icon={ArrowRight}
                                >
                                    Սկսել անվճար
                                </PremiumButton>

                                <button
                                    onClick={() => window.location.href = '/contact'}
                                    className="group inline-flex items-center gap-2 text-white
                                             hover:text-[#C5A28A] transition-colors duration-500"
                                >
                                    <span className="text-sm tracking-widest uppercase">Կապ մեզ հետ</span>
                                    <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-[#E8D5C4]"
                            >
                                <span className="flex items-center gap-2">
                                    <Check size={16} className="text-[#C5A28A]" />
                                    14-օրյա անվճար փորձաշրջան
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check size={16} className="text-[#C5A28A]" />
                                    Առանց քարտի
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check size={16} className="text-[#C5A28A]" />
                                    Չեղարկեք ցանկացած պահի
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}