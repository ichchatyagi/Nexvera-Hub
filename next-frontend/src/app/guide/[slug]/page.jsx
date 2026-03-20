"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    BookOpen,
    Share2,
    ChevronRight,
    CheckCircle2,
    Rocket,
    ExternalLink,
    Lightbulb
} from 'lucide-react';
import { guidesData } from '@/data/guidesData';

const GuideDetail = () => {
    const { slug } = useParams();
    const router = useRouter();
    const guide = guidesData.find(g => g.slug === slug);

    if (!guide) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="text-center">
                    <h1 className="text-6xl font-black text-slate-900 mb-6">404</h1>
                    <p className="text-xl text-slate-600 mb-8 font-medium">Guide not found. It might have been moved or removed.</p>
                    <Link href="/free-guides" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all text-sm">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Guides
                    </Link>
                </div>
            </div>
        );
    }

    const relatedGuides = guidesData
        .filter(g => g.slug !== slug && g.category === guide.category)
        .slice(0, 3);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className={`relative pt-32 lg:pt-40 pb-24 px-6 lg:px-12 bg-gradient-to-br ${guide.color} overflow-hidden`}>
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" />
                    </svg>
                </div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-[120px]"></div>

                <div className="container mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8"
                    >
                        <Link href="/free-guides" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-black uppercase tracking-widest text-xs transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Knowledge Base
                        </Link>
                    </motion.div>

                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 mb-8"
                        >
                            <BookOpen className="w-4 h-4 text-white" />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">{guide.category}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-7xl font-black text-white leading-tight mb-8 tracking-tighter"
                        >
                            {guide.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center gap-6"
                        >
                            <div className="flex items-center gap-2 text-white font-black bg-black/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs uppercase tracking-tight">
                                <Clock className="w-4 h-4 text-cyan-300" />
                                {guide.time} Read
                            </div>
                            <div className="flex items-center gap-2 text-white font-black bg-black/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs uppercase tracking-tight">
                                <Share2 className="w-4 h-4 text-cyan-300" />
                                Free Access
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20">
                        {/* Main Article */}
                        <div className="lg:w-2/3">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="prose prose-slate max-w-none"
                            >
                                <p className="text-2xl text-slate-600 font-medium leading-relaxed mb-16 italic border-l-4 border-blue-500 pl-8">
                                    "{guide.excerpt}"
                                </p>

                                {guide.content.map((section, idx) => (
                                    <div key={idx} className="mb-16 last:mb-0 group">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <span className="text-sm font-black">{idx + 1}</span>
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight m-0 tracking-tighter">{section.title}</h2>
                                        </div>
                                        <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                            {section.text}
                                        </p>
                                    </div>
                                ))}

                                {/* Resources Section */}
                                <div className="mt-24 p-12 bg-slate-50 rounded-[3rem] border border-slate-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <Lightbulb className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight m-0 tracking-tighter">Recommended Resources</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {guide.resources.map((res, i) => (
                                            <a
                                                key={i}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
                                            >
                                                <span className="font-black text-slate-800 uppercase tracking-tight text-sm">{res.name}</span>
                                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-40 space-y-10">
                                {/* Next Steps Card */}
                                <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                    <h3 className="text-xl font-black mb-6 uppercase tracking-widest relative z-10">Master This Skill</h3>
                                    <p className="text-blue-100/80 font-medium mb-8 relative z-10">Ready to take your learning to the next level? Join our structured course program.</p>
                                    <Link href="/course" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all relative z-10 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                                        Initialize Enrollment
                                        <Rocket className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Related Guides */}
                                {relatedGuides.length > 0 && (
                                    <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm mt-10">
                                        <h3 className="text-xl font-black text-slate-950 mb-10 uppercase tracking-widest">Related <span className="text-blue-600">Nexus</span></h3>
                                        <div className="space-y-8">
                                            {relatedGuides.map((rel, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/guide/${rel.slug}`}
                                                    className="w-full flex gap-5 group items-center text-left"
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rel.color} flex items-center justify-center text-white text-xl shadow-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
                                                        <BookOpen className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-slate-950 font-black text-xs uppercase tracking-tight line-clamp-2">{rel.title}</p>
                                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{rel.category}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Area */}
            <section className="pb-24 px-6 lg:px-12">
                <div className="container mx-auto max-w-5xl">
                    <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-[3rem] p-12 lg:p-20 overflow-hidden relative group text-center lg:text-left shadow-2xl">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" />
                            </svg>
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="max-w-xl">
                                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tighter mb-4">
                                    Want More <span className="text-cyan-200">Free Knowledge?</span>
                                </h2>
                                <p className="text-white/90 text-lg font-medium leading-relaxed">
                                    Join our community for weekly insights, roadmaps, and project guides directly in your inbox.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/free-guides" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 text-xs uppercase tracking-widest">
                                    Browse All Guides
                                </Link>
                                <button className="px-10 py-5 bg-cyan-400 text-slate-900 font-black rounded-2xl shadow-xl hover:bg-cyan-300 transition-all active:scale-95 text-xs uppercase tracking-widest">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GuideDetail;
