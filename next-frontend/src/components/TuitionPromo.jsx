"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { useConsultation } from '@/context/ConsultationContext';

const TuitionPromo = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { openModal } = useConsultation();

    useEffect(() => {
        // Check if user has already closed the promo
        const isHidden = localStorage.getItem('hideTuitionPromo');
        if (isHidden) return;

        // Show after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        localStorage.setItem('hideTuitionPromo', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed bottom-10 right-10 z-[100] w-full max-w-[320px] group"
                >
                    <div className="relative p-[1.5px] rounded-[2.5rem] bg-gradient-to-br from-blue-400 via-white to-cyan-400 shadow-2xl overflow-hidden active:scale-95 transition-all">
                        <div 
                            onClick={openModal}
                            className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.4rem] cursor-pointer relative overflow-hidden group-hover:bg-white transition-colors"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            
                            {/* Close Button */}
                            <button 
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100/50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all z-20"
                                aria-label="Close promotion"
                            >
                                <X size={16} />
                            </button>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                                        <Sparkles size={10} className="text-blue-600" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Premium Tutoring</span>
                                    </div>
                                </div>

                                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tighter leading-[1.1] mb-2">
                                    Home & Online <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tuition</span> Available
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mb-6 opacity-80 decoration-blue-100">
                                    Expert Mentorship for Classes 5–12 • All Major Boards
                                </p>

                                <div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                                    Book Free Demo <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TuitionPromo;
