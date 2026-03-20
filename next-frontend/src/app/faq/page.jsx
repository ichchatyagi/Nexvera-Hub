"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Plus,
    Minus,
    Search,
    BookOpen,
    Award,
    Briefcase,
    Users,
    Globe,
    Rocket,
    CheckCircle2,
    MessageCircle,
    ArrowRight,
    HelpCircle,
    ShieldCheck,
    Cpu
} from 'lucide-react';
import ConsultancyCTA from '@/components/ConsultancyCTA';

const CategoryCard = ({ icon: Icon, title, description, color, metallicGlow }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className={`relative p-[2px] rounded-3xl bg-gradient-to-br ${metallicGlow || 'from-slate-400 via-white to-slate-400'} shadow-xl group overflow-hidden cursor-pointer h-full`}
    >
        <div className={`bg-gradient-to-br ${color} p-6 rounded-[1.4rem] h-full flex flex-col items-center text-center relative`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30">
                <Icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-white/80 text-xs font-medium leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const AccordionItem = ({ question, answer, isOpen, onClick, color }) => (
    <div className="mb-4">
        <motion.div
            layout
            className={`p-[1.5px] rounded-2xl bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-lg overflow-hidden`}
        >
            <div className="bg-white rounded-[0.9rem] overflow-hidden">
                <button
                    onClick={onClick}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                >
                    <span className="text-slate-900 font-black text-lg pr-8 tracking-tight">{question}</span>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'} transition-colors`}>
                        {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                                <div className={`h-1 w-12 bg-gradient-to-r ${color} rounded-full mb-4 mt-4`}></div>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {answer}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
);

const PopularQuestionCard = ({ question, color, slug }) => (
    <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        className={`p-[2px] rounded-3xl bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-xl group`}
    >
        <div className={`bg-gradient-to-br ${color} p-8 rounded-[1.4rem] h-full relative overflow-hidden flex flex-col`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-start gap-4 mb-4 flex-grow">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/30">
                    <Rocket className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{question}</h3>
            </div>
            <Link href={`/faq/${slug}`} className="flex items-center gap-2 text-white/90 font-black text-xs uppercase tracking-widest hover:text-white transition-all mt-auto w-fit">
                Learn More <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    </motion.div>
);

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const categories = [
        { title: "Courses & Learning", description: "Questions about our curriculum and teaching methodology.", icon: BookOpen, color: "from-blue-600 to-indigo-600", metallicGlow: "from-blue-400 via-white to-indigo-400" },
        { title: "Certifications", description: "Details on earning and verifying your industry certificates.", icon: Award, color: "from-emerald-500 to-teal-600", metallicGlow: "from-emerald-300 via-white to-teal-400" },
        { title: "Career Support", description: "How we help you land jobs and prepare for interviews.", icon: Briefcase, color: "from-amber-500 to-orange-600", metallicGlow: "from-yellow-400 via-white to-orange-400" },
        { title: "Internship Program", description: "Real-world project experience and internship placements.", icon: Users, color: "from-purple-600 to-violet-700", metallicGlow: "from-purple-400 via-white to-violet-400" },
        { title: "Platform & Access", description: "Technical support for account and portal access.", icon: Globe, color: "from-pink-600 to-rose-600", metallicGlow: "from-pink-400 via-white to-rose-400" }
    ];

    const faqItems = [
        {
            question: "What is Nexvera Hub?",
            answer: "Nexvera Hub is a comprehensive learning platform designed to help students gain practical technology skills through structured courses, real-world projects, and direct career support. We bridge the gap between academic knowledge and industry requirements.",
            color: "from-blue-600 to-indigo-600"
        },
        {
            question: "Will I receive a certificate after completing a course?",
            answer: "Yes, every student receives an industry-recognized certificate after successfully completing their course modules, projects, and the associated internship program. These certificates are verifiable online.",
            color: "from-emerald-500 to-teal-600"
        },
        {
            question: "Do courses include real-world projects?",
            answer: "Absolutely. Our entire philosophy centers on project-based learning. You will work on professional-grade projects that simulate real industry challenges, allowing you to build a strong portfolio for employers.",
            color: "from-amber-500 to-orange-600"
        },
        {
            question: "Do you provide career support?",
            answer: "Yes, we offer end-to-end career guidance. This includes personalized resume building, mock interviews with industry experts, LinkedIn optimization, and direct job placement assistance through our partner network.",
            color: "from-purple-600 to-violet-700"
        },
        {
            question: "Are courses beginner friendly?",
            answer: "Most of our programs are specifically designed to take you from absolute zero to a professional level. We start with fundamental concepts and gradually move towards advanced implementation.",
            color: "from-cyan-500 to-blue-600"
        },
        {
            question: "How long does a course take to complete?",
            answer: "Course duration varies based on the program complexity and your learning pace. Typically, our core programs range from 8 to 16 weeks, including hands-on project time.",
            color: "from-pink-600 to-rose-600"
        },
        {
            question: "Do students get internship opportunities?",
            answer: "Students don't just 'get' an internship; they gain internship-level experience by working on real-world projects integrated into the curriculum. We also assist in securing official internships with our industry partners.",
            color: "from-slate-700 to-slate-900"
        }
    ];

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 lg:pt-40 pb-20 px-6 lg:px-12 overflow-hidden text-center text-center">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none -mr-1/4">
                    <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                        <path d="M50,150 C200,50 400,250 500,100 L500,0 L0,0 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

                <div className="container mx-auto relative z-10 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 border border-blue-100 shadow-sm"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Got Questions?
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tighter"
                    >
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 underline decoration-blue-100 decoration-8 underline-offset-8">Questions</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl mx-auto"
                    >
                        Find quick answers to common questions about Nexvera Hub courses, learning process, certifications, and career support.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/course" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm">
                            Browse Courses
                            <Rocket className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Popular Questions Highlight */}
            <section className="py-20 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <PopularQuestionCard question="How do I start learning on Nexvera Hub?" color="from-blue-600 to-indigo-600" slug="how-to-start-learning" />
                        <PopularQuestionCard question="Do I get certification after completion?" color="from-emerald-500 to-teal-600" slug="certification-details" />
                        <PopularQuestionCard question="Are projects included in the courses?" color="from-purple-600 to-violet-700" slug="project-inclusion" />
                    </div>
                </div>
            </section>

            {/* FAQ Categories Section */}
            <section className="py-12 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="flex flex-wrap justify-center gap-6">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-[200px]">
                                <CategoryCard {...cat} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Accordion Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16 text-center">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 font-bold tracking-tight uppercase tracking-tighter">Detailed Answers</h2>
                        <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] block opacity-60">Everything you need to know about your journey</p>
                    </div>

                    <div className="space-y-2">
                        {faqItems.map((item, idx) => (
                            <AccordionItem
                                key={idx}
                                {...item}
                                isOpen={openIndex === idx}
                                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <ConsultancyCTA />
        </div>
    );
};

export default FAQ;
