"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    GraduationCap, 
    BadgeCheck, 
    Users, 
    ShieldCheck, 
    Sparkles, 
    Clock, 
    ArrowRight,
    Search,
    UserCheck,
    Award,
    PresentationIcon
} from 'lucide-react';
import MetallicCard from '@/components/MetallicCard';
import ConsultancyCTA from '@/components/ConsultancyCTA';

const LaunchingCard = ({ title, icon: Icon, color, metallicGlow, type }) => (
    <MetallicCard color={color} borderGradient={metallicGlow} className="w-full">
        <div className="flex flex-col items-center text-center py-4 relative z-10">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-8">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/20 shadow-lg">
                    {type}
                </span>
                <div className="flex items-center gap-1 text-white/90 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Pending Release
                </div>
            </div>

            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/30 text-white shadow-2xl">
                <Icon className="w-10 h-10" />
            </div>

            <h3 className="text-2xl lg:text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-tight">
                {title}
            </h3>
            
            <p className="text-white/90 text-lg font-bold leading-relaxed mb-10 max-w-sm">
                We are launching our educators' names and profiles soon.
            </p>

            <div className="w-full h-px bg-white/10 mb-8"></div>
            
            <div className="flex items-center gap-3 text-white/50 font-black uppercase tracking-[0.3em] text-[10px]">
                Stay Tuned <ArrowRight className="w-4 h-4" />
            </div>
        </div>
    </MetallicCard>
);

const SectionHeader = ({ title, subtitle, badge, icon: Icon }) => (
    <div className="flex flex-col items-start text-left mb-12">
        {badge && (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-100 shadow-sm"
            >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {badge}
            </motion.div>
        )}
        <h2 className="text-3xl lg:text-5xl font-black text-slate-800 mb-6 uppercase tracking-tighter leading-tight">
            {title}
        </h2>
        <p className="text-slate-800 text-lg font-semibold max-w-xl leading-relaxed">
            {subtitle}
        </p>
    </div>
);

const OurEducators = () => {
    return (
        <div className="bg-transparent overflow-hidden pb-20">
            {/* Hero Section */}
            <section className="relative pt-6 lg:pt-12 pb-4 px-6 lg:px-12 overflow-visible">
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm border border-blue-100"
                            >
                                <Users className="w-4 h-4" />
                                Elite Faculty Network
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.8 }}
                                className="text-4xl lg:text-7xl font-black leading-[0.85] mb-10 tracking-tighter uppercase"
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500">World Class</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Mentorship</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-500 font-medium leading-relaxed mb-16 max-w-2xl lg:mx-0 mx-auto tracking-tight"
                            >
                                Bridging the gap between theory and industry. Our educators are current practitioners from leading global tech companies.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center lg:justify-start gap-6"
                            >
                                <Link href="/course" className="group bg-gradient-to-r from-blue-700 to-blue-900 border border-white/10 text-white font-black px-10 py-5 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-4 uppercase tracking-widest text-xs">
                                    View Courses
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/contact" className="bg-white border border-slate-200 text-slate-800 font-black px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-4 uppercase tracking-widest text-xs">
                                    Become a Mentor
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </Link>
                            </motion.div>
                        </div>

                        <div className="flex-1 relative flex justify-center lg:justify-end w-full">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative w-full max-w-xl group"
                            >
                                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-400/10 via-cyan-400/10 to-indigo-400/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                                <img
                                    src="https://illustrations.popsy.co/blue/presentation.svg"
                                    alt="Nexvera Mentorship"
                                    className="w-full max-w-md lg:max-w-full mx-auto h-auto drop-shadow-2xl group-hover:translate-y-[-10px] transition-transform duration-500"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simplified Educator Tiers Side-by-Side */}
            <section className="pt-8 pb-20 px-6 lg:px-12 bg-transparent relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start pb-20">
                        
                        {/* Growth Level Section */}
                        <div className="flex flex-col">
                            <SectionHeader 
                                title="Growth Level"
                                subtitle="Elite industry practitioners providing high-growth mentorship. Private enrollment details revealed to students."
                                badge="Exclusive Tier"
                                icon={GraduationCap}
                            />
                            
                            <div className="w-full">
                                <LaunchingCard 
                                    type="Growth Level"
                                    title="Exclusive Network"
                                    icon={GraduationCap}
                                    color="from-blue-900 to-slate-950"
                                    metallicGlow="from-slate-400 via-white to-slate-400"
                                />
                            </div>
                        </div>

                        {/* Verified Premium Faculty */}
                        <div className="flex flex-col">
                            <SectionHeader 
                                title="Verified Faculty"
                                subtitle="Highly vetted educators with verified credentials and exceptional teaching track records."
                                badge="Premium Tier"
                                icon={UserCheck}
                            />

                            <div className="w-full">
                                <LaunchingCard 
                                    type="Premium Level"
                                    title="Verified Experts"
                                    icon={ShieldCheck}
                                    color="from-cyan-600 to-blue-800"
                                    metallicGlow="from-cyan-300 via-white to-blue-400"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Verified Footer */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-block p-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl">
                            <div className="bg-white px-8 py-5 rounded-[0.9rem] shadow-xl">
                                <Link href="/contact" className="flex items-center gap-5 group">
                                    <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                                        <BadgeCheck className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-slate-900 font-black uppercase tracking-[0.1em] text-[11px] md:text-sm text-left">
                                        All educators are background verified. <br />
                                        <span className="text-blue-600 underline">Apply to join as a faculty member</span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <ConsultancyCTA />
        </div>
    );
};

export default OurEducators;
