import { Link, NavLink } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

function cn(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}

export default function LandingNavbar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    const y = useTransform(scrollY, [0, 120], [0, -8]);
    const opacity = useTransform(scrollY, [0, 120], [0.98, 0.85]);
    const backdropBlur = useTransform(scrollY, [0, 120], [8, 16]);

    useEffect(() => {
        const unsubscribe = scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });
        return () => unsubscribe();
    }, [scrollY]);

    const navItemCls = ({ isActive }: { isActive: boolean }) =>
        cn(
            "text-sm px-4 py-2 rounded-full transition-all duration-300 font-light tracking-wide",
            isActive
                ? "bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white shadow-md"
                : "text-[#2C2C2C] hover:text-[#8F6B58] hover:bg-[#C5A28A]/10"
        );

    return (
        <motion.header
            style={{ y, opacity }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
                <motion.div
                    className={cn(
                        "rounded-full border transition-all duration-500",
                        isScrolled
                            ? "bg-white/90 backdrop-blur-xl shadow-lg border-[#E8D5C4]/30"
                            : "bg-white/70 backdrop-blur-md shadow-sm border-[#E8D5C4]/20"
                    )}
                    style={{ backdropFilter: `blur(${backdropBlur}px)` }}
                >
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Brand */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.05 }}
                                className="h-12 w-12 rounded-2xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                         text-white grid place-items-center font-light text-xl
                                         shadow-lg shadow-[#C5A28A]/20"
                            >
                                B
                            </motion.div>
                            <div className="leading-4">
                                <div className="font-light text-lg tracking-tight text-[#2C2C2C]">
                                    Beauty<span className="text-[#C5A28A]">Book</span>
                                </div>
                                <div className="text-xs text-[#8F6B58] font-light tracking-wide">
                                    Թվաին լուծում սրահների համար
                                </div>
                            </div>
                        </Link>

                        {/* Links - Desktop */}
                        <nav className="hidden md:flex items-center gap-2">
                            <NavLink to="/" className={navItemCls} end>
                                Գլխավոր
                            </NavLink>
                            {/*<NavLink to="/features" className={navItemCls}>*/}
                            {/*    Հնարավորություններ*/}
                            {/*</NavLink>*/}
                            <NavLink to="/pricing" className={navItemCls}>
                                Գներ
                            </NavLink>
                            <NavLink to="/about" className={navItemCls}>
                                Մեր մասին
                            </NavLink>
                            <NavLink to="/contact" className={navItemCls}>
                                Կապ
                            </NavLink>
                        </nav>

                        {/* Actions - Պրեմիում */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="hidden sm:inline-flex px-5 py-2 rounded-full
                                         border border-[#E8D5C4]/30 bg-white/50
                                         text-[#2C2C2C] text-sm font-light tracking-wide
                                         hover:border-[#C5A28A]/50 hover:bg-white
                                         transition-all duration-300 backdrop-blur-sm"
                            >
                                Մուտք
                            </Link>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    to="/register"
                                    className="relative inline-flex px-6 py-2.5 rounded-full
                                             bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                             text-white text-sm font-light tracking-wide
                                             shadow-md shadow-[#C5A28A]/30
                                             hover:shadow-lg hover:shadow-[#C5A28A]/40
                                             transition-all duration-300 overflow-hidden group"
                                >
                                    <span className="relative z-10">Սկսել անվճար</span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-[#B88E72] to-[#C5A28A]"
                                        initial={{ x: "100%" }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </Link>
                            </motion.div>

                            {/* Mobile menu button */}
                            <button className="md:hidden w-10 h-10 rounded-full
                                             border border-[#E8D5C4]/30 flex items-center
                                             justify-center hover:bg-[#C5A28A]/10
                                             transition-colors duration-300">
                                <svg className="w-5 h-5 text-[#2C2C2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile links - Պրեմիում */}
                    <motion.div
                        initial={false}
                        animate={{ height: 'auto' }}
                        className="md:hidden border-t border-[#E8D5C4]/20 px-4 py-3
                                 flex gap-2 overflow-x-auto scrollbar-hide"
                    >
                        <NavLink to="/" className={navItemCls} end>
                            Գլխավոր
                        </NavLink>
                        <NavLink to="/features" className={navItemCls}>
                            Հնարավորություններ
                        </NavLink>
                        <NavLink to="/pricing" className={navItemCls}>
                            Գներ
                        </NavLink>
                        <NavLink to="/about" className={navItemCls}>
                            Մեր մասին
                        </NavLink>
                        <NavLink to="/contact" className={navItemCls}>
                            Կապ
                        </NavLink>
                    </motion.div>
                </motion.div>
            </div>
        </motion.header>
    );
}