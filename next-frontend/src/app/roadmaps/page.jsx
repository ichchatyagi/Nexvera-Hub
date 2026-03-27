"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Map,
    Search,
    Terminal,
    Rocket,
    Zap,
    Target,
    ArrowRight,
    Users,
    Lightbulb,
    Globe,
    MessageCircle,
    Award,
    Layout
} from 'lucide-react';

const JourneyStep = ({ step, title, description, color, index, isLast, icon: Icon }) => (
    <div className="relative">
        {/* Connection Line */}
        {!isLast && (
            <div className="absolute left-[39px] md:left-1/2 top-[80px] w-1 h-32 md:-ml-0.5 bg-gradient-to-b from-blue-500/30 to-transparent z-0 hidden md:block"></div>
        )}

        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex flex-col md:flex-row items-center gap-8 mb-16 relative z-10 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
        >
            <div className={`w-full md:w-1/2 flex ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="p-[1.5px] rounded-[2.5rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl w-full max-w-md group"
                >
                    <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.4rem] relative overflow-hidden h-full flex flex-col`}>
                        {/* Decorative background shapes */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-inner group-hover:rotate-12 transition-transform">
                                <Icon className="w-7 h-7" />
                            </div>
                            <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                                Step 0{step}
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-white mb-4 leading-tight uppercase tracking-tight">{title}</h3>
                        <p className="text-white/90 text-sm font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="hidden md:flex shrink-0 w-6 h-6 rounded-full bg-white border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20"></div>

            <div className="w-full md:w-1/2"></div>
        </motion.div>
    </div>
);

const FeatureCard = ({ title, icon: Icon, color, description }) => (
    <motion.div
        whileHover={{ y: -8 }}
        className="p-[1.5px] rounded-3xl bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-xl"
    >
        <div className="bg-white p-8 rounded-[1.4rem] h-full flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                <Icon className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">{title}</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const LearningRoadmaps = () => {
    const studentJourney = [
        {
            step: 1,
            title: "Discovery & Alignment",
            description: "We help you identify the perfect career path based on your interests and industry demand, ensuring your learning journey starts with a clear purpose.",
            color: "from-blue-600 to-indigo-700",
            icon: Search
        },
        {
            step: 2,
            title: "Immersive Enrollment",
            description: "Access our premium, industry-standard curriculum designed by experts. Master the fundamentals that form the core of your professional technical toolkit.",
            color: "from-fuchsia-600 to-pink-700",
            icon: Rocket
        },
        {
            step: 3,
            title: "Advanced Enrichment",
            description: "Deep dive into complex concepts through hands-on labs and real-world project simulations. This is where theory meets practical mastery.",
            color: "from-blue-500 to-cyan-500",
            icon: Lightbulb
        },
        {
            step: 4,
            title: "Project Milestone Hub",
            description: "Build a high-performance portfolio by completing capstone projects that solve real business problems, guided by senior industry mentors.",
            color: "from-emerald-500 to-teal-600",
            icon: Layout
        },
        {
            step: 5,
            title: "Global Certification",
            description: "Achieve industry-recognized certification upon completion. We validate your skills to meet the highest standards of global tech recruiters.",
            color: "from-amber-500 to-orange-600",
            icon: Award
        },
        {
            step: 6,
            title: "Career Nexus Launch",
            description: "Transition from student to professional with our placement support, interview prep, and direct connections to our network of global partners.",
            color: "from-indigo-600 to-purple-700",
            icon: Target
        }
    ];

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative pt-6 lg:pt-12 pb-20 px-6 lg:px-12 overflow-hidden">
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.25em] mb-8 border border-blue-100 shadow-sm"
                            >
                                <Map className="w-4 h-4" />
                                The Teaching Framework
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tighter"
                            >
                                Our <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Educational</span> Roadmap
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl lg:mx-0 mx-auto"
                            >
                                Discover how Nexvera Hub transforms aspiring talent into industry leaders through our structured, multi-phase teaching methodology.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex justify-center lg:justify-start"
                            >
                                <Link href="/course" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-10 py-5 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm text-center">
                                    Join the Journey
                                    <Rocket className="w-5 h-5" />
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
                                    src="https://illustrations.popsy.co/blue/remote-work.svg"
                                    alt="Learning Roadmap"
                                    className="w-full h-auto drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none -mr-1/4">
                    <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                        <path d="M50,150 C200,50 400,250 500,100 L500,0 L0,0 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
            </section>

            {/* Teaching Methodology Highlights */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 bg-slate-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16 text-center">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight tracking-tighter">The <span className="text-blue-600">Nexvera</span> Advantage</h2>
                        <p className="text-slate-500 font-medium mt-2">Why our roadmap leads to guaranteed mastery</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        <FeatureCard
                            title="Mentor-Led"
                            icon={Users}
                            color="from-blue-500 to-indigo-600"
                            description="Direct access to industry experts who guide you through every complex concept."
                        />
                        <FeatureCard
                            title="Project-Based"
                            icon={Terminal}
                            color="from-pink-500 to-rose-600"
                            description="Learn by building. Our curriculum is centered around real-world applications."
                        />
                        <FeatureCard
                            title="Industry-Linked"
                            icon={Globe}
                            color="from-emerald-500 to-teal-600"
                            description="Our teaching aligns with the current needs of the world's leading tech companies."
                        />
                        <FeatureCard
                            title="Growth-Focused"
                            icon={Zap}
                            color="from-amber-500 to-orange-600"
                            description="We don't just teach code; we build the mindset for long-term career growth."
                        />
                    </div>
                </div>
            </section>

            {/* The Student Journey Timeline */}
            <section className="py-20 lg:py-32 px-6 lg:px-12">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-24 relative text-center">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10"></div>
                        <span className="bg-white px-8 text-4xl lg:text-5xl font-black text-slate-900 inline-block uppercase tracking-tight tracking-tighter">
                            The Student <span className="text-blue-600">Growth Path</span>
                        </span>
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] mt-4 italic">From First Enrollment to Global Certification</p>
                    </div>

                    <div className="relative">
                        {studentJourney.map((step, idx) => (
                            <JourneyStep
                                key={idx}
                                {...step}
                                index={idx}
                                isLast={idx === studentJourney.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 px-6 lg:px-12">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        viewport={{ once: true }}
                        className="relative p-[2px] rounded-[2.5rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl"
                    >
                        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-[2.4rem] p-12 lg:p-14 overflow-hidden relative group">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                                <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0 100 C 20 0 50 0 100 100 Z" />
                                </svg>
                            </div>
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                                <div className="max-w-xl">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-8 mx-auto lg:mx-0">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest">Connect with Us</span>
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tight mb-6 tracking-tighter">
                                        Still Have <span className="text-cyan-200">Questions?</span>
                                    </h2>
                                    <p className="text-white/90 text-lg font-medium leading-relaxed">
                                        If you couldn't find the answer you were looking for, our dedicated team is here to support you in your learning journey.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                    <Link href="/contact" className="px-10 py-5 bg-white text-indigo-600 font-black rounded-xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 text-xs uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-3">
                                        Contact Support
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/course" className="px-10 py-5 bg-cyan-400 text-slate-900 font-black rounded-xl shadow-xl hover:bg-cyan-300 transition-all active:scale-95 text-xs uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-3">
                                        Explore Courses
                                        <Globe className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LearningRoadmaps;
