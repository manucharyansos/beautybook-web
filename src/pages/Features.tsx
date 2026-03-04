// pages/Features.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Sparkles, Award, Calendar, Users, TrendingUp,
    Shield, Clock, Smartphone, Zap, ChevronRight
} from "lucide-react";
import Navigation from "../components/Navigation";

export default function Features() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            category: "Ընդհանուր",
            items: [
                { icon: Calendar, title: "Խելացի օրացույց", description: "Հեշտ կառավարեք ամրագրումները իրական ժամանակում" },
                { icon: Users, title: "Աշխատակիցների կառավարում", description: "Աշխատակիցների գրաֆիկ և աշխատաժամանակ" },
                { icon: TrendingUp, title: "Վերլուծություն", description: "Մանրամասն վիճակագրություն և հաշվետվություններ" },
                { icon: Shield, title: "Անվտանգություն", description: "Տվյալների պաշտպանություն և գաղտնագրում" },
                { icon: Clock, title: "Հիշեցումներ", description: "Ավտոմատ SMS և email հիշեցումներ" },
                { icon: Smartphone, title: "Բջջային հավելված", description: "Կառավարեք բիզնեսը ցանկացած վայրից" },
            ]
        },
        {
            category: "Beauty-ի համար",
            icon: Sparkles,
            items: [
                { title: "Բազմակի ծառայություններ", description: "Միաժամանակ մի քանի ծառայություն ամրագրել" },
                { title: "Լոյալության քարտեր", description: "Բոնուսային համակարգ և զեղչեր" },
                { title: "Նվերի վկայագրեր", description: "Թվային նվեր քարտերի վաճառք" },
            ]
        },
        {
            category: "Dental-ի համար",
            icon: Award,
            items: [
                { title: "Աթոռների կառավարում", description: "Սենյակների և աթոռների ամրագրում" },
                { title: "Պացիենտի քարտ", description: "Էլեկտրոնային բժշկական քարտ" },
                { title: "Բուժման պլաններ", description: "Բուժման փուլերի պլանավորում" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFAF7]">
            <Navigation isScrolled={isScrolled} />

            {/* Header */}
            <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-[#FDFAF7] to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-[#C5A28A]/10
                       border border-[#C5A28A]/20 text-[#8F6B58] text-sm mb-6"
                    >
                        <Zap size={14} className="mr-2" />
                        Առանձնահատկություններ
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-light text-[#2C2C2C] mb-6"
                    >
                        Ամեն ինչ Ձեր <span className="text-[#C5A28A]">բիզնեսի</span> համար
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-[#8F6B58] font-light"
                    >
                        SmartBook-ը տրամադրում է բոլոր անհրաժեշտ գործիքները
                    </motion.p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto space-y-20">
                    {features.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-10">
                                {section.icon && (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A] to-[#B88E72]
                                flex items-center justify-center text-white">
                                        <section.icon size={24} />
                                    </div>
                                )}
                                <h2 className="text-3xl font-light text-[#2C2C2C]">{section.category}</h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-2xl p-8 shadow-lg border border-[#E8D5C4]/30
                             hover:border-[#C5A28A]/30 transition-all duration-300"
                                    >
                                        {feature.icon && (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                    flex items-center justify-center mb-4">
                                                <feature.icon size={24} className="text-[#C5A28A]" />
                                            </div>
                                        )}
                                        <h3 className="text-xl font-light text-[#2C2C2C] mb-3">{feature.title}</h3>
                                        <p className="text-[#8F6B58] text-sm leading-relaxed">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-[#C5A28A]/10 to-[#B88E72]/10
                     rounded-3xl p-12 border border-[#C5A28A]/20"
                    >
                        <h3 className="text-3xl font-light text-[#2C2C2C] mb-4">
                            Պատրա՞ստ եք սկսել
                        </h3>
                        <p className="text-lg text-[#8F6B58] mb-8">
                            Միացեք 500+ բիզնեսների, որոնք արդեն օգտվում են SmartBook-ից
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r
                       from-[#C5A28A] to-[#B88E72] text-white rounded-full
                       hover:shadow-xl hover:shadow-[#C5A28A]/30 transition-all"
                        >
                            Սկսել անվճար փորձաշրջանը
                            <ChevronRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}