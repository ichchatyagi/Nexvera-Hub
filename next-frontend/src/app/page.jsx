"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Star, Shield, Zap, Target, BookOpen, Users, Award, PresentationIcon } from 'lucide-react';
import { categoryData } from '@/data/categoryData';
import { useConsultation } from '@/context/ConsultationContext';
import ConsultancyCTA from '@/components/ConsultancyCTA';

const MetallicCard = ({ children, color = "from-blue-600 to-indigo-700", className = "", borderGradient = "from-slate-400 via-white to-slate-400" }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        className={`relative p-[1.5px] rounded-[2.5rem] bg-gradient-to-br ${borderGradient} shadow-2xl group overflow-hidden ${className}`}
    >
        <div className={`bg-gradient-to-br ${color} p-10 rounded-[2.4rem] h-full flex flex-col relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            {children}
        </div>
    </motion.div>
);

const Home = () => {
    const { openModal } = useConsultation();
    return (
        <div className="relative min-h-screen bg-transparent">
            {/* Hero Section */}
            <section className="relative pt-12 lg:pt-32 pb-24 overflow-hidden border-b border-slate-50">
                <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 z-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                            Professional Launchpad 🚀
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black leading-[0.85] mb-10 uppercase tracking-tighter">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">LEARN.</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">GROW.</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SUCCESS.</span>
                        </h1>

                        <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed font-medium">
                            The high-performance curriculum system for future professionals. Built on industry standards for immediate career momentum.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                onClick={openModal}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 text-white font-black text-xs uppercase tracking-widest px-14 py-6 rounded-2xl shadow-2xl shadow-blue-200 transition-all active:scale-95 text-center"
                            >
                                Get Started
                            </button>
                            <Link href="/about" className="bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest px-14 py-6 rounded-2xl hover:bg-slate-50 transition-all text-center">
                                Our Mission
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 relative flex justify-end">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative flex justify-center lg:justify-end">
                            <img
                                src="/images/home-hero-v3.png"
                                alt="Nexvera Hub Realistic Hero"
                                className="w-full max-w-[500px] h-auto rounded-[3.8rem] object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="py-20 lg:py-32">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block">Discovery Hub</span>
                        <h2 className="text-4xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter">
                            Explore <span className="text-white bg-slate-950 px-6 py-1 inline-block -skew-x-6">FUTURE</span> Courses
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {categoryData.slice(0, 11).map((cat, index) => (
                            <Link
                                href={{ pathname: '/course', query: { category: cat.name } }}
                                key={index}
                                className="group flex flex-col items-center justify-center gap-4 px-6 py-10 rounded-[2.5rem] font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 bg-white text-slate-600 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-xl hover:shadow-blue-500/5"
                            >
                                <span className="text-4xl filter group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-center">{cat.name}</span>
                            </Link>
                        ))}
                        <Link href="/course" className="flex flex-col items-center justify-center gap-4 px-6 py-10 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] bg-slate-950 text-white hover:bg-black transition-all">
                            <span className="text-4xl">🚀</span>
                            More
                        </Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 lg:py-24 border-y border-slate-50 overflow-hidden">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <div className="flex-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block">Our Ecosystem</span>
                            <h2 className="text-4xl lg:text-7xl font-black text-slate-950 mb-10 uppercase tracking-tighter leading-[0.9]">
                                Powered by <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Nexstar Media</span>
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed font-semibold max-w-xl">
                                Nexvera Hub is built on the foundation of professional excellence. As part of Nexstar Media, we deliver precise, industry-calibrated learning experiences that prepare you for the next generation of professional challenges.
                            </p>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="p-10 rounded-[3rem] bg-white border-[3px] border-blue-500 text-slate-900 flex flex-col justify-end h-72 hover:-translate-y-2 transition-transform duration-500 shadow-2xl shadow-blue-500/10">
                                <Shield className="w-10 h-10 mb-8 text-blue-600" />
                                <h4 className="text-2xl font-black uppercase tracking-tighter">Verified Systems</h4>
                            </div>
                            <div className="p-10 rounded-[3rem] bg-white border-[3px] border-cyan-400 text-slate-900 flex flex-col justify-end h-72 hover:-translate-y-2 transition-transform duration-500 delay-75 shadow-2xl shadow-cyan-500/10">
                                <Zap className="w-10 h-10 mb-8 text-cyan-500" />
                                <h4 className="text-2xl font-black uppercase tracking-tighter">Real-Time Insight</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-20 lg:py-32 bg-transparent text-slate-900">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-24">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block">Performance Metrics</span>
                        <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter">Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Nexvera Hub?</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Standardized Tech", desc: "Curriculum aligned with current industry stacks.", icon: <Shield className="w-6 h-6" />, color: "text-red-600", border: "border-red-500" },
                            { title: "Rapid Momentum", desc: "Accelerate your learning curve with focused modules.", icon: <Zap className="w-6 h-6" />, color: "text-blue-600", border: "border-blue-500" },
                            { title: "Targeted Skills", desc: "No fluff. Just the competencies required for roles.", icon: <Target className="w-6 h-6" />, color: "text-slate-900", border: "border-slate-800" },
                            { title: "Infinite Growth", desc: "Unlock lifetime access to our professional hub.", icon: <BookOpen className="w-6 h-6" />, color: "text-purple-600", border: "border-purple-500" },
                            { title: "Elite Network", desc: "Connect with thousands of future professionals.", icon: <Users className="w-6 h-6" />, color: "text-pink-600", border: "border-pink-500" },
                            { title: "Verified Identity", desc: "Get certificates that stand out to future recruiters.", icon: <Award className="w-6 h-6" />, color: "text-orange-600", border: "border-orange-500" }
                        ].map((feat, idx) => (
                            <div key={idx} className={`p-12 rounded-[3.5rem] bg-white border-[3px] ${feat.border} hover:shadow-2xl transition-all duration-500 group`}>
                                <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 shadow-sm group-hover:scale-110 transition-transform ${feat.color}`}>
                                    {feat.icon}
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{feat.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How You Learn Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 bg-slate-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4 text-center">
                            How You <span className="text-blue-600">Learn</span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <MetallicCard color="from-indigo-600 to-indigo-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                                    <PresentationIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Online Mode</h3>
                            </div>
                            <p className="text-white/80 text-lg font-medium leading-relaxed mb-6">
                                Students attend live classes through <strong className="text-white underline decoration-white/30 underline-offset-4">Google Meet</strong>, where mentors guide them through lessons, discussions, and practical learning sessions.
                            </p>
                        </MetallicCard>

                        <MetallicCard color="from-fuchsia-600 to-purple-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Offline Mode</h3>
                            </div>
                            <p className="text-white/80 text-lg font-medium leading-relaxed mb-6">
                                Students receive <strong className="text-white underline decoration-white/30 underline-offset-4">structured course content, notes, and learning materials</strong> that allow them to study at their own pace.
                            </p>
                        </MetallicCard>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 lg:py-24 bg-transparent border-t border-slate-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-wrap items-center justify-between gap-12">
                        {[
                            { label: '200+', sub: 'Courses', icon: '▶️', color: 'bg-blue-600' },
                            { label: '5k+', sub: 'Students', icon: '👥', color: 'bg-orange-500' },
                            { label: '50+', sub: 'Instructors', icon: '🎓', color: 'bg-amber-500' },
                            { label: '99%', sub: 'Certification', icon: '📈', color: 'bg-pink-500' },
                            { label: '200+', sub: 'Expert Courses', icon: '✨', color: 'bg-indigo-600' }
                        ].map((stat, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-2xl text-white mb-6 transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-6`}>
                                    {stat.icon}
                                </div>
                                <h4 className="text-3xl font-black text-slate-900">{stat.label}</h4>
                                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <ConsultancyCTA />
        </div>
    );
};

export default Home;
