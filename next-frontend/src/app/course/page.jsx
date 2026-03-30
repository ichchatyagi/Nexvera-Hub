"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Star, BookOpen, Layout, Users, Monitor, UserCheck, Lightbulb, Search, ArrowRight, CheckCircle2, Calculator, Atom, FlaskConical, Cpu, BookText, TrendingUp, Languages, Globe, Rocket, ArrowUp } from 'lucide-react';
import { categoryData } from '@/data/categoryData';
import coursesPricing from '@/data/coursePricingData';
import ConsultancyCTA from '@/components/ConsultancyCTA';
import IconRenderer from '@/components/IconRenderer';

const CourseHero = ({ onCategoryChange, onLevelChange }) => {
    return (
        <section className="relative pt-6 lg:pt-12 pb-4 lg:pb-8 overflow-hidden bg-transparent">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                    <path d="M0,100 C150,200 350,0 500,100 L500,0 L0,0 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className="flex-1 z-10 text-center lg:text-left">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 backdrop-blur-sm border border-blue-200 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Exploration Engine Active
                    </motion.div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[0.95] mb-8 text-slate-950 uppercase tracking-tighter">
                        Explore <br /> Our <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Expert</span> <br />
                        Courses
                    </h1>

                    <p className="text-base text-slate-500 mb-12 max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
                        Unlock your potential with our meticulously crafted learning paths. Whether you're mastering new technology or enhancing your personal well-being, we provide the tools you need to succeed.
                    </p>

                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 relative"
                >
                    <div className="relative z-10 flex justify-center lg:justify-end">
                        <div className="absolute -inset-10 bg-gradient-to-tr from-blue-400/10 via-purple-400/10 to-indigo-400/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                        <img
                            src="https://illustrations.popsy.co/blue/studying.svg"
                            alt="Nexvera Hub Online Learning"
                            className="w-full h-auto max-w-xl drop-shadow-2xl"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const ExploreCourses = ({ activeCategory, onCategoryChange }) => {
    return (
        <section className="py-8 lg:py-12 bg-transparent">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col items-center text-center mb-10 px-4 mt-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90 mb-1 block -mt-2">Discovery Hub</span>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-8">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Categories</span></h2>
                    
                    <div className="w-full max-w-[550px]">
                        <div className="flex flex-col sm:flex-row p-1.5 sm:p-2 bg-white rounded-[2rem] sm:rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 gap-2 sm:gap-0">
                            <input
                                type="text"
                                placeholder="Search by course or skill..."
                                className="flex-1 px-4 sm:px-8 py-4 sm:py-0 outline-none text-slate-700 placeholder:text-slate-400 font-bold bg-transparent"
                            />
                            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest px-6 py-4 sm:px-10 sm:py-5 rounded-[1.4rem] sm:rounded-[1.8rem] transition-all shadow-xl shadow-blue-200 w-full sm:w-auto">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categoryData.slice(0, 11).map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => onCategoryChange(cat.name)}
                            className={`group flex items-center justify-center gap-3 px-6 py-6 rounded-[2rem] font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm border ${activeCategory === cat.name ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-xl shadow-blue-200' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'}`}
                        >
                            <IconRenderer icon={cat.icon} category={cat.name} className={`w-8 h-8 filter group-hover:scale-125 transition-all duration-500`} showGlow={activeCategory === cat.name} />
                            <span className="text-[9px] uppercase tracking-[0.15em] font-black">{cat.name}</span>
                        </button>
                    ))}
                    <button className="flex items-center justify-center gap-3 px-6 py-6 rounded-[2rem] font-black text-[9px] uppercase tracking-[0.2em] bg-slate-900 text-white hover:bg-black transition-all">
                        <Rocket className="w-5 h-5" />
                        More
                    </button>
                </div>
            </div>
        </section>
    );
};

const TestimonialsMarquee = () => {
    const testimonials = [
        {
            name: "Julia Parker",
            role: "Marketing Specialist",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
            quote: "Nexvera Hub finally transformed my career. The courses are top-notch, and the mentors are extremely supportive."
        },
        {
            name: "Marcus Thorne",
            role: "DevOps Engineer",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            quote: "The Cloud & DevOps path is incredible. Highly practical and precisely what the industry needs right now."
        },
        {
            name: "Elena Rodriguez",
            role: "UX Designer",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
            quote: "The design fundamentals course changed how I approach user empathy. Best educational investment I've made."
        },
        {
            name: "Liam O'Connor",
            role: "Fullstack Dev",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            quote: "From zero to building full-scale apps. The learning curve is perfectly balanced with hands-on projects."
        },
        {
            name: "Sophia Chen",
            role: "Data Analyst",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
            quote: "The AI & Data Science modules are comprehensive. I landed a job within weeks of completing my certification."
        }
    ];

    const marqueeTestimonials = [...testimonials, ...testimonials, ...testimonials];

    return (
        <section className="py-20 bg-white/50 backdrop-blur-sm border-y border-slate-100 overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12 mb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight tracking-tighter">Student <span className="text-blue-600">Reviews</span></h2>
                        <p className="text-slate-500 font-medium">What our global community says about us</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                    </div>
                </div>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex gap-8 whitespace-nowrap"
                    animate={{
                        x: [0, -2250],
                    }}
                    transition={{
                        duration: 60,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {marqueeTestimonials.map((t, index) => (
                        <div key={index} className="flex-shrink-0 w-[85vw] md:w-[450px] p-8 whitespace-normal bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all">
                                    <img
                                        src={t.image}
                                        alt={t.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{t.name}</span>
                                    <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{t.role}</span>
                                </div>
                                <div className="ml-auto flex gap-1 text-amber-400">
                                    {'★'.repeat(5)}
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed italic text-lg opacity-90">
                                "{t.quote}"
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const TuitionSection = () => {
    const mainFeatures = [
        { title: "Classes 5–12 Coverage", desc: "Comprehensive curriculum coverage for all major boards.", icon: <BookOpen />, color: "from-blue-600 to-cyan-500", borderColor: "border-blue-500/30" },
        { title: "All Subjects Available", desc: "Expert guidance for Science, Maths, Humanities & more.", icon: <Layout />, color: "from-orange-500 to-amber-500", borderColor: "border-orange-500/30" },
        { title: "Experienced Tutors", desc: "Learn from highly qualified and background-verified educators.", icon: <Users />, color: "from-amber-500 to-yellow-500", borderColor: "border-amber-500/30" },
    ];

    const methodology = [
        { step: "01", title: "Free Assessment", desc: "We evaluate the student's current level and learning gaps." },
        { step: "02", title: "Expert Matching", desc: "We assign a specialized tutor based on the student's needs." },
        { step: "03", title: "Demo Session", desc: "Experience our teaching style with a 30-minute free trial." },
        { step: "04", title: "Structured Plan", desc: "A personalized roadmap for academic excellence." }
    ];

    const subjects = [
        { name: "Mathematics", icon: <Calculator />, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-200" },
        { name: "Physics", icon: <Atom />, color: "text-indigo-600", bg: "bg-indigo-50/50", border: "border-indigo-200" },
        { name: "Chemistry", icon: <FlaskConical />, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-200" },
        { name: "Biology", icon: <FlaskConical />, color: "text-rose-600", bg: "bg-rose-50/50", border: "border-rose-200" },
        { name: "English", icon: <Languages />, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-200" },
        { name: "Computer Science", icon: <Cpu />, color: "text-cyan-600", bg: "bg-cyan-50/50", border: "border-cyan-200" },
        { name: "Economics", icon: <TrendingUp />, color: "text-fuchsia-600", bg: "bg-fuchsia-50/50", border: "border-fuchsia-200" },
        { name: "Business Studies", icon: <BookText />, color: "text-orange-600", bg: "bg-orange-50/50", border: "border-orange-200" },
        { name: "Social Studies", icon: <Globe />, color: "text-teal-600", bg: "bg-teal-50/50", border: "border-teal-200" },
        { name: "All Academic Subjects", icon: <Star />, color: "text-slate-600", bg: "bg-slate-50/50", border: "border-slate-300 shadow-lg shadow-slate-100" }
    ];

    const extraBenefits = [
        { title: "24/7 Doubt Support", desc: "Never get stuck on a problem again." },
        { title: "Weekly Test Series", desc: "Track progress through regular assessments." },
        { title: "Parent Reports", desc: "Monthly performance insights for parents." },
        { title: "Recorded Classes", desc: "Revisit any lesson at your own convenience." }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-white/30 backdrop-blur-md">
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Hero Content */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-24 text-center lg:text-left">
                    <div className="flex-1 order-2 lg:order-1">
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block"
                        >
                            Academic Success Engine
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ delay: 0.1 }} 
                            className="text-4xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-[0.95]"
                        >
                            Premier Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tuition</span> <br /> for Classes 5–12
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ delay: 0.2 }} 
                            className="text-lg text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10"
                        >
                            We provide high-impact, personalized online tutoring for students from Class 5 to 12. Our focus is on concept clarity, regular practice, and building confidence to excel in school and board exams.
                        </motion.p>
                        
                        {/* Boards Support */}
                        <div className="mb-10">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Supported Education Boards</h4>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                {['CBSE', 'ICSE', 'ISC', 'State Boards'].map((board) => (
                                    <span key={board} className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {board}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                            <Link href="/contact" className="px-8 py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-200 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 group">
                                Book a Free Demo
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <p className="text-[10px] font-bold text-slate-400 italic">Limited slots available for the current session</p>
                        </div>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: 20 }} 
                        whileInView={{ opacity: 1, scale: 1, x: 0 }} 
                        viewport={{ once: true }} 
                        className="flex-1 relative order-1 lg:order-2 flex justify-center lg:justify-end"
                    >
                        <div className="relative z-10 w-full max-w-md">
                            <div className="absolute -inset-10 bg-gradient-to-tr from-blue-400/20 via-cyan-400/20 to-indigo-400/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                            <img
                                src="https://illustrations.popsy.co/blue/presentation.svg"
                                alt="Online Tuition"
                                className="w-full h-auto drop-shadow-2xl translate-y-4"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Main Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {mainFeatures.map((f, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`group p-10 bg-white rounded-[2.5rem] border ${f.borderColor} hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col items-center lg:items-start text-center lg:text-left gap-6`}
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                {React.cloneElement(f.icon, { size: 24, strokeWidth: 2.5 })}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight tracking-tighter">{f.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Subjects Grid - REFINED WITH BORDERS */}
                <div className="mb-24">
                    <div className="text-center lg:text-left mb-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block">Full Curriculum Access</span>
                        <h3 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-4">Expert <span className="text-blue-600">Subject Coverage</span></h3>
                        <p className="text-slate-500 font-medium max-w-2xl">We specialize in providing in-depth knowledge across all major academic streams.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {subjects.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className={`p-8 rounded-[2rem] ${s.bg} border-2 ${s.border} transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-2xl -mr-10 -mt-10 rounded-full"></div>
                                <div className={`w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-5 ${s.color} transition-all group-hover:scale-110 group-hover:shadow-lg relative z-10`}>
                                    {React.cloneElement(s.icon, { size: 24, strokeWidth: 2.5 })}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 relative z-10 leading-tight">{s.name}</span>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center lg:text-left mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                        + Many More Specialized Subjects | Interactive 1-on-1 & Group Sessions
                    </p>
                </div>

                {/* Methodology & Process - LIGHT THEME */}
                <div className="bg-blue-50/50 rounded-[3.5rem] p-10 lg:p-20 border border-blue-100/50 relative overflow-hidden mb-24">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block">Our Methodology</span>
                            <h3 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">How We Ensure <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Peak Performance</span></h3>
                            <p className="text-slate-600 font-medium text-lg leading-relaxed mb-10">
                                We've perfected a learning flow that identifies a student's weaknesses early and builds strength through consistent mentorship and practice.
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors group">
                                Learn more about our process
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {methodology.map((m, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 rounded-3xl bg-white border border-blue-100 group hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-500/5"
                                >
                                    <span className="text-3xl font-black text-blue-600/20 mb-4 block group-hover:text-blue-600/40 transition-colors">{m.step}</span>
                                    <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-slate-900">{m.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{m.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Extra Benefits */}
                <div className="text-center mb-16 px-4 mt-0">
                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">Why Parents <span className="text-blue-600">Trust Us</span></h2>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">Going beyond the classroom to provide a complete academic support ecosystem.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {extraBenefits.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[2.5rem] bg-white border border-blue-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                        >
                            <CheckCircle2 className="w-8 h-8 text-blue-600 mb-6" />
                            <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-slate-900">{b.title}</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{b.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CourseCard = ({ category, title, instructor, lessons, rating, reviews, color, icon, image }) => {
    const [selectedLevel, setSelectedLevel] = useState("Beginner");
    
    // Fetch dynamic pricing
    const pricingInfo = coursesPricing.find(p => p.title === title);
    const dynamicPrices = pricingInfo ? pricingInfo.pricing : { "Beginner": 699, "Intermediate": 1299, "Advanced": 1799 };
    
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group h-full relative">
            <div className={`h-48 bg-gradient-to-br ${color} p-8 flex flex-col justify-between relative overflow-hidden pointer-events-none`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                            {category}
                        </span>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                            <IconRenderer icon={icon} category={category} className="w-8 h-8" showGlow={true} />
                        </div>
                    </div>
                </div>
                <h3 className="text-lg lg:text-xl font-black text-white leading-[1.1] uppercase tracking-tight relative z-10 tracking-tighter mt-4">
                    {title}
                </h3>
            </div>

            <div className="p-6 flex-1 flex flex-col relative z-20">
                <div className="pointer-events-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-black shrink-0">
                            {instructor.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{instructor}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lessons} Lessons</p>
                        </div>
                    </div>
                </div>

                {/* Interactive Level & Price Selector */}
                <div className="mt-2 mb-6 relative z-30">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Expertise Configuration</label>
                    <div className="flex items-center justify-between gap-4 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                        <select 
                            value={selectedLevel} 
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer py-1.5 px-2"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        <div className="text-right pr-2">
                             <span className="text-slate-400 text-[9px] font-black line-through block leading-none mb-0.5 opacity-60">₹2,999</span>
                             <span className={`text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-sm tracking-tighter leading-none`}>₹{dynamicPrices[selectedLevel.toLowerCase()] || dynamicPrices[selectedLevel]}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1 pointer-events-none">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-orange-400 text-xs">★</span>
                        ))}
                        <span className="text-slate-900 font-black text-xs ml-1">{rating}</span>
                        <span className="text-slate-400 text-[10px] font-black ml-1">/ {reviews}</span>
                    </div>
                    <Link 
                        href={`/course/${encodeURIComponent(category)}/${slug}?level=${selectedLevel}`}
                        className="flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest text-[8px] font-black underline underline-offset-4 relative z-30"
                    >
                        Explore
                        <ChevronRight size={12} strokeWidth={3} />
                    </Link>
                </div>
            </div>
            {/* Background link for the whole card */}
            <Link 
                href={`/course/${encodeURIComponent(category)}/${slug}?level=${selectedLevel}`}
                className="absolute inset-0 z-10"
                aria-label={`View details for ${title}`}
            ></Link>
        </div>
    );
};

const StatsSection = () => {
    const stats = [
        { label: '200+', sub: 'Courses', icon: '▶️', color: 'bg-blue-600' },
        { label: '5k+', sub: 'Students', icon: '👥', color: 'bg-orange-500' },
        { label: '50+', sub: 'Instructors', icon: '🎓', color: 'bg-amber-500' },
        { label: '99%', sub: 'Certification', icon: '📈', color: 'bg-pink-500' },
        { label: '200+', sub: 'Expert Courses', icon: '✨', color: 'bg-indigo-600' },
    ];

    return (
        <section className="py-20 bg-blue-50/30">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-wrap items-center justify-between gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center text-center group cursor-pointer">
                            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-6 shadow-lg shadow-blue-100`}>
                                <IconRenderer icon={stat.icon} className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{stat.label}</h4>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CoursesContent = () => {
    const searchParams = useSearchParams();
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'Information Technology');
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setActiveCategory(cat);
        }
    }, [searchParams]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setShowAll(false);
    };

    const allActiveCourses = categoryData.find(cat => cat.name === activeCategory)?.courses || [];
    const activeCourses = showAll ? allActiveCourses : allActiveCourses.slice(0, 10);

    return (
        <div className="bg-transparent">
            <CourseHero onCategoryChange={handleCategoryChange} />
            <ExploreCourses activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

            <section className="pb-20">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {activeCourses.map((course, index) => (
                            <CourseCard key={index} {...course} category={activeCategory} />
                        ))}
                    </div>

                    {allActiveCourses.length > 10 && (
                        <div className="mt-16 flex justify-center">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black px-6 lg:px-12 py-5 rounded-2xl shadow-2xl shadow-cyan-100 transition-all active:scale-95 group uppercase tracking-widest text-[10px]"
                            >
                                {showAll ? 'Show Less' : 'View All Courses'}
                                <span className={`inline-flex items-center transition-transform ${showAll ? 'rotate-180' : ''} group-hover:translate-x-1 ml-2`}>
                                    {showAll ? <ArrowUp className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <TestimonialsMarquee />
            <TuitionSection />
            <StatsSection />
            <ConsultancyCTA />
        </div>
    );
}

const Courses = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <CoursesContent />
        </Suspense>
    );
};

export default Courses;
