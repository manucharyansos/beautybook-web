import LandingNavbar from "@/components/LandingNavbar";
import StickyCTA from "@/components/StickyCTA";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

// Պրեմիում անիմացիաներ
const premiumFadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 100,
            duration: 0.8
        }
    }
};

const premiumScale = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 20,
            stiffness: 90
        }
    }
};

const premiumContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
            ease: [0.25, 0.1, 0.25, 1]
        }
    }
};

// Premium Badge
function PremiumBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`relative inline-flex items-center px-4 py-2 overflow-hidden rounded-full 
                         bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10 
                         border border-[#C5A28A]/20 text-[#8F6B58] text-xs font-medium 
                         backdrop-blur-sm ${className}`}>
            <span className="relative z-10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72] animate-pulse" />
                {children}
            </span>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
            />
        </span>
    );
}

// Պրեմիում Feature Card (նույնը ինչ Landing-ում)
function PremiumFeatureCard({
                                title,
                                desc,
                                icon,
                                gradient = "from-[#C5A28A] to-[#B88E72]"
                            }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    gradient?: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={premiumFadeUp}
            whileHover={{ y: -10 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white rounded-3xl p-8 shadow-2xl shadow-black/5
                     border border-[#E8D5C4]/30 hover:border-[#C5A28A]/50
                     transition-all duration-700 overflow-hidden"
        >
            {/* Background gradient animation */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#F9F5F0] to-[#F0E7DD]"
                animate={{
                    opacity: isHovered ? 1 : 0.5,
                    scale: isHovered ? 1.1 : 1
                }}
                transition={{ duration: 0.7 }}
            />

            {/* Decorative lines */}
            <div className="absolute top-0 left-0 w-32 h-32">
                <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-[#C5A28A]/20 rounded-tl-3xl" />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32">
                <div className="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-[#C5A28A]/20 rounded-br-3xl" />
            </div>

            <div className="relative">
                <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} 
                              flex items-center justify-center text-white text-2xl
                              shadow-lg shadow-[#C5A28A]/20 mb-6`}
                >
                    {icon}
                </motion.div>

                <h3 className="text-xl font-light text-[#2C2C2C] mb-3 tracking-wide">{title}</h3>
                <p className="text-[#8F6B58] text-sm leading-relaxed font-light">{desc}</p>

                <motion.div
                    className="absolute -bottom-2 -right-2 w-20 h-20"
                    animate={{ rotate: isHovered ? 45 : 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-10">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#C5A28A" strokeWidth="1" />
                    </svg>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Team Member Card
function TeamMember({ name, role, description, image }: { name: string; role: string; description: string; image?: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={premiumScale}
            whileHover={{ y: -8 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative bg-white rounded-3xl p-8 shadow-xl shadow-black/5
                     border border-[#E8D5C4]/20 hover:border-[#C5A28A]/50
                     transition-all duration-700 overflow-hidden"
        >
            {/* Background gradient animation */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#F9F5F0] to-[#F0E7DD]"
                animate={{
                    opacity: isHovered ? 1 : 0.5,
                    scale: isHovered ? 1.1 : 1
                }}
                transition={{ duration: 0.7 }}
            />

            {/* Decorative lines */}
            <div className="absolute top-0 left-0 w-32 h-32">
                <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-[#C5A28A]/20 rounded-tl-3xl" />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32">
                <div className="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-[#C5A28A]/20 rounded-br-3xl" />
            </div>

            <div className="relative text-center">
                <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                              flex items-center justify-center text-white text-3xl font-light mb-6
                              shadow-lg shadow-[#C5A28A]/20 overflow-hidden"
                >
                    {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        name.charAt(0)
                    )}
                </motion.div>

                <h3 className="text-xl font-light text-[#2C2C2C] mb-2 tracking-wide">{name}</h3>
                <p className="text-[#8F6B58] text-sm font-light mb-4">{role}</p>
                <p className="text-[#2C2C2C] text-sm font-light leading-relaxed">{description}</p>

                <div className="mt-6 flex justify-center gap-3">
                    {['linkedin', 'twitter'].map((social) => (
                        <motion.a
                            key={social}
                            href="#"
                            whileHover={{ y: -3 }}
                            className="w-8 h-8 rounded-full border border-[#E8D5C4]/30
                                     flex items-center justify-center text-[#8F6B58]
                                     hover:bg-gradient-to-r hover:from-[#C5A28A] hover:to-[#B88E72]
                                     hover:border-transparent hover:text-white
                                     transition-all duration-500"
                        >
                            <span className="sr-only">{social}</span>
                            <span className="text-xs">{social[0].toUpperCase()}</span>
                        </motion.a>
                    ))}
                </div>
            </div>

            <motion.div
                className="absolute -bottom-2 -right-2 w-20 h-20"
                animate={{ rotate: isHovered ? 45 : 0 }}
                transition={{ duration: 0.5 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-10">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#C5A28A" strokeWidth="1" />
                </svg>
            </motion.div>
        </motion.div>
    );
}

// Stat Card
function StatCard({ number, label }: { number: string; label: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={premiumScale}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative text-center p-6 rounded-2xl overflow-hidden
                     bg-white/50 backdrop-blur-sm border border-[#E8D5C4]/20
                     hover:border-[#C5A28A]/30 transition-all duration-500"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#C5A28A]/5 to-[#B88E72]/5"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                <div className="text-4xl lg:text-5xl font-light text-[#C5A28A]">{number}</div>
                <div className="mt-2 text-sm text-[#8F6B58] font-light tracking-wide">{label}</div>
            </motion.div>
        </motion.div>
    );
}

// Timeline Item
function TimelineItem({ year, title, description, index }: { year: string; title: string; description: string; index: number }) {
    return (
        <motion.div
            variants={premiumFadeUp}
            className="relative pl-8 pb-12 last:pb-0"
        >
            {/* Timeline line */}
            {index < 2 && (
                <div className="absolute left-3 top-3 bottom-0 w-px bg-gradient-to-b from-[#C5A28A] to-transparent" />
            )}

            {/* Timeline dot */}
            <motion.div
                className="absolute left-0 top-3 w-6 h-6 rounded-full bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                          flex items-center justify-center shadow-lg shadow-[#C5A28A]/30"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="w-2 h-2 rounded-full bg-white" />
            </motion.div>

            <div className="text-sm text-[#8F6B58] font-light mb-2">{year}</div>
            <h3 className="text-lg font-light text-[#2C2C2C] mb-2">{title}</h3>
            <p className="text-[#2C2C2C] text-sm font-light leading-relaxed opacity-70">{description}</p>
        </motion.div>
    );
}

export default function About() {
    const heroRef = useRef(null);

    return (
        <div className="min-h-screen bg-[#FDFAF7] text-[#2C2C2C] font-light overflow-x-hidden">
            <LandingNavbar />
            <StickyCTA />

            {/* HERO Section */}
            <section ref={heroRef} className="relative px-4 sm:px-6 pt-40 pb-20 overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 -z-10">
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

                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <PremiumBadge className="mb-8">
                            Մեր պատմությունը
                        </PremiumBadge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight tracking-tight"
                    >
                        Կատարելության
                        <span className="block text-[#8F6B58]">ձգտող թիմ</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-8 text-lg sm:text-xl text-[#8F6B58] max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        BeautyBook-ը ստեղծվել է գեղեցկության սրահների համար՝
                        ամրագրումները ավտոմատացնելու, աշխատակիցներին կառավարելու և
                        սրահի աշխատանքը դարձնելու պարզ ու վերահսկելի։
                    </motion.p>
                </div>
            </section>

            {/* STATS Section */}
            <section className="py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard number="50+" label="Ակտիվ սրահներ" />
                        <StatCard number="10k+" label="Ամրագրումներ" />
                        <StatCard number="98%" label="Գոհ հաճախորդներ" />
                        <StatCard number="24/7" label="Աջակցություն" />
                    </div>
                </div>
            </section>

            {/* MISSION/VISION Section - Հիմա օգտագործում է PremiumFeatureCard */}
            <section className="py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        variants={premiumContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        <PremiumFeatureCard
                            icon="🎯"
                            title="Մեր առաքելությունը"
                            desc="Սրահներին տալ պարզ համակարգ, որպեսզի կենտրոնանան հաճախորդի վրա, ոչ թե քաոսի։"
                        />
                        <PremiumFeatureCard
                            icon="✨"
                            title="Մեր մոտեցումը"
                            desc="Մինիմալ, արագ, գեղեցիկ՝ առանց ավելորդ բարդությունների։"
                            gradient="from-[#B88E72] to-[#8F6B58]"
                        />
                        <PremiumFeatureCard
                            icon="💎"
                            title="Մեր արժեքները"
                            desc="Հուսալիություն, անվտանգություն, և մշտական զարգացում։"
                            gradient="from-[#8F6B58] to-[#C5A28A]"
                        />
                    </motion.div>
                </div>
            </section>

            {/* TIMELINE Section */}
            <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-[#FDFAF7]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <PremiumBadge className="mb-6">Մեր ճանապարհը</PremiumBadge>
                        <h2 className="text-4xl sm:text-5xl font-light text-[#2C2C2C] mb-6">
                            Ինչպես <span className="text-[#8F6B58]">սկսվեց</span> ամեն ինչ
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={premiumContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="ml-4"
                    >
                        <TimelineItem
                            index={0}
                            year="2023"
                            title="Գաղափարի ծնունդ"
                            description="BeautyBook-ի գաղափարը ծնվեց սրահների հետ զրույցներից, որտեղ հասկացանք, որ նրանք կարիք ունեն պարզ և արդյունավետ համակարգի։"
                        />
                        <TimelineItem
                            index={1}
                            year="2024"
                            title="Առաջին տարբերակը"
                            description="Մեկնարկեցինք առաջին տարբերակով՝ 5 սրահների հետ փորձարկման փուլով։"
                        />
                        <TimelineItem
                            index={2}
                            year="2025"
                            title="Աճ և զարգացում"
                            description="Այսօր մենք սպասարկում ենք 50+ սրահների և շարունակում ենք զարգանալ։"
                        />
                    </motion.div>
                </div>
            </section>

            {/* TEAM Section */}
            <section className="py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <PremiumBadge className="mb-6">Մեր թիմը</PremiumBadge>
                        <h2 className="text-4xl sm:text-5xl font-light text-[#2C2C2C] mb-6">
                            Պրոֆեսիոնալների <span className="text-[#8F6B58]">թիմ</span>
                        </h2>
                        <p className="text-lg text-[#8F6B58] font-light">
                            Մենք սիրում ենք այն, ինչ անում ենք և ձգտում ենք կատարելության
                        </p>
                    </motion.div>

                    <motion.div
                        variants={premiumContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                    >
                        <TeamMember
                            name="Աննա Մարտիրոսյան"
                            role="Հիմնադիր & CEO"
                            description="10+ տարվա փորձ beauty ինդուստրիայում։ Նպատակը՝ ստեղծել կատարյալ գործիք սրահների համար։"
                        />
                        <TeamMember
                            name="Արմեն Գրիգորյան"
                            role="Tech Lead"
                            description="Փորձառու ծրագրավորող, ով սիրում է ստեղծել գեղեցիկ և ֆունկցիոնալ լուծումներ։"
                        />
                        <TeamMember
                            name="Մարիամ Հակոբյան"
                            role="Customer Success"
                            description="Միշտ պատրաստ է օգնել և աջակցել մեր հաճախորդներին ցանկացած հարցում։"
                        />
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
                                 p-12 lg:p-16 overflow-hidden"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C5A28A]/10 to-[#B88E72]/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#8F6B58]/10 to-[#C5A28A]/10 rounded-full blur-3xl" />

                        <div className="relative text-center text-white">
                            <h2 className="text-3xl sm:text-4xl font-light mb-4">
                                Պատրա՞ստ եք սկսել
                            </h2>
                            <p className="text-lg text-[#E8D5C4] font-light max-w-2xl mx-auto mb-8">
                                Ստեղծիր հաշիվ, ավելացրու ծառայություններ և ստացիր booking հղումը 10 րոպեում։
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="group relative inline-flex items-center justify-center
                                             px-8 py-4 bg-white text-[#2C2C2C] rounded-full
                                             text-sm tracking-widest uppercase overflow-hidden
                                             transition-all duration-700 hover:bg-[#C5A28A] hover:text-white"
                                >
                                    <span className="relative z-10">Սկսել հիմա</span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-[#C5A28A] to-[#B88E72]"
                                        initial={{ x: "100%" }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="group inline-flex items-center gap-2 text-white
                                             hover:text-[#C5A28A] transition-colors duration-500"
                                >
                                    <span className="text-sm tracking-widest uppercase">Կապ մեզ հետ</span>
                                    <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}