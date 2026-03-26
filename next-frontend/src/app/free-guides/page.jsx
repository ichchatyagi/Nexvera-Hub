"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Code,
    Briefcase,
    Terminal,
    Rocket,
    Clock,
    ChevronRight,
    Search,
    Download,
    Eye,
    Star,
    CheckCircle2,
    Award,
    Users,
    Lightbulb,
    Target,
    Layout,
    Globe,
    Cpu,
    ArrowRight
} from 'lucide-react';
import ConsultancyCTA from '@/components/ConsultancyCTA';

const GuideCard = ({ slug, title, description, time, category, color, metallicGlow, actionText = "Read Guide" }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        className={`relative p-[2px] rounded-[2.5rem] bg-gradient-to-br ${metallicGlow || 'from-slate-400 via-white to-slate-400'} shadow-2xl group overflow-hidden h-full flex flex-col`}
    >
        <Link href={`/guide/${slug}`} className={`bg-gradient-to-br ${color} p-8 rounded-[2.4rem] h-full flex flex-col items-start relative overflow-hidden flex-1`}>
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/20">
                    {category}
                </span>
                <div className="flex items-center gap-1 text-white/70 text-[10px] font-bold uppercase tracking-widest bg-black/10 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {time}
                </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-3 leading-tight uppercase tracking-tight">{title}</h3>
            <p className="text-white/80 text-sm font-medium leading-relaxed mb-8 flex-1">
                {description}
            </p>

            <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest group/btn mt-auto">
                {actionText}
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
            </div>
        </Link>
    </motion.div>
);

const CategoryCard = ({ icon: Icon, title, color, metallicGlow }) => (
    <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className={`relative p-[1.5px] rounded-3xl bg-gradient-to-br ${metallicGlow || 'from-slate-400 via-white to-slate-400'} shadow-xl group cursor-pointer`}
    >
        <div className={`bg-gradient-to-br ${color} p-6 rounded-[1.4rem] h-full flex flex-col items-center text-center relative overflow-hidden`}>
            {/* Micro-glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>

            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30 text-white shadow-inner">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
        </div>
    </motion.div>
);

const BenefitCard = ({ title, color, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-[1.5px] rounded-2xl bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-lg"
    >
        <div className={`bg-gradient-to-br ${color} px-6 py-5 rounded-[0.9rem] flex items-center gap-4`}>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-sm leading-tight uppercase tracking-tight">{title}</span>
        </div>
    </motion.div>
);

const FreeGuides = () => {
    const featuredGuides = [
        {
            slug: "beginners-guide-to-web-development",
            title: "Beginner’s Guide to Web Development",
            description: "A complete roadmap for aspiring web developers. Learn about frontend, backend, and full-stack paths.",
            time: "15 Min",
            category: "Programming",
            color: "from-blue-600 to-indigo-700",
            metallicGlow: "from-blue-400 via-white to-indigo-400"
        },
        {
            slug: "introduction-to-python-programming",
            title: "Introduction to Python Programming",
            description: "Master the basics of Python including syntax, data structures, and simple algorithms.",
            time: "20 Min",
            category: "Technology",
            color: "from-emerald-600 to-teal-700",
            metallicGlow: "from-emerald-400 via-white to-teal-400"
        },
        {
            slug: "how-to-build-your-first-portfolio-website",
            title: "How to Build Your First Portfolio Website",
            description: "Step-by-step tutorial on creating and deploying a professional portfolio to showcase your talent.",
            time: "25 Min",
            category: "Projects",
            color: "from-fuchsia-600 to-pink-700",
            metallicGlow: "from-fuchsia-400 via-white to-pink-400"
        }
    ];

    const categories = [
        { title: "Programming Guides", icon: Code, color: "from-blue-500 to-indigo-600" },
        { title: "Career Prep", icon: Briefcase, color: "from-amber-500 to-orange-600" },
        { title: "Project Tutorials", icon: Layout, color: "from-emerald-500 to-teal-600" },
        { title: "Tech Fundamentals", icon: Cpu, color: "from-purple-500 to-violet-600" },
        { title: "Interview Prep", icon: Target, color: "from-pink-500 to-rose-600" }
    ];

    const popularGuides = [
        {
            slug: "top-skills-needed-for-a-tech-career",
            title: "Top Skills Needed for a Tech Career",
            description: "Discover the most in-demand technical and soft skills prioritized by top tech recruiters today.",
            time: "12 Min",
            category: "Career Tips",
            color: "from-blue-700 to-blue-900",
            metallicGlow: "from-blue-400 via-cyan-100 to-indigo-400"
        },
        {
            slug: "beginners-guide-to-data-science",
            title: "Beginner’s Guide to Data Science",
            description: "An entry-level overview of data analysis, machine learning foundations, and data ecosystem.",
            time: "18 Min",
            category: "Technology",
            color: "from-indigo-600 to-purple-800",
            metallicGlow: "from-indigo-300 via-purple-100 to-indigo-500"
        }
    ];

    const libraryItems = [
        { slug: "react-state-management-basics", title: "React State Management Basics", summary: "Deep dive into useState, useEffect and more.", icon: Code },
        { slug: "ui-ux-design-process", title: "UI/UX Design Process", summary: "From wireframing to high-fidelity prototypes.", icon: Layout },
        { slug: "node-js-api-architecture", title: "Node.js API Architecture", summary: "Building scalable and performant backends.", icon: Terminal },
        { slug: "cloud-deployment-with-aws", title: "Cloud Deployment with AWS", summary: "Deploying your apps to the modern cloud.", icon: Globe },
        { slug: "agile-software-development", title: "Agile Software Development", summary: "Mastering scrum and team productivity.", icon: Users },
        { slug: "responsive-css-frameworks", title: "Responsive CSS Frameworks", summary: "Comparing Tailwind, Bootstrap and more.", icon: Layout }
    ];

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-6 lg:pt-12 pb-24 px-6 lg:px-12 overflow-hidden overflow-visible">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none -mr-24">
                    <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                        <path d="M0,100 C150,200 350,0 500,100 L500,500 L0,500 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="absolute top-20 left-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]"></div>

                <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 border border-blue-100 shadow-sm"
                        >
                            <BookOpen className="w-4 h-4" />
                            Knowledge Base
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tighter"
                        >
                            Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Learning Guides</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl lg:mx-0 mx-auto"
                        >
                            Explore free educational resources designed to help students learn new skills, understand technology concepts, and prepare for real-world careers.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link href="/course" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-6 lg:px-12 py-5 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-widest text-sm mx-auto lg:mx-0">
                                Start Learning
                                <Rocket className="w-6 h-6" />
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 relative hidden lg:block"
                    >
                        <div className="relative p-12 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[4rem] shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                {[
                                    { icon: Code, label: "Code", color: "bg-blue-600" },
                                    { icon: Briefcase, label: "Career", color: "bg-emerald-500" },
                                    { icon: Globe, label: "Global", color: "bg-fuchsia-600" },
                                    { icon: Lightbulb, label: "Ideas", color: "bg-amber-500" }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-8 bg-white/80 rounded-3xl border border-white/50 shadow-lg flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-500">
                                        <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <span className="text-slate-800 font-black uppercase text-xs tracking-widest">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Guides Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 bg-slate-50/50">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-16 gap-6 text-center md:text-left">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 font-bold tracking-tight uppercase tracking-tighter">Featured Learning Resources</h2>
                            <p className="text-slate-500 text-lg font-medium">Curated deep-dives into industry-standard technologies and workflows.</p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all cursor-pointer">
                            View All Guides <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {featuredGuides.map((guide, idx) => (
                            <GuideCard key={idx} {...guide} actionText="Read Guide" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Guide Categories */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="text-center mb-16 text-center">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight tracking-tighter">Explore by <span className="text-blue-600">Specialization</span></h2>
                        <p className="text-slate-500 font-medium mt-2">Find the right resources for your career path</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 overflow-visible">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="w-[180px] shrink-0">
                                <CategoryCard {...cat} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Guides Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 bg-blue-50/30">
                <div className="container mx-auto">
                    <div className="text-center mb-20 text-center">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 font-bold tracking-tight uppercase tracking-tighter">Most Popular Free Guides</h2>
                        <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
                        {popularGuides.map((guide, idx) => (
                            <GuideCard key={idx} {...guide} actionText="Open Guide" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Learning Resource Library */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="bg-white/40 backdrop-blur-xl border border-blue-50 p-12 lg:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                        <div className="relative z-10 mb-16 text-center lg:text-left">
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase tracking-tighter">Learning Library</h2>
                            <p className="text-slate-500 font-medium font-lg">Quick reference docs and tutorials for fundamental concept mastery.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            {libraryItems.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col group h-full"
                                >
                                    <Link href={`/guide/${item.slug}`} className="flex flex-col h-full">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tighter text-sm">{item.title}</h4>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium mb-8 flex-1">{item.summary}</p>
                                        <div className="text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:gap-4 transition-all mt-auto underline underline-offset-4">
                                            Open Guide <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Use Our Free Guides */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 bg-slate-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16 text-center">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 font-bold tracking-tight uppercase tracking-tighter">Why Nexvera Guides?</h2>
                        <p className="text-slate-500 font-medium pb-2 uppercase tracking-widest text-[10px] block opacity-60">The ultimate value for your learning journey</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                        {[
                            { title: "Beginner-friendly explanations", icon: CheckCircle2, color: "from-blue-600 to-indigo-600" },
                            { title: "Practical learning approach", icon: Terminal, color: "from-emerald-500 to-teal-600" },
                            { title: "Real-world technology topics", icon: Globe, color: "from-amber-500 to-orange-600" },
                            { title: "Career-focused insights", icon: Target, color: "from-purple-600 to-violet-700" },
                            { title: "Completely free resources", icon: Award, color: "from-fuchsia-600 to-pink-600" }
                        ].map((benefit, idx) => (
                            <BenefitCard key={idx} {...benefit} />
                        ))}
                    </div>
                </div>
            </section>

            <ConsultancyCTA />
        </div>
    );
};

export default FreeGuides;
