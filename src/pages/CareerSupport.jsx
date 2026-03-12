import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FileText,
    Users,
    Briefcase,
    Award,
    Layout,
    Linkedin,
    MessageSquare,
    Rocket,
    CheckCircle2,
    ArrowRight,
    ChevronRight,
    TrendingUp,
    Brain,
    ShieldCheck,
    Zap,
    GraduationCap
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, index, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        className={`p-8 rounded-3xl border-2 shadow-2xl flex flex-col items-start group transition-all duration-300 ${colorClass}`}
    >
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-800 font-medium leading-relaxed">{description}</p>
    </motion.div>
);

const StepCard = ({ number, title, description, index, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`relative flex items-start gap-6 p-8 rounded-3xl bg-white border-4 shadow-2xl ${colorClass}`}
    >
        <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-xl ${colorClass.split(' ')[0].replace('border-', 'bg-')}`}>
            {number}
        </div>
        <div>
            <h4 className="text-2xl font-black text-slate-900 mb-2">{title}</h4>
            <p className="text-slate-800 font-bold leading-snug">{description}</p>
        </div>
    </motion.div>
);

const CareerSupport = () => {
    const features = [
        {
            icon: FileText,
            title: "Resume Building Assistance",
            description: "Students learn how to create ATS-friendly resumes that stand out to recruiters and hiring managers.",
            colorClass: "bg-blue-600/10 border-blue-600 text-blue-600 hover:bg-white"
        },
        {
            icon: MessageSquare,
            title: "Interview Preparation",
            description: "We provide mock interviews, common interview questions, and strategies to confidently handle technical and HR interviews.",
            colorClass: "bg-fuchsia-600/10 border-fuchsia-600 text-fuchsia-600 hover:bg-white"
        },
        {
            icon: Briefcase,
            title: "Internship Opportunity",
            description: "Students gain practical exposure by working on internship-level projects that simulate real-world work environments.",
            colorClass: "bg-cyan-600/10 border-cyan-600 text-cyan-600 hover:bg-white"
        },
        {
            icon: Award,
            title: "Internship Certification",
            description: "After successfully completing the internship and course, students receive an official certificate from Nexvera Hub.",
            colorClass: "bg-amber-600/10 border-amber-600 text-amber-600 hover:bg-white"
        },
        {
            icon: Layout,
            title: "Portfolio Development",
            description: "Students learn how to build a strong portfolio showcasing their projects, skills, and achievements.",
            colorClass: "bg-rose-600/10 border-rose-600 text-rose-600 hover:bg-white"
        },
        {
            icon: Linkedin,
            title: "LinkedIn & Job Profile Optimization",
            description: "Guidance on creating a professional LinkedIn profile and optimizing job portals to attract recruiters.",
            colorClass: "bg-indigo-600/10 border-indigo-600 text-indigo-600 hover:bg-white"
        },
        {
            icon: Users,
            title: "Career Guidance & Mentorship",
            description: "Students receive guidance from mentors on choosing the right career path in technology.",
            colorClass: "bg-emerald-600/10 border-emerald-600 text-emerald-600 hover:bg-white"
        },
        {
            icon: Rocket,
            title: "Industry-Level Projects",
            description: "Students work on projects that simulate real-world applications and strengthen their practical skills.",
            colorClass: "bg-orange-600/10 border-orange-600 text-orange-600 hover:bg-white"
        }
    ];

    const steps = [
        {
            number: 1,
            title: "Learn In-Demand Skills",
            description: "Students complete structured courses designed around industry needs.",
            colorClass: "border-blue-600"
        },
        {
            number: 2,
            title: "Build Projects",
            description: "Students build real-world projects to strengthen their practical experience.",
            colorClass: "border-cyan-600"
        },
        {
            number: 3,
            title: "Prepare for Interviews",
            description: "We train students for technical interviews, HR rounds, and communication skills.",
            colorClass: "border-fuchsia-600"
        },
        {
            number: 4,
            title: "Become Career Ready",
            description: "Students receive certifications and portfolio guidance to confidently apply for jobs.",
            colorClass: "border-amber-600"
        }
    ];

    const benefits = [
        { name: "Practical Learning", color: "bg-blue-600" },
        { name: "Real-World Projects", color: "bg-cyan-600" },
        { name: "Career Mentorship", color: "bg-purple-600" },
        { name: "Job Prep Support", color: "bg-indigo-600" },
        { name: "Internship Certification", color: "bg-amber-600" },
        { name: "Skill-Based Training", color: "bg-rose-600" }
    ];

    return (
        <div className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Your Future Starts Here</span>
                                </div>
                                <h1 className="text-4xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
                                    Career Support That Helps You <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Get Hired</span>
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
                                    At Nexvera Hub, we don't just teach skills. We help you turn those skills into real career opportunities through mentorship, career guidance, and job preparation support.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link to="/course" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-600/20 flex items-center gap-2 group">
                                        Start Learning
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/course" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:border-blue-600 transition-all duration-300 shadow-lg group">
                                        Explore Courses
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative z-10"
                            >
                                {/* Rainbow Border Wrapper */}
                                <div className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-orange-500 to-yellow-500 p-1.5 rounded-[3.2rem] shadow-2xl">
                                    <div className="bg-white rounded-[2.8rem] p-1 shadow-inner overflow-hidden">
                                        <img
                                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                                            alt="Career Success"
                                            className="rounded-[2.6rem] w-full h-auto object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-x-2 bottom-8 text-white px-8">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="avatar" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-sm font-black bg-blue-600/30 backdrop-blur-md px-3 py-1 rounded-full">Join 5,000+ Students</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-20 bg-white/30 backdrop-blur-sm border-y border-blue-100/50">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Built for the Professional World</h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Our Career Support Program is designed to help students confidently step into the professional world. From resume building to interview preparation and internship certification, we ensure every student is ready for real industry opportunities.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="mb-16 text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Everything You Need to Succeed</h2>
                        <p className="text-slate-600">Comprehensive support at every stage of your career journey.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Preparation Process */}
            <section className="py-20 bg-indigo-50/40 relative overflow-hidden">
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-1/3">
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6">Our 4-Step Career Preparation Process</h2>
                            <p className="text-slate-600 text-lg mb-8">
                                A structured path from learning to landing your dream job in tech.
                            </p>
                            <div className="space-y-4">
                                {['Industry Aligned', 'Project Focused', 'Mentorship Driven'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {steps.map((step, index) => (
                                <StepCard key={index} {...step} index={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certification Highlight */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[3rem] p-8 lg:p-12 border border-amber-100 flex flex-col lg:flex-row items-center gap-10">
                        <div className="lg:w-1/2">
                            <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-amber-600/30">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Industry-Recognized Certification</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                                After completing the course and internship program, students receive a Nexvera Hub certification verifying their skills and project experience. This certificate strengthens their profile when applying for jobs and internships.
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['Verified Skills', 'Project Authenticated', 'Industry Recognition'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-black text-slate-800">
                                        <GraduationCap className="w-5 h-5 text-amber-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative max-w-sm mx-auto"
                            >
                                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-amber-200 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                                    <div className="aspect-[4/3] w-full bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-amber-300 relative overflow-hidden group">
                                        <img
                                            src="https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=800"
                                            alt="Certificate Mockup"
                                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-amber-900/20 backdrop-blur-[2px] flex items-center justify-center">
                                            <div className="bg-white/90 px-4 py-2 rounded-xl border border-white shadow-xl flex items-center gap-2">
                                                <Award className="w-5 h-5 text-amber-600" />
                                                <span className="font-black text-xs text-slate-900 uppercase">Nexvera Certified</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Nexvera Hub */}
            <section className="py-20 bg-teal-50/30">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Why Students Choose Nexvera Hub</h2>
                        <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Excellence in education and career development</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className={`p-6 rounded-2xl flex items-center gap-4 group hover:bg-white transition-all duration-300 border border-transparent hover:border-blue-100 shadow-sm hover:shadow-xl ${benefit.color.replace('bg-', 'bg-opacity-10 text-').replace('600', '700')}`}
                                style={{ backgroundColor: `${benefit.color.includes('blue') ? '#eff6ff' : benefit.color.includes('cyan') ? '#ecfeff' : benefit.color.includes('purple') ? '#f5f3ff' : benefit.color.includes('indigo') ? '#eef2ff' : benefit.color.includes('amber') ? '#fffbeb' : '#fff1f2'}` }}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white transition-colors duration-300 ${benefit.color}`}>
                                    <CheckCircle2 className="w-6 h-6 text-white group-hover:text-blue-600 transition-colors" />
                                </div>
                                <span className="text-lg font-black tracking-tight">{benefit.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ConsultancyCTA />
        </div>
    );
};

import ConsultancyCTA from '../components/ConsultancyCTA';

export default CareerSupport;
