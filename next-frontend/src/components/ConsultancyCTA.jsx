"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight } from 'lucide-react';
import { useConsultation } from '../context/ConsultationContext';

const ConsultancyCTA = () => {
    const { openModal } = useConsultation();

    return (
        <section className="w-full relative py-12 px-6 lg:px-12 bg-transparent overflow-hidden">
            <div className="container mx-auto relative z-10 max-w-7xl">
                <motion.div
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    viewport={{ once: true }}
                    className="relative p-[1.5px] rounded-[3.5rem] bg-gradient-to-r from-slate-400 via-white to-slate-400 shadow-2xl group overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-[3.4rem] p-8 lg:p-12 overflow-hidden relative">
                        {/* Decorative background Elements */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" />
                            </svg>
                        </div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-400/20 rounded-full blur-[80px]"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 text-center lg:text-left">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-6 mx-auto lg:mx-0">
                                    <Rocket className="w-4 h-4 text-white animate-bounce" />
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Expert Guidance</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight mb-4">
                                    Talk to Experts <span className="text-cyan-200">for Free</span>
                                </h2>
                                <p className="text-blue-50 text-base md:text-lg font-bold leading-relaxed max-w-2xl opacity-90">
                                    Get guidance from our experts and choose the best course for yourself.
                                </p>
                            </div>

                            <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
                                <button
                                    onClick={openModal}
                                    className="px-12 py-6 bg-white text-indigo-600 font-black rounded-2xl shadow-2xl hover:bg-slate-50 hover:scale-105 transition-all active:scale-95 text-sm uppercase tracking-[0.2em] flex items-center gap-3 group"
                                >
                                    Talk to Experts for Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em]">No commitment required • Quick Response</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ConsultancyCTA;
