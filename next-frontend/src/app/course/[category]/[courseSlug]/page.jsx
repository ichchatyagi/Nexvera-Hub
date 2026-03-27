"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, Globe, Clock, Rocket, ChevronRight, Play, Info, BookOpen, Target, Sparkles, HelpCircle, Star, MessageSquare, X, ChevronDown, ShieldCheck, Layers, Zap, Binary, Settings, Trophy } from 'lucide-react';
import { getCourseDetails, getCourseBySlug } from '@/utils/courseDataUtils';
import coursesPricing from '@/data/coursePricingData';
import ConsultancyCTA from '@/components/ConsultancyCTA';

const CourseDetail = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const category = params.category;
    const courseSlug = params.courseSlug;
    const initialLevel = searchParams.get('level') || 'Beginner';
    const router = useRouter();

    const [course, setCourse] = useState(null);
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [openModuleIndex, setOpenModuleIndex] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState(initialLevel);

    const lessonCounts = { "Beginner": 8, "Intermediate": 15, "Advanced": 22 };

    const cleanTitle = (text) => {
        if (!text) return "";
        return text.replace(/^lesson\s*\d+\s*(?:AE)?\s*[:\-\s]*|AE/gi, "").trim();
    };

    const getModuleDuration = (idx) => {
        const durations = ['2.5 Hours', '2.0 Hours', '1.5 Hours', '3.0 Hours', '2.5 Hours', '2.0 Hours', '1.5 Hours', '3.0 Hours', '2.5 Hours', '2.0 Hours'];
        return durations[idx % durations.length];
    };

    useEffect(() => {
        if (!category || !courseSlug) return;

        const decodedCategory = decodeURIComponent(category);
        const courseInfo = getCourseBySlug(courseSlug);

        if (!courseInfo) {
            router.push('/course');
            return;
        }

        const details = getCourseDetails(decodedCategory, courseInfo.title, selectedLevel);

        if (!details) {
            router.push('/course');
            return;
        }

        // Fetch dynamic pricing
        const pricingInfo = coursesPricing.find(p => p.title === details.title);
        const dynamicPrices = pricingInfo ? pricingInfo.pricing : { "Beginner": 699, "Intermediate": 1299, "Advanced": 1799 };

        setCourse({
            ...details,
            level: selectedLevel,
            price: dynamicPrices[selectedLevel.toLowerCase()] || dynamicPrices[selectedLevel],
            lessonsCount: lessonCounts[selectedLevel]
        });
    }, [category, courseSlug, router, selectedLevel]);

    if (!course) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-black uppercase tracking-[0.2em]">Loading Engine...</div>;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <Info size={14} /> },
        { id: 'curriculum', label: 'Curriculum', icon: <BookOpen size={14} /> },
        { id: 'roadmap', label: 'Roadmap', icon: <Target size={14} /> },
        { id: 'projects', label: 'Projects', icon: <Rocket size={14} /> },
        { id: 'how-learn', label: 'How Learn', icon: <Layers size={14} /> },
        { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={14} /> },
        { id: 'faq', label: 'FAQ', icon: <HelpCircle size={14} /> }
    ];

    const themeColor = course.color || 'from-blue-600 to-indigo-700';

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
            {/* 1. TOP HERO SECTION */}
            <section className="relative pt-6 lg:pt-12 pb-16 lg:pb-24 overflow-hidden bg-slate-50">
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-transparent to-white opacity-40`}></div>
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
                        <div className="flex-1 text-center lg:text-left">
                            {/* Category Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-center lg:justify-start gap-2 mb-4"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">{course.category}</span>
                            </motion.div>

                            {/* Course Title - Massive Uppercase */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-[0.9] tracking-tighter text-slate-950 uppercase"
                            >
                                {course.title}
                            </motion.h1>

                            {/* Two-Line Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-500 text-sm md:text-lg font-medium max-w-2xl mb-8 leading-relaxed mx-auto lg:mx-0 shadow-none"
                            >
                                {course.description}
                            </motion.p>

                            {/* 3-Column Metadata Row (Exact Mockup Layout) */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-6 border-t border-slate-200"
                            >
                                {/* Column 1: Student Ranking */}
                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Ranking</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-current" strokeWidth={0} />)}
                                        </div>
                                        <span className="text-xl font-black text-slate-900">{course.rating || '4.8'}</span>
                                    </div>
                                </div>

                                {/* Column 2: Learning Type */}
                                <div className="flex flex-col gap-3 md:border-l md:border-slate-200 md:pl-10 text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Learning Type</span>
                                    <span className="text-xl font-black text-slate-900 uppercase">Project-Based</span>
                                </div>

                                {/* Column 3: Availability */}
                                <div className="flex flex-col gap-3 md:border-l md:border-slate-200 md:pl-10 text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Availability</span>
                                    <span className="text-xl font-black text-blue-600 uppercase">Available Now</span>
                                </div>
                            </motion.div>

                            {/* CTA Actions and Pricing */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center justify-center lg:justify-start gap-12 mt-10"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-base font-medium text-slate-400 line-through decoration-slate-300">₹2,999</span>
                                    <span className="text-5xl font-black text-slate-950 tracking-tighter">₹{course.price}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsComingSoonOpen(true)}
                                        className={`px-10 py-5 rounded-2xl bg-gradient-to-r ${themeColor} text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3`}
                                    >
                                        Enroll Now
                                        <Rocket size={18} />
                                    </button>

                                    <button
                                        onClick={() => setIsComingSoonOpen(true)}
                                        className="px-10 py-5 rounded-2xl bg-white text-slate-900 border-2 border-slate-100 font-black text-xs uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center gap-3"
                                    >
                                        Trial Session
                                        <Play size={18} className="fill-current" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Hero Graphic - Rounded Icon Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full lg:w-[400px] aspect-square relative lg:-mt-44"
                        >
                            <div className="absolute inset-0 p-[2px] rounded-[3.5rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[3.4rem] flex items-center justify-center relative overflow-hidden group">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${themeColor} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`}></div>
                                    {course.image ? (
                                        <img 
                                            src={course.image} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-700 z-10 select-none"
                                        />
                                    ) : (
                                        <span className="text-[12rem] filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-700 z-10 select-none">
                                            {course.icon}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <div className="sticky top-20 z-40 bg-slate-50 border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex justify-center items-center gap-1 md:gap-4 py-4 overflow-x-auto no-scrollbar scroll-smooth">
                        {navItems.map((item) => {
                            const isActive = activeTab === item.id;
                            const activeGradient = course.color || 'from-blue-600 to-indigo-700';

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive ? `bg-gradient-to-r ${activeGradient} text-white shadow-xl shadow-blue-500/20 -translate-y-0.5` : 'text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
                                >
                                    <span className={isActive ? 'text-white/80' : 'text-slate-300'}>{item.icon}</span>
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="py-16 lg:py-24 bg-white min-h-[800px]">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col gap-16 lg:gap-24 relative">
                        {/* Main Content Column */}
                        <div className="w-full">
                            {/* Tab Content Rendering */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    {/* Overview Tab Content */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-16 py-8">
                                            {typeof course.overview === 'object' ? (
                                                <>
                                                    {/* Hook Section */}
                                                    <div className="max-w-4xl">
                                                        <h3 className="text-4xl lg:text-6xl font-black mb-12 uppercase tracking-tighter text-slate-950 leading-[0.9]">
                                                            {course.overview.hook}
                                                        </h3>

                                                        {/* Problem & Transformation */}
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                                                            <div className="p-10 rounded-[2.5rem] bg-rose-50 border border-rose-100/50">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 mb-6 block">The Challenge</span>
                                                                <p className="text-slate-800 text-lg font-bold leading-relaxed">{course.overview.problem}</p>
                                                            </div>
                                                            <div className={`p-10 rounded-[2.5rem] bg-gradient-to-br ${themeColor} text-white shadow-2xl shadow-blue-500/20`}>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-6 block">The Nexvera Edge</span>
                                                                <p className="text-white text-lg font-bold leading-relaxed">{course.overview.transformation}</p>
                                                            </div>
                                                        </div>

                                                        {/* What You Will Learn (Points) */}
                                                        <div className="mb-20">
                                                            <h4 className="text-2xl font-black mb-10 uppercase tracking-tight flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${themeColor} flex items-center justify-center text-white`}>
                                                                    <BookOpen size={18} />
                                                                </div>
                                                                What we teach in this {course.level} track
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {course.overview.whatYouWillLearn?.map((point, i) => (
                                                                    <div key={i} className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                                                                        <CheckCircle2 size={24} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                                                                        <span className="text-sm font-black uppercase tracking-tight text-slate-700 leading-tight">{point}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Method & Why Choose */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                                                            <div>
                                                                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                                                                    <Target size={14} /> Why this course?
                                                                </h5>
                                                                <p className="text-slate-600 text-sm font-bold leading-relaxed italic border-l-4 border-slate-200 pl-6">
                                                                    "{course.overview.whyChoose}"
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                                                                    <Rocket size={14} /> Learning Method
                                                                </h5>
                                                                <p className="text-slate-600 text-sm font-bold leading-relaxed pl-6">
                                                                    {course.overview.learningMethod}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Outcomes */}
                                                        <div className="p-12 rounded-[4rem] bg-slate-50 border-2 border-slate-100 relative overflow-hidden mb-16 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                                                            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${themeColor} blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                                            <div className="relative z-10">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 block font-inter">Career Advantage</span>
                                                                <h4 className="text-4xl font-black mb-8 uppercase tracking-tighter text-slate-950">Your <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Expected Outcomes</span></h4>
                                                                <p className="text-xl font-bold text-slate-600 leading-relaxed max-w-3xl">
                                                                    {course.overview.outcomes}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Closing Line */}
                                                        <div className="text-center py-10">
                                                            <p className={`text-2xl lg:text-3xl font-black italic bg-clip-text text-transparent bg-gradient-to-r ${themeColor} uppercase tracking-tight`}>
                                                                "{course.overview.closing}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Fallback for legacy string overviews */
                                                <div className="max-w-4xl">
                                                    <h3 className="text-3xl lg:text-4xl font-black mb-10 uppercase tracking-tighter text-slate-950">Engineering <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Mastery</span></h3>
                                                    <p className="text-slate-500 text-lg leading-relaxed font-bold italic mb-12">{course.overview}</p>
                                                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center gap-6">
                                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white shrink-0`}>
                                                            <Info size={24} />
                                                        </div>
                                                        <p className="text-sm font-black uppercase tracking-widest text-slate-600 leading-relaxed">
                                                            This course is currently undergoing an expansion to include our premium structured overview format. Check back soon for the core educational points!
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Curriculum Tab Content */}
                                    {activeTab === 'curriculum' && (
                                        <div className="max-w-4xl">
                                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                                                <div>
                                                    <h3 className="text-3xl lg:text-4xl font-black mb-4 uppercase tracking-tighter text-slate-950">Modular <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Curriculum</span></h3>
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{course.level} Engineering Track • {course.lessonStructure?.length} Professional Modules</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white border-2 border-slate-100 flex items-center gap-4 shadow-sm">
                                                    <Clock size={20} className="text-blue-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{course.lessonStructure?.length * 2} Recommended Hours</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {(course.lessonStructure || []).map((module, idx) => (
                                                    <div key={idx} className="relative p-8 px-10 rounded-[2.5rem] bg-white border-2 border-slate-50 hover:border-slate-200 transition-all group overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100">
                                                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${themeColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                        <div className="flex items-center gap-8">
                                                            <div className={`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-950 font-black text-base shrink-0 group-hover:scale-110 group-hover:bg-white transition-all`}>
                                                                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                                            </div>
                                                            <div className="text-left">
                                                                <h4 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{module.title}</h4>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60 group-hover:opacity-100 transition-opacity">Certified Learning Milestone • Section {idx + 1}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Roadmap Tab Content */}
                                    {activeTab === 'roadmap' && (
                                        <div className="max-w-5xl mx-auto">
                                            <div className="text-center mb-24">
                                                <h3 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tight text-slate-950">The <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>High-Velocity</span> Path</h3>
                                                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Your Accelerated Engineering Timeline</p>
                                            </div>

                                            <div className="relative">
                                                {/* Central Animated Line */}
                                                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-100 -translate-x-1/2 hidden lg:block">
                                                    <div className={`absolute top-0 left-0 w-full bg-gradient-to-b ${themeColor} h-1/4 rounded-full`}></div>
                                                </div>

                                                <div className="space-y-12 lg:space-y-0 relative">
                                                    {(course.roadmap || []).map((step, idx) => {
                                                        const isEven = idx % 2 === 0;
                                                        const icons = [<Zap key="1" />, <Binary key="2" />, <Settings key="3" />, <Trophy key="4" />];
                                                        
                                                        return (
                                                            <div key={idx} className={`flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-24 relative ${idx !== 0 ? 'lg:-mt-12' : ''}`}>
                                                                {/* Left Content (Odd) */}
                                                                <div className={`flex-1 w-full lg:w-auto order-2 ${isEven ? 'lg:order-1 lg:text-right' : 'lg:order-3 lg:text-left'}`}>
                                                                    <div className={`p-10 rounded-[3rem] bg-white border-2 border-slate-50 hover:border-slate-200 transition-all group shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden`}>
                                                                        <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-1 h-full bg-gradient-to-b ${themeColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${themeColor} mb-4 block`}>Phase 0{idx + 1} Achievement</span>
                                                                        <h4 className="text-2xl font-black text-slate-950 mb-4 uppercase tracking-tighter">{step.title}</h4>
                                                                        <p className="text-slate-500 text-lg leading-relaxed font-bold italic group-hover:text-slate-700 transition-colors">{step.desc}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Center Icon Block */}
                                                                <div className="relative z-20 order-1 lg:order-2">
                                                                    <div className={`w-20 h-20 rounded-[2.2rem] bg-white border-4 border-slate-50 flex items-center justify-center text-slate-950 shadow-2xl group transition-all duration-700 hover:rotate-12 hover:scale-110`}>
                                                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white shadow-inner`}>
                                                                            {React.cloneElement(icons[idx % icons.length], { size: 28 })}
                                                                        </div>
                                                                    </div>
                                                                    {/* Connecting Pulses */}
                                                                    <div className={`absolute -inset-4 bg-gradient-to-br ${themeColor} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity animate-pulse`}></div>
                                                                </div>

                                                                {/* Spacer for Staggering */}
                                                                <div className={`flex-1 hidden lg:block ${isEven ? 'order-3' : 'order-1'}`}></div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects Tab Content */}
                                    {activeTab === 'projects' && (
                                        <div className="max-w-5xl mx-auto">
                                            <div className="text-center mb-20">
                                                <h3 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tight text-slate-950">Portfolio <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Sprints</span></h3>
                                                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Real-World Engineering Challenges</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-12">
                                                {(course.projects || []).map((project, idx) => (
                                                    <div key={idx} className="group relative overflow-hidden rounded-[3.5rem] bg-white border-2 border-slate-50 hover:border-slate-200 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50">
                                                        <div className="flex flex-col lg:flex-row items-stretch">
                                                            {/* Project Image Section */}
                                                            <div className="w-full lg:w-[45%] h-[300px] lg:h-auto relative overflow-hidden bg-slate-100">
                                                                <img 
                                                                    src={project.image} 
                                                                    alt={project.title}
                                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div className={`hidden absolute inset-0 bg-gradient-to-br ${themeColor} opacity-10 flex items-center justify-center text-[10rem] p-12`}>🚀</div>
                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                                                                <div className="absolute top-8 left-8">
                                                                    <div className={`px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-xl`}>Sprint 0{idx + 1}</div>
                                                                </div>
                                                            </div>

                                                            {/* Project Info Section */}
                                                            <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center bg-white relative">
                                                                <div className={`w-1 h-16 absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-b ${themeColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                                                <h4 className="text-3xl lg:text-4xl font-black mb-6 uppercase tracking-tighter text-slate-950 leading-[0.9]">{project.title}</h4>
                                                                <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">{project.desc}</p>
                                                                
                                                                <div className="space-y-6">
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Integrated Skillset</p>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        {(project.tools || ["Core Tech", "DevStack", "Deployment"]).map(tool => (
                                                                            <div key={tool} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black uppercase tracking-tight text-slate-950 shadow-sm hover:shadow-md hover:bg-white transition-all group/btn`}>
                                                                                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${themeColor} shadow-lg shadow-blue-500/50`}></div>
                                                                                {tool}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* How Learn Tab Content */}
                                    {activeTab === 'how-learn' && (
                                        <div className="max-w-4xl">
                                            <h2 className="text-3xl lg:text-4xl font-black mb-12 uppercase tracking-tighter text-slate-950">The <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>High-Performance</span> Workflow</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {(course.whatYouLearn || []).map((outcome, i) => (
                                                    <div key={i} className="flex gap-8 p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all group hover:bg-white hover:shadow-2xl">
                                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                                            <CheckCircle2 size={28} />
                                                        </div>
                                                        <p className="text-slate-800 font-black text-base lg:text-lg leading-tight flex items-center uppercase tracking-tighter">{outcome}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews Tab Content */}
                                    {activeTab === 'reviews' && (
                                        <div className="max-w-5xl">
                                            <h3 className="text-3xl lg:text-4xl font-black mb-12 uppercase tracking-tighter text-slate-950">Student <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Success</span> Stories</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {(course.reviewsList || []).map((review, i) => (
                                                    <div key={i} className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:shadow-2xl transition-all hover:bg-white group">
                                                        <div className="flex items-center gap-6 mb-10">
                                                            <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white font-black text-xl shadow-xl`}>{review.user.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-black text-slate-900 uppercase tracking-tighter text-lg">{review.user}</p>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{review.date} • Verified Student</p>
                                                            </div>
                                                            <div className="ml-auto flex gap-1 text-amber-400">
                                                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" strokeWidth={0} />)}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 font-bold italic leading-relaxed text-lg group-hover:text-slate-950 transition-colors">"{review.comment}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* FAQ Tab Content */}
                                    {activeTab === 'faq' && (
                                        <div className="max-w-4xl">
                                            <h2 className="text-3xl lg:text-4xl font-black mb-12 uppercase tracking-tighter text-slate-950">Knowledge <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Baseline</span></h2>
                                            <div className="space-y-6">
                                                {(course.faqs || []).map((faq, idx) => (
                                                    <div key={idx} className="rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all group hover:bg-white">
                                                        <button
                                                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                                            className="w-full p-10 flex items-center justify-between gap-8 text-left"
                                                        >
                                                            <span className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight flex-1">{faq.q}</span>
                                                            <div className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-all ${openFaqIndex === idx ? 'bg-slate-900 text-white rotate-180' : ''}`}>
                                                                <ChevronDown size={20} />
                                                            </div>
                                                        </button>
                                                        <AnimatePresence>
                                                            {openFaqIndex === idx && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                                                    <div className="px-10 pb-10">
                                                                        <div className="pt-6 border-t border-slate-100">
                                                                            <p className="text-slate-500 font-bold italic leading-relaxed uppercase tracking-tight text-sm">
                                                                                {faq.a}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            {/* Coming Soon Modal */}
            <AnimatePresence>
                {isComingSoonOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComingSoonOpen(false)} className="absolute inset-0"></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] p-10 lg:p-12 text-center overflow-hidden border-[2px] border-slate-100 shadow-2xl"
                        >
                            <button onClick={() => setIsComingSoonOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                            <div className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r ${themeColor}`}></div>
                            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-4xl mx-auto mb-8 select-none">🚀</div>
                            <h3 className="text-3xl lg:text-4xl font-black text-slate-950 mb-4 uppercase tracking-tighter leading-tight">Something <br /> <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Exciting</span> is on the way.</h3>
                            <p className="text-slate-500 font-bold mb-10 text-xs lg:text-sm leading-relaxed px-4">This feature will be unlocked soon—stay connected.</p>
                            <button onClick={() => setIsComingSoonOpen(false)} className={`w-full py-5 rounded-[2rem] bg-gradient-to-r ${themeColor} text-white font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] transition-all`}>Close Notification</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CourseDetail;
