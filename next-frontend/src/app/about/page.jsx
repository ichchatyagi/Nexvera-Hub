"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Rocket,
    Target,
    Lightbulb,
    Users,
    Clock,
    CheckCircle,
    Award,
    GraduationCap,
    Globe,
    BookOpen,
    ShieldCheck,
    ArrowRight,
    Star,
    Zap,
    Briefcase,
    Layout,
    ChevronRight,
    MonitorIcon,
    PresentationIcon,
    Sparkles,
    Cpu,
    Boxes
} from 'lucide-react';
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

const TransparentCard = ({ children, borderGradient = "from-slate-400 via-white to-slate-400", className = "" }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`relative p-[1.5px] rounded-[2.5rem] bg-gradient-to-br ${borderGradient} shadow-xl group overflow-hidden ${className}`}
    >
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[2.4rem] h-full flex flex-col relative transition-colors group-hover:bg-white/10">
            {children}
        </div>
    </motion.div>
);

const MissionCard = ({ icon: Icon, title, description, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="relative p-[1.5px] rounded-[2.5rem] bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-xl"
    >
        <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.4rem] h-full relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20 shadow-inner group-hover:rotate-12 transition-transform">
                <Icon size={24} />
            </div>
            <h4 className="text-xl font-black text-white mb-3 leading-tight uppercase tracking-tight tracking-tighter">{title}</h4>
            <p className="text-white/80 text-xs font-black uppercase tracking-tight leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const AboutNexvera = () => {
    const missions = [
        { icon: BookOpen, title: "Practical Learning", description: "We focus on hands-on learning so students gain real skills instead of just theoretical knowledge.", color: "from-blue-600 to-indigo-700" },
        { icon: Users, title: "Live Mentorship", description: "Students receive guidance from mentors to help them understand concepts and grow confidently.", color: "from-emerald-600 to-teal-700" },
        { icon: Clock, title: "Flexible Formats", description: "Students can choose learning methods that suit their schedule and preferences.", color: "from-purple-600 to-violet-700" },
        { icon: ShieldCheck, title: "Confidence Building", description: "Our programs are designed to help students develop confidence in their abilities.", color: "from-amber-500 to-orange-600" },
        { icon: Briefcase, title: "Internship Experience", description: "Students get exposure to internship-level learning and practical project experience.", color: "from-rose-500 to-pink-600" },
        { icon: Award, title: "Certification", description: "After successfully completing the course, students receive certification validating their skills.", color: "from-cyan-600 to-blue-700" }
    ];

    const whyPoints = [
        "Practical and career-focused learning",
        "Structured courses for all levels",
        "Mentorship and learning support",
        "Real-world project experience",
        "Certification after completion"
    ];

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-6 lg:pt-12 pb-20 px-6 lg:px-12 overflow-hidden">
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black mb-8 border border-blue-100 shadow-sm uppercase tracking-[0.3em]"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                                Nexstar Media Presents
                            </motion.div>

                            <div className="relative inline-block mb-10">
                                <div className="absolute inset-0 bg-blue-400 blur-[100px] opacity-20 -z-10 rounded-full"></div>
                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-950 leading-[0.9] mb-8 uppercase tracking-tighter"
                                >
                                    Introducing <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Nexvera Hub</span>
                                </motion.h1>
                            </div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-slate-500 font-bold leading-relaxed max-w-2xl lg:mx-0 mx-auto mb-12 uppercase tracking-tight"
                            >
                                A modern learning platform designed to empower students with <span className="text-blue-600">practical skills</span>, real-world knowledge, and career-focused education.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6"
                            >
                                <Link href="/course" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-12 py-5 rounded-2xl shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-xs group">
                                    Explore Courses
                                    <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>

                        <div className="flex-1 w-full max-w-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative"
                            >
                                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-400/10 via-purple-400/10 to-indigo-400/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                                <img
                                    src="https://illustrations.popsy.co/blue/creative-work.svg"
                                    alt="Nexvera Creativity"
                                    className="w-full h-auto drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-400/10 blur-[120px] rounded-full"></div>
            </section>

            {/* Vision & Belief */}
            <section className="py-12 px-6 lg:px-12">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-10">
                        <MetallicCard color="from-blue-600 to-blue-800">
                            <Target className="w-14 h-14 text-white/40 mb-8" />
                            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Our Vision</h2>
                            <p className="text-white/80 text-lg font-black uppercase tracking-tight leading-relaxed">
                                Our vision is to create a learning ecosystem where students can develop real-world skills, gain confidence, and prepare themselves for modern career opportunities in technology and digital industries.
                            </p>
                        </MetallicCard>

                        <MetallicCard color="from-teal-600 to-teal-800">
                            <Lightbulb className="w-14 h-14 text-white/40 mb-8" />
                            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Our Belief</h2>
                            <p className="text-white/80 text-lg font-black uppercase tracking-tight leading-relaxed">
                                At Nexvera Hub, we believe learning should go beyond theory. Students should gain practical knowledge, real experience, and the confidence to apply their skills in real-world situations.
                            </p>
                        </MetallicCard>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 lg:py-32 px-6 lg:px-12">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter mb-4 text-center">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Mission</span>
                        </h2>
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] text-center">Empowering the next generation of global talent</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {missions.map((mission, idx) => (
                            <MissionCard key={idx} {...mission} />
                        ))}
                    </div>
                </div>
            </section>

            {/* How You Learn */}
            <section className="py-16 lg:py-32 px-6 lg:px-12 bg-slate-50/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter mb-4 text-center">
                            How You <span className="text-blue-600">Learn</span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <MetallicCard color="from-indigo-600 to-indigo-800">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                                    <PresentationIcon size={32} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Online Mode</h3>
                            </div>
                            <p className="text-white/90 text-lg font-black uppercase tracking-tight leading-relaxed mb-6">
                                Students attend live classes through <span className="text-white underline decoration-white/40 underline-offset-8">Google Meet</span>, where mentors guide them through lessons, discussions, and practical learning sessions.
                            </p>
                        </MetallicCard>

                        <MetallicCard color="from-fuchsia-600 to-purple-800">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-inner">
                                    <BookOpen size={32} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Offline Mode</h3>
                            </div>
                            <p className="text-white/90 text-lg font-black uppercase tracking-tight leading-relaxed mb-6">
                                Students receive <span className="text-white underline decoration-white/40 underline-offset-8">structured course content</span>, notes, and learning materials that allow them to study at their own pace.
                            </p>
                        </MetallicCard>
                    </div>
                </div>
            </section>

            {/* Why Choose */}
            <section className="py-20 lg:py-32 px-6 lg:px-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter mb-10 text-center lg:text-left">
                                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Nexvera</span>
                            </h2>
                            <div className="space-y-6">
                                {whyPoints.map((point, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-5 group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            <CheckCircle size={20} />
                                        </div>
                                        <span className="text-lg font-black uppercase tracking-tight text-slate-800">{point}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <TransparentCard borderGradient="from-blue-200 via-slate-100 to-blue-200">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Users size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Founding Team Message</h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-6 top-0 text-8xl text-blue-500/10 font-black select-none">"</div>
                                    <p className="text-slate-500 text-xl font-black uppercase tracking-tight leading-relaxed italic relative z-10 pl-4 py-4">
                                        Nexvera Hub is proudly created by <span className="text-blue-600">Nexstar Media</span> with the vision of building a modern learning platform that helps students grow and prepare for future career opportunities.
                                    </p>
                                </div>
                            </TransparentCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certification Highlight */}
            <section className="py-16 lg:py-32 px-6 lg:px-12 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <MetallicCard
                        color="from-cyan-500 via-blue-600 to-indigo-700"
                        className="text-center overflow-visible"
                    >
                        <motion.div
                            className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-blue-600 shadow-2xl border border-slate-100 group-hover:rotate-12 transition-transform"
                        >
                            <Award size={48} />
                        </motion.div>

                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 uppercase tracking-tighter pt-12 text-center mt-4 uppercase">Certification After Completion</h2>

                        <div className="max-w-4xl mx-auto space-y-8">
                            <p className="text-white/90 text-2xl font-black uppercase tracking-tight leading-relaxed text-center tracking-tighter">
                                Students who successfully complete their course and learning program receive a <span className="text-white underline underline-offset-8 decoration-white/40">Nexvera Hub certification</span> that validates their skills and project experience.
                            </p>
                            <div className="flex justify-center flex-wrap gap-4 pt-4">
                                {["Portfolios", "Resumes", "Professional Profiles"].map((tag, i) => (
                                    <span key={i} className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Animated Sparkles */}
                        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping"></div>
                        <div className="absolute bottom-20 right-20 w-3 h-3 bg-white rounded-full animate-ping delay-500"></div>
                        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-1000"></div>
                    </MetallicCard>
                </div>
            </section>
            
            <ConsultancyCTA />
        </div>
    );
};

export default AboutNexvera;
