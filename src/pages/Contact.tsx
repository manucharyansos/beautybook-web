// pages/Contact.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import Navigation from "../components/Navigation";

export default function Contact() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log(formData);
    };

    return (
        <div className="min-h-screen bg-[#FDFAF7]">
            <Navigation isScrolled={isScrolled} />

            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-6xl font-light text-[#2C2C2C] mb-6">
                            Կապ <span className="text-[#C5A28A]">մեզ հետ</span>
                        </h1>
                        <p className="text-xl text-[#8F6B58] font-light">
                            Մենք միշտ ուրախ ենք օգնել
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8D5C4]/30">
                                <h2 className="text-2xl font-light text-[#2C2C2C] mb-6">Կոնտակտներ</h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                  flex items-center justify-center flex-shrink-0">
                                            <Phone size={20} className="text-[#C5A28A]" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-[#8F6B58] mb-1">Հեռախոս</div>
                                            <a href="tel:+37400000000" className="text-[#2C2C2C] hover:text-[#C5A28A]">
                                                +374 (00) 00-00-00
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                  flex items-center justify-center flex-shrink-0">
                                            <Mail size={20} className="text-[#C5A28A]" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-[#8F6B58] mb-1">Էլ․ փոստ</div>
                                            <a href="mailto:info@beautybook.am" className="text-[#2C2C2C] hover:text-[#C5A28A]">
                                                info@beautybook.am
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                  flex items-center justify-center flex-shrink-0">
                                            <MapPin size={20} className="text-[#C5A28A]" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-[#8F6B58] mb-1">Հասցե</div>
                                            <p className="text-[#2C2C2C]">
                                                Երևան, Հայաստան<br />
                                                Բաղրամյան 26
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                  flex items-center justify-center flex-shrink-0">
                                            <Clock size={20} className="text-[#C5A28A]" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-[#8F6B58] mb-1">Աշխատանքային ժամեր</div>
                                            <p className="text-[#2C2C2C]">
                                                Երկ-Ուրբ: 10:00 - 19:00<br />
                                                Շաբաթ: 11:00 - 16:00
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-[#C5A28A] to-[#B88E72] rounded-3xl p-8 text-white">
                                <MessageCircle size={32} className="mb-4" />
                                <h3 className="text-xl font-light mb-2">24/7 Աջակցություն</h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Մենք միշտ այստեղ ենք Ձեզ համար
                                </p>
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full
                           text-sm hover:bg-white/30 transition-colors"
                                >
                                    Սկսել chat-ը
                                </a>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl p-8 shadow-lg border border-[#E8D5C4]/30"
                        >
                            <h2 className="text-2xl font-light text-[#2C2C2C] mb-6">Ուղարկել հաղորդագրություն</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm text-[#8F6B58] mb-2">Անուն</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-[#E8D5C4]/30
                             focus:border-[#C5A28A] outline-none transition-colors"
                                        placeholder="Ձեր անունը"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#8F6B58] mb-2">Էլ․ փոստ</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-[#E8D5C4]/30
                             focus:border-[#C5A28A] outline-none transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#8F6B58] mb-2">Հաղորդագրություն</label>
                                    <textarea
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-[#E8D5C4]/30
                             focus:border-[#C5A28A] outline-none transition-colors resize-none"
                                        placeholder="Ինչպե՞ս կարող ենք օգնել..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4
                           bg-gradient-to-r from-[#C5A28A] to-[#B88E72] text-white
                           rounded-xl hover:shadow-lg transition-all"
                                >
                                    <Send size={18} />
                                    Ուղարկել
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}