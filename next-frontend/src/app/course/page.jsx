"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Star, BookOpen, Layout, Users, Monitor, UserCheck, Lightbulb, Search } from 'lucide-react';
import { categoryData } from '@/data/categoryData';
import ConsultancyCTA from '@/components/ConsultancyCTA';

const CourseHero = ({ onCategoryChange, onLevelChange }) => {
    return (
        <section className="relative pt-12 pb-20 overflow-hidden bg-transparent">
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

                    <h1 className="text-4xl lg:text-8xl font-black leading-[0.95] mb-8 text-slate-950 uppercase tracking-tighter">
                        Future <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Professional</span> <br />
                        Launchpad
                    </h1>

                    <p className="text-base text-slate-500 mb-12 max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
                        Access our high-performance curriculum system. Every course is engineered to deliver immediate industry-standard competencies.
                    </p>

                    <div className="flex flex-col gap-8 max-w-2xl mx-auto lg:mx-0">
                        <div className="flex p-2 bg-white rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100">
                            <input
                                type="text"
                                placeholder="Search by course or skill..."
                                className="flex-1 px-8 outline-none text-slate-700 placeholder:text-slate-400 font-bold"
                            />
                            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded-[1.8rem] transition-all shadow-xl shadow-blue-200 active:scale-95">
                                Search
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-6 py-3 rounded-full hover:bg-white transition-all cursor-pointer">
                                <span className="text-slate-400">DOMAIN:</span>
                                <select
                                    className="bg-transparent border-none outline-none cursor-pointer font-black text-slate-900"
                                    onChange={(e) => onCategoryChange(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categoryData.map((cat, idx) => (
                                        <option key={idx} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-6 py-3 rounded-full hover:bg-white transition-all cursor-pointer">
                                <span className="text-slate-400">DIFFICULTY:</span>
                                <select
                                    className="bg-transparent border-none outline-none cursor-pointer font-black text-slate-900"
                                    onChange={(e) => onLevelChange(e.target.value)}
                                >
                                    <option value="">All Levels</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex-1 relative">
                    <div className="relative z-10 animate-float flex justify-center lg:justify-end">
                        <div className="relative p-2 rounded-[4rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl">
                            <img
                                src="/images/courses-hero.png"
                                alt="Nexvera Hub Online Learning"
                                className="w-[450px] lg:w-full max-w-[500px] h-auto rounded-[3.8rem] object-cover"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const ExploreCourses = ({ activeCategory, onCategoryChange }) => {
    return (
        <section className="py-16 lg:py-24 bg-transparent">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-center mb-16 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block">Discovery Hub</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Categories</span></h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categoryData.slice(0, 11).map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => onCategoryChange(cat.name)}
                            className={`group flex items-center justify-center gap-3 px-6 py-6 rounded-[2rem] font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm border ${activeCategory === cat.name ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-xl shadow-blue-200' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'}`}
                        >
                            <span className="text-2xl filter group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <span className="text-[9px] uppercase tracking-[0.15em] font-black">{cat.name}</span>
                        </button>
                    ))}
                    <button className="flex items-center justify-center gap-3 px-6 py-6 rounded-[2rem] font-black text-[9px] uppercase tracking-[0.2em] bg-slate-900 text-white hover:bg-black transition-all">
                        <span>🚀</span>
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
                        <div key={index} className="flex-shrink-0 w-[450px] p-8 whitespace-normal bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
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
    const features = [
        { title: "Classes 5–12 Coverage", desc: "Comprehensive curriculum coverage for all major boards.", icon: <BookOpen />, color: "from-blue-600 to-cyan-500", borderColor: "border-blue-500/30" },
        { title: "All Subjects Available", desc: "Expert guidance for Science, Maths, Humanities & more.", icon: <Layout />, color: "from-orange-500 to-amber-500", borderColor: "border-orange-500/30" },
        { title: "Experienced Tutors", desc: "Learn from highly qualified and background-verified educators.", icon: <Users />, color: "from-amber-500 to-yellow-500", borderColor: "border-amber-500/30" },
        { title: "Online Tuition Options", desc: "Flexible learning options to suit your comfort and schedule.", icon: <Monitor />, color: "from-pink-500 to-rose-500", borderColor: "border-pink-500/30" },
        { title: "Personalized Support", desc: "One-on-one attention focused on individual student needs.", icon: <UserCheck />, color: "from-indigo-600 to-purple-500", borderColor: "border-indigo-600/30" },
        { title: "Concept-Based Teaching", desc: "Emphasis on deep understanding rather than rote memorization.", icon: <Lightbulb />, color: "from-cyan-500 to-teal-500", borderColor: "border-cyan-500/30" }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-white/30 backdrop-blur-md">
            {/* Background elements to match the colorful theme */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 blur-[120px] rounded-full -mr-24 -mt-24"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-50/50 blur-[120px] rounded-full -ml-24 -mb-24"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-20 text-center lg:text-left">
                    <div className="flex-1 order-2 lg:order-1">
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block"
                        >
                            Educational Excellence
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ delay: 0.1 }} 
                            className="text-4xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-[0.95]"
                        >
                            Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tuition</span> <br /> for Classes 5–12
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ delay: 0.2 }} 
                            className="text-lg text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10"
                        >
                            Personalized support from experienced tutors to help students understand concepts better and improve academic performance through interactive online sessions.
                        </motion.p>
                        
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                            <span className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">Classes 5–12</span>
                            <span className="px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest shadow-sm">All Subjects</span>
                            <span className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">Online Tuition</span>
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">
                            Classes 5–12 | All Subjects | Online Tuition Available
                        </p>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        whileInView={{ opacity: 1, scale: 1 }} 
                        viewport={{ once: true }} 
                        className="flex-1 relative order-1 lg:order-2 flex justify-center lg:justify-end"
                    >
                        <div className="relative p-2 rounded-[3.5rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl max-w-[480px]">
                             <img 
                                src="/images/tuition.png" 
                                alt="Online Tuition" 
                                className="w-full h-auto rounded-[3.3rem] object-cover shadow-inner" 
                             />
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`group p-10 bg-white rounded-[2.5rem] border ${f.borderColor} hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col items-center lg:items-start text-center lg:text-left gap-6`}
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                {React.cloneElement(f.icon, { size: 28, strokeWidth: 2.5 })}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 leading-tight tracking-tighter">{f.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CourseCard = ({ category, title, instructor, lessons, rating, reviews, color, icon, level = "Beginner" }) => {
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    return (
        <Link href={`/course/${encodeURIComponent(category)}/${slug}`} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group h-full">
            <div className={`h-48 bg-gradient-to-br ${color} p-8 flex flex-col justify-between relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-2">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[8px] font-black uppercase tracking-widest border border-white/20 w-max">
                            {category}
                        </span>
                        <span className="bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[8px] font-black uppercase tracking-widest border border-white/10 w-max">
                            {level}
                        </span>
                    </div>
                    <span className="text-4xl filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">{icon}</span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white leading-[1.1] uppercase tracking-tight relative z-10 tracking-tighter">
                    {title}
                </h3>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-blue-600 font-black">
                        {instructor.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{instructor}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lessons} Lessons</p>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-orange-400 text-xs">★</span>
                        ))}
                        <span className="text-slate-900 font-black text-xs ml-1">{rating}</span>
                        <span className="text-slate-400 text-[10px] font-black ml-1">/ {reviews}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-all uppercase tracking-widest text-[8px] font-black underline underline-offset-4">
                        Explore
                        <ChevronRight size={12} strokeWidth={3} />
                    </div>
                </div>
            </div>
        </Link>
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
                            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-2xl text-white mb-4 transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-6 shadow-lg shadow-blue-100`}>
                                {stat.icon}
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
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'IT & Technology');
    const [activeLevel, setActiveLevel] = useState('');
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setActiveCategory(cat);
        }
    }, [searchParams]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setActiveLevel('');
        setShowAll(false);
    };

    const handleLevelChange = (level) => {
        setActiveLevel(level);
        setShowAll(false);
    };

    const rawCourses = categoryData.find(cat => cat.name === activeCategory)?.courses || [];
    const allActiveCourses = rawCourses.map((c, i) => ({
        ...c,
        level: i % 3 === 0 ? "Beginner" : i % 3 === 1 ? "Intermediate" : "Advanced"
    })).filter(c => !activeLevel || c.level === activeLevel);

    const activeCourses = showAll ? allActiveCourses : allActiveCourses.slice(0, 10);

    return (
        <div className="bg-transparent">
            <CourseHero onCategoryChange={handleCategoryChange} onLevelChange={handleLevelChange} />
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
                                <span className={`inline-block transition-transform ${showAll ? 'rotate-180' : ''} group-hover:translate-x-1 ml-2`}>
                                    {showAll ? '👆' : '👉'}
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
