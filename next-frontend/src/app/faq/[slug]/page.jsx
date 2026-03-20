"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, CheckCircle2, ShieldCheck, Cpu, Award, Briefcase, ChevronRight } from 'lucide-react';

const faqDetailsData = {
    "how-to-start-learning": {
        title: "How do I start learning on Nexvera Hub?",
        category: "Getting Started",
        icon: Rocket,
        color: "from-blue-600 to-indigo-600",
        metallicGlow: "from-blue-400 via-white to-indigo-400",
        lastUpdated: "March 2026",
        content: (
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p>
                    Starting your learning journey on Nexvera Hub is designed to be straightforward and clear. We believe in removing barriers to education and helping you jump right into building real skills.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-8">
                    <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Your 4-Step Action Plan</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 mt-0.5 text-xs">1</div>
                            <div>
                                <strong className="text-slate-900 block mb-1 font-black uppercase tracking-tight text-sm">Create an Account</strong>
                                <span className="text-base font-medium">Sign up for a free Nexvera Hub account to access your personal dashboard. This will be your central hub for tracking progress and accessing materials.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 mt-0.5 text-xs">2</div>
                            <div>
                                <strong className="text-slate-900 block mb-1 font-black uppercase tracking-tight text-sm">Explore the Catalog</strong>
                                <span className="text-base font-medium">Browse our course catalog. Whether you're interested in Front-End Development, Data Science, or UI/UX Design, we have structured paths for you.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 mt-0.5 text-xs">3</div>
                            <div>
                                <strong className="text-slate-900 block mb-1 font-black uppercase tracking-tight text-sm">Enroll in a Track</strong>
                                <span className="text-base font-medium">Choose a course that aligns with your goals and enroll. Our courses range from beginner-friendly to advanced masterclasses.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 mt-0.5 text-xs">4</div>
                            <div>
                                <strong className="text-slate-900 block mb-1 font-black uppercase tracking-tight text-sm">Start Building</strong>
                                <span className="text-base font-medium">Access the first module and begin your hands-on learning. Set up your development environment and write your first lines of code!</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <p className="font-medium">
                    Once enrolled, you'll immediately gain access to high-quality video lectures, interactive coding environments, and our supportive community discord server.
                </p>
                <p className="font-medium">
                    If you're unsure where to begin, check out our <strong>Learning Roadmaps</strong> section for guided paths tailored to specific career outcomes.
                </p>
            </div>
        )
    },
    "certification-details": {
        title: "Do I get certification after course completion?",
        category: "Certifications & Credentials",
        icon: Award,
        color: "from-emerald-500 to-teal-600",
        metallicGlow: "from-emerald-300 via-white to-teal-400",
        lastUpdated: "March 2026",
        content: (
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p>
                    <strong>Yes, absolutely.</strong> Upon successful completion of any premium course or career track on Nexvera Hub, you will receive an industry-recognized certificate of completion.
                </p>
                <div className="py-6 border-y border-slate-100 my-8">
                    <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">What makes our certificates valuable?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900 font-black uppercase tracking-tight text-xs mb-1">Verifiable Credentials</strong>
                                <span className="text-xs font-medium text-slate-600">Each certificate has a unique verification URL that employers can check.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <Briefcase className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900 font-black uppercase tracking-tight text-xs mb-1">Portfolio Integration</strong>
                                <span className="text-xs font-medium text-slate-600">Certificates link directly to the portfolio of projects you built during the course.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900 font-black uppercase tracking-tight text-xs mb-1">Industry Aligned</strong>
                                <span className="text-xs font-medium text-slate-600">Curriculum designed in partnership with leading tech companies.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <Cpu className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900 font-black uppercase tracking-tight text-xs mb-1">Skill Validation</strong>
                                <span className="text-xs font-medium text-slate-600">Proves you can actually build things, not just pass multiple-choice tests.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-8 mb-4 uppercase tracking-tighter">Requirements for Certification</h3>
                <p className="font-medium">To ensure the integrity and value of our certificates, they are not handed out just for watching videos. You must complete the required coursework, including:</p>
                <ul className="list-disc pl-6 space-y-4 mb-6 font-medium text-base">
                    <li>Watching at least 90% of all video lectures in the course.</li>
                    <li>Successfully passing all module quizzes and assessments.</li>
                    <li><strong>Crucially:</strong> Submitting the final capstone project and having it pass our internal review process.</li>
                </ul>
                <p className="font-medium">
                    Once these criteria are met, your certificate will be automatically generated and available in your dashboard for download or adding to your LinkedIn profile.
                </p>
            </div>
        )
    },
    "project-inclusion": {
        title: "Are projects included in the courses?",
        category: "Curriculum & Projects",
        icon: Cpu,
        color: "from-purple-600 to-violet-700",
        metallicGlow: "from-purple-400 via-white to-violet-400",
        lastUpdated: "March 2026",
        content: (
            <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                <p>
                    <strong>Yes, projects aren't just included—they are the core focus of Nexvera Hub.</strong> We strongly believe in project-based learning. You don't learn to code by passively watching videos; you learn by building real things and solving real problems.
                </p>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-3xl border border-purple-100 my-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">The Nexvera Project Hierarchy</h3>
                    <div className="space-y-6 text-left">
                        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
                            <h4 className="font-black text-purple-900 flex items-center gap-2 mb-2 uppercase tracking-tight text-sm">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                Mini-Projects (Module Level)
                            </h4>
                            <p className="text-xs text-slate-600 font-medium">Small, focused assignments designed to reinforce specific concepts taught in a single module (e.g., building a simple calculator after learning JavaScript functions).</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
                            <h4 className="font-black text-purple-900 flex items-center gap-2 mb-2 uppercase tracking-tight text-sm">
                                <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                                Guided Projects (Section Level)
                            </h4>
                            <p className="text-xs text-slate-600 font-medium">Larger projects built step-by-step alongside the instructor. These combine multiple concepts into a cohesive application (e.g., a weather dashboard using APIs).</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
                            <h4 className="font-black text-violet-900 flex items-center gap-2 mb-2 uppercase tracking-tight text-sm">
                                <div className="w-6 h-6 rounded-full bg-violet-700"></div>
                                Capstone Projects (Course Level)
                            </h4>
                            <p className="text-xs text-slate-600 font-medium">Massive, real-world portfolio pieces built entirely independently based on a set of requirements. These are the projects that will get you hired (e.g., a full-stack e-commerce platform with authentication and payment processing).</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mt-8 mb-4 uppercase tracking-tight">Why is this important?</h3>
                <p className="font-medium">
                    When you apply for a job, employers care far more about your portfolio than anything else. By the time you finish a career track at Nexvera Hub, you will have a comprehensive portfolio of professional-grade applications to showcase.
                </p>
                <p className="font-medium">
                    Furthermore, building projects forces you to confront the realities of development: reading documentation, debugging messy errors, architecture planning, and deployment. This "struggle" is where real learning happens.
                </p>
            </div>
        )
    }
};

const FAQDetail = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const faq = faqDetailsData[slug];

    if (!faq) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center bg-white">
                <h1 className="text-6xl font-black text-slate-950 mb-4 tracking-tighter uppercase">404</h1>
                <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Article Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">We couldn't find the detailed answer you were looking for. It may have been moved or removed.</p>
                <Link href="/faq" className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" /> Back to FAQ
                </Link>
            </div>
        );
    }

    const Icon = faq.icon;

    return (
        <div className="bg-white overflow-hidden min-h-screen">
            {/* Header Section */}
            <section className="relative pt-32 lg:pt-40 pb-16 px-6 lg:px-12 overflow-hidden bg-slate-50/50 border-b border-slate-200/50">
                <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${faq.color} opacity-[0.05] rounded-full blur-3xl -mr-96 -mt-96 pointer-events-none`}></div>

                <div className="container mx-auto relative z-10 max-w-4xl">
                    <button
                        onClick={() => router.push('/faq')}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-950 font-black text-[10px] tracking-widest uppercase mb-8 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to all FAQs
                    </button>

                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className={`px-5 py-2 rounded-xl bg-gradient-to-r ${faq.color} text-white text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-lg shadow-blue-500/10`}>
                            <Icon size={14} />
                            {faq.category}
                        </div>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-slate-200 rounded-xl bg-white">Updated {faq.lastUpdated}</span>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-950 leading-[0.9] mb-8 tracking-tighter uppercase"
                    >
                        {faq.title}
                    </motion.h1>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="prose prose-slate max-w-none">
                            {faq.content}
                        </div>

                        <div className="mt-20 pt-16 border-t border-slate-100">
                            <h3 className="text-3xl font-black text-slate-950 mb-8 uppercase tracking-tighter">Still need <span className="text-blue-600">help?</span></h3>
                            <div className="flex flex-col sm:flex-row gap-5">
                                <Link href="/contact" className="px-10 py-5 bg-slate-950 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-xl shadow-slate-950/10">
                                    Contact Support
                                </Link>
                                <Link href="/course" className={`px-10 py-5 bg-gradient-to-r ${faq.color} text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs`}>
                                    Explore Courses <ChevronRight size={16} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQDetail;
