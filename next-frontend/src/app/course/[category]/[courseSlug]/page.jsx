"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, Globe, Clock, Rocket, ChevronRight, Play, Info, BookOpen, Target, Sparkles, HelpCircle, Star, MessageSquare, X } from 'lucide-react';
import { getCourseDetails, getCourseBySlug } from '@/utils/courseDataUtils';

const CourseDetail = () => {
    const params = useParams();
    const category = params.category;
    const courseSlug = params.courseSlug;
    const router = useRouter();
    
    const [course, setCourse] = useState(null);
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [openModuleIndex, setOpenModuleIndex] = useState(0);

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

        const details = getCourseDetails(decodedCategory, courseInfo.title);

        if (!details) {
            router.push('/course');
            return;
        }

        setCourse(details);
    }, [category, courseSlug, router]);

    if (!course) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-black uppercase tracking-[0.2em]">Loading Engine...</div>;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <Info size={14} /> },
        { id: 'curriculum', label: 'Curriculum', icon: <BookOpen size={14} /> },
        { id: 'roadmap', label: 'Roadmap', icon: <Target size={14} /> },
        { id: 'projects', label: 'Projects', icon: <Rocket size={14} /> },
        { id: 'how-learn', label: 'How Learn', icon: <Sparkles size={14} /> },
        { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={14} /> },
        { id: 'faq', label: 'FAQ', icon: <HelpCircle size={14} /> }
    ];

    const themeColor = course.color || 'from-blue-600 to-indigo-700';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
            {/* Hero Section */}
            <section className="relative pt-32 lg:pt-40 pb-24 overflow-hidden border-b border-slate-200 bg-white">
                <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br ${themeColor} blur-[140px] opacity-[0.03] animate-pulse`}></div>
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${themeColor} animate-pulse`}></span>
                                {course.category}
                            </motion.div>
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[0.9] uppercase tracking-tighter text-slate-950">
                                {course.title}
                            </motion.h1>
                            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-slate-500 text-sm md:text-base font-medium max-w-2xl mb-10 leading-relaxed line-clamp-2">
                                {course.overview}
                            </motion.p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Ranking</span>
                                    <div className="flex items-center gap-2 text-slate-900">
                                        <div className="flex text-amber-500">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className="fill-current" strokeWidth={0} />)}
                                        </div>
                                        <span className="text-2xl font-black uppercase tracking-tighter">{course.rating}</span>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-slate-200 hidden sm:block"></div>
                                <div className="flex flex-col gap-1 text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Learning Type</span>
                                    <span className="text-2xl font-black uppercase text-slate-900 tracking-tighter">Project-Based</span>
                                </div>
                                <div className="w-px h-12 bg-slate-200 hidden sm:block"></div>
                                <div className="flex flex-col gap-1 text-left">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Availability</span>
                                    <span className={`text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r ${themeColor} tracking-tighter`}>Coming Soon</span>
                                </div>
                            </div>
                        </div>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full lg:w-[450px] aspect-square relative">
                            <div className="absolute inset-0 p-[2px] rounded-[4rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-xl">
                                <div className="w-full h-full bg-white rounded-[3.9rem] flex items-center justify-center relative overflow-hidden group">
                                    <span className="text-[15rem] filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-700 z-10 select-none">
                                        {course.icon}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Compact Centered Tabbed Navigation */}
            <div className="sticky top-0 z-40 px-6 py-4 bg-slate-50/50 backdrop-blur-sm">
                <div className="max-w-max mx-auto bg-white/70 backdrop-blur-2xl border border-slate-200 p-2 rounded-full shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === item.id ? `bg-gradient-to-r ${themeColor} text-white shadow-md` : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        {/* Tab Content Column */}
                        <div className="flex-1 min-h-[600px] w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Overview Tab content */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-16">
                                            <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 relative overflow-hidden shadow-sm">
                                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${themeColor}`}></div>
                                                <h2 className="text-3xl lg:text-5xl font-black mb-10 uppercase tracking-tighter text-slate-900">About the <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>System</span></h2>
                                                <p className="text-slate-600 text-lg lg:text-xl leading-relaxed mb-12 font-medium">{course.overview}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {(course.highlights || []).map((h, i) => (
                                                        <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all group hover:bg-white hover:shadow-md">
                                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColor} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                                                <span className="font-black text-lg text-white">#</span>
                                                            </div>
                                                            <p className="text-slate-900 font-black uppercase tracking-tight text-sm flex items-center leading-tight">{h}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Curriculum Tab content */}
                                    {activeTab === 'curriculum' && (
                                        <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                                            <h2 className="text-3xl lg:text-5xl font-black mb-16 uppercase tracking-tighter text-slate-900 text-left">Program <span className="text-indigo-600">Curriculum</span></h2>
                                            <div className="space-y-6">
                                                {(course.lessonStructure || []).slice(0, 10).map((module, idx) => (
                                                    <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-300 transition-all group overflow-hidden">
                                                        <button
                                                            onClick={() => setOpenModuleIndex(openModuleIndex === idx ? null : idx)}
                                                            className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6"
                                                        >
                                                            <div className="flex items-center gap-6">
                                                                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0`}>{idx + 1}</span>
                                                                <h3 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight text-left tracking-tighter">{cleanTitle(module.title)}</h3>
                                                            </div>
                                                            <div className="flex items-center gap-4 ml-auto md:ml-0">
                                                                <div className="flex flex-col items-end">
                                                                    <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">Module Phase</span>
                                                                    <span className="mt-2 flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Clock size={12} /> {getModuleDuration(idx)}</span>
                                                                </div>
                                                                <motion.div animate={{ rotate: openModuleIndex === idx ? 90 : 0 }}>
                                                                    <ChevronRight size={20} className="text-slate-400" />
                                                                </motion.div>
                                                            </div>
                                                        </button>
                                                        <AnimatePresence>
                                                            {openModuleIndex === idx && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-8 md:pl-[80px]">
                                                                        {(module.topics || []).map((topic, i) => (
                                                                            <div key={i} className="flex items-center gap-2 text-slate-500 font-black text-[10px] bg-white p-3 rounded-xl border border-slate-100 uppercase tracking-tight">
                                                                                <Play size={10} className="text-slate-300" />
                                                                                <span className="line-clamp-1">{cleanTitle(topic)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Roadmap Tab content */}
                                    {activeTab === 'roadmap' && (
                                        <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                                            <h2 className="text-3xl lg:text-5xl font-black mb-16 uppercase tracking-tighter text-slate-900">Tactical <span className="text-emerald-500">Roadmap</span></h2>
                                            <div className="relative space-y-16">
                                                <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 hidden md:block"></div>
                                                {(course.roadmap || []).map((step, idx) => (
                                                    <div key={idx} className="relative flex flex-col md:flex-row gap-10 items-start">
                                                        <div className={`z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white font-black text-xl shadow-xl shrink-0`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-lg transition-all">
                                                            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight tracking-tighter">{cleanTitle(step.title)}</h3>
                                                            <p className="text-slate-500 leading-relaxed font-bold italic">{cleanTitle(step.desc)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects Tab content */}
                                    {activeTab === 'projects' && (
                                        <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                                            <h2 className="text-3xl lg:text-5xl font-black mb-16 uppercase tracking-tighter text-slate-900">Development <span className="text-cyan-500">Sprints</span></h2>
                                            <div className="grid grid-cols-1 gap-8">
                                                {(course.projects || []).map((project, idx) => (
                                                    <div key={idx} className="p-2 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex flex-col md:flex-row gap-10 overflow-hidden hover:bg-white hover:shadow-xl transition-all group">
                                                        <div className={`w-full md:w-2/5 aspect-video bg-gradient-to-br ${themeColor} opacity-[0.05] flex items-center justify-center text-7xl grayscale group-hover:grayscale-0 transition-all`}>🚀</div>
                                                        <div className="flex-1 p-8 pr-12">
                                                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 block text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Sprint 0{idx + 1}</span>
                                                            <h3 className="text-2xl lg:text-3xl font-black mb-4 uppercase tracking-tight text-slate-900 tracking-tighter">{cleanTitle(project.title)}</h3>
                                                            <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">{cleanTitle(project.desc)}</p>
                                                            <div className="flex flex-wrap gap-3">
                                                                {["Core Review", "Portfolio Ready", "Specialist Guidance"].map(tag => (
                                                                    <span key={tag} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-500 shadow-sm">{tag}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* How You Learn Tab content */}
                                    {activeTab === 'how-learn' && (
                                        <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 text-center shadow-sm">
                                            <h2 className="text-3xl lg:text-5xl font-black mb-16 uppercase tracking-tighter text-slate-900">Learning <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Architectures</span></h2>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
                                                {[
                                                    { icon: "📺", title: "Live Streaming", desc: "Interact with technical experts in real-time within immersive digital environments." },
                                                    { icon: "🛠️", title: "Practice Labs", desc: "Solve architectural challenges in controlled sandbox environments built for mastery." },
                                                    { icon: "👥", title: "Developer Peer", desc: "Collaborate with a global community of engineers and future technology leaders." }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all group">
                                                        <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-5xl mb-8 group-hover:scale-110 transition-transform shadow-sm">{item.icon}</div>
                                                        <h3 className="text-slate-950 font-black text-xl mb-4 uppercase tracking-widest tracking-tight">{item.title}</h3>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews Tab content */}
                                    {activeTab === 'reviews' && (
                                        <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                                            <h2 className="text-3xl lg:text-5xl font-black mb-16 uppercase tracking-tighter text-slate-900">Student <span className="text-amber-500">Feedback</span></h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {(course.reviewsList || []).map((review, idx) => (
                                                    <div key={idx} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all group">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${themeColor} opacity-20 flex items-center justify-center font-black text-slate-900 text-sm`}>{review.user.charAt(0)}</div>
                                                                <div>
                                                                    <p className="text-slate-900 font-black uppercase tracking-tight text-xs">{review.user}</p>
                                                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{review.date}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex text-amber-500">
                                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-current" strokeWidth={0} />)}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{review.comment}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* FAQ Tab content */}
                                    {activeTab === 'faq' && (
                                        <div className="p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                                            <h2 className="text-3xl lg:text-5xl font-black mb-16 uppercase tracking-tighter text-slate-900">Knowledge <span className="text-slate-300">Base</span></h2>
                                            <div className="space-y-4">
                                                {course.faqs.map((faq, idx) => (
                                                    <div key={idx} className="p-3 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-300 transition-all overflow-hidden text-left">
                                                        <button
                                                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                                            className="w-full flex items-center justify-between p-5 text-left"
                                                        >
                                                            <p className="text-slate-950 font-black text-lg uppercase tracking-tight flex items-center gap-4 tracking-tighter">
                                                                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColor} flex items-center justify-center text-white text-xs shrink-0 font-black`}>Q</span>
                                                                {faq.q}
                                                            </p>
                                                            <motion.div animate={{ rotate: openFaqIndex === idx ? 90 : 0 }}>
                                                                <ChevronRight size={20} className="text-slate-400" />
                                                            </motion.div>
                                                        </button>
                                                        <AnimatePresence>
                                                            {openFaqIndex === idx && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3 }}
                                                                >
                                                                    <p className="text-slate-600 leading-relaxed font-medium ml-16 pb-8 pr-8 text-sm">{faq.a}</p>
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

                            {/* Global Future Competencies */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-16 p-10 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-sm w-full"
                            >
                                <h2 className="text-3xl lg:text-4xl font-black mb-10 uppercase tracking-tighter text-slate-900">Future <span className="text-blue-600">Competencies</span></h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left">
                                    {(course.whatYouLearn || course.whatYouWillLearn || []).map((item, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className={`mt-1 p-1 rounded-full bg-gradient-to-br ${themeColor} shadow-md`}>
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                            <p className="text-slate-800 font-black uppercase tracking-tight text-xs leading-tight">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-[400px] flex-shrink-0">
                            <div className="sticky top-48 space-y-10">
                                <div className="p-10 rounded-[3.5rem] bg-white border border-slate-200 shadow-lg relative overflow-hidden text-center">
                                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${themeColor}`}></div>
                                    <div className="aspect-video rounded-[2.5rem] bg-slate-50 mb-10 border border-slate-100 flex items-center justify-center text-8xl grayscale select-none">{course.icon}</div>
                                    <div className="text-center mb-10 p-6 rounded-3xl bg-slate-50 border border-slate-200">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Registration Open Soon</p>
                                        <p className="text-slate-900 text-sm font-black uppercase tracking-tight">Accessing 2026 Batch</p>
                                    </div>
                                    <button onClick={() => setIsComingSoonOpen(true)} className={`w-full py-6 rounded-[2rem] bg-gradient-to-r ${themeColor} text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all mb-4`}>Initialize Enrollment</button>
                                    <button onClick={() => setIsComingSoonOpen(true)} className="w-full py-6 rounded-[2rem] bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] border border-slate-200 hover:bg-white transition-all">Request Trial</button>
                                </div>

                                {/* Certification Preview */}
                                <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest text-center">Specialization ID</h3>
                                    <div className="p-1 rounded-[1.8rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 mb-8 shadow-xl transform -rotate-1 group-hover:rotate-0 transition-all duration-700">
                                        <div className="aspect-[1.414/1] bg-white rounded-[1.5rem] p-6 relative overflow-hidden flex flex-col items-center border border-slate-100 justify-center">
                                            <Award className="w-10 h-10 text-blue-500 mb-2" />
                                            <p className="text-[6px] text-slate-400 font-black uppercase tracking-[0.3em] mb-1">Validated Achievement of</p>
                                            <p className="text-slate-900 text-sm font-serif mb-3 italic font-bold">Future Professional</p>
                                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r ${themeColor} text-center font-black leading-tight max-w-[80%]`}>{course.title}</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 rounded-2xl bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest border border-slate-200">View ID Template</button>
                                </div>

                                {/* Related Modules */}
                                <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                                    <h3 className="text-xl font-black text-slate-950 mb-10 uppercase tracking-widest text-center">Module <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Nexus</span></h3>
                                    <div className="space-y-8">
                                        {(course.relatedCourses || []).map((related, idx) => {
                                            const relSlug = related.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={`/course/${encodeURIComponent(related.category)}/${relSlug}`}
                                                    className="w-full flex gap-5 group cursor-pointer items-center text-left"
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${related.color} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 select-none`}>{related.icon}</div>
                                                    <div className="flex-1">
                                                        <p className="text-slate-950 font-black text-[11px] uppercase tracking-tight line-clamp-2 leading-tight">{related.title}</p>
                                                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-1">{related.category}</p>
                                                    </div>
                                                    <ChevronRight size={14} strokeWidth={3} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                    <Link href="/course" className="mt-10 block w-full py-5 rounded-[2rem] bg-slate-950 text-white font-black text-[10px] text-center transition-all uppercase tracking-[0.2em] hover:bg-black">View All Courses</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coming Soon Modal */}
            <AnimatePresence>
                {isComingSoonOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComingSoonOpen(false)} className="absolute inset-0"></motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-[3.9rem] p-12 lg:p-20 text-center overflow-hidden border-[2px] border-slate-100 shadow-2xl">
                            <button onClick={() => setIsComingSoonOpen(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={24} />
                            </button>
                            <div className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r ${themeColor}`}></div>
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-5xl mx-auto mb-10 shadow-sm select-none">🚀</div>
                            <h3 className="text-4xl lg:text-7xl font-black text-slate-950 mb-6 uppercase tracking-tighter leading-[0.9]">Launch <br /> <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeColor}`}>Phase 01</span></h3>
                            <button onClick={() => setIsComingSoonOpen(false)} className={`w-full py-7 rounded-[2.5rem] bg-gradient-to-r ${themeColor} text-white font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] transition-all`}>Exit Deployment</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <ConsultancyCTA />
        </div>
    );
};

export default CourseDetail;
