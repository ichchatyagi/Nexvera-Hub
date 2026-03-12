import React from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    CheckCircle2,
    Briefcase,
    Layout,
    Target,
    Rocket,
    Zap,
    ArrowRight,
    Search,
    ChevronRight,
    ShieldCheck,
    Globe,
    Star,
    Brain,
    Video,
    Terminal,
    GraduationCap,
    TrendingUp,
    Activity
} from 'lucide-react';

const CertificationCard = ({ title, description, skills, level, color, metallicGlow }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        className={`relative p-[1.5px] rounded-[2.5rem] bg-gradient-to-br ${metallicGlow || 'from-slate-400 via-white to-slate-400'} shadow-2xl group overflow-hidden cursor-pointer h-full`}
    >
        <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.4rem] h-full flex flex-col relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/20">
                    {level}
                </span>
                <Award className="w-5 h-5 text-white/80" />
            </div>

            <h3 className="text-2xl font-black text-white mb-4 leading-tight uppercase tracking-tight">{title}</h3>

            <p className="text-white/80 text-xs font-medium leading-relaxed mb-6 flex-1">
                {description}
            </p>

            <div className="mb-8">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-3">Skills Covered</p>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-black/10 rounded-md text-white/90 text-[10px] font-bold">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <button className="flex items-center justify-between w-full px-5 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all group/btn shadow-lg">
                View Details
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
    </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="relative p-[1.5px] rounded-[2rem] bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-xl"
    >
        <div className={`bg-gradient-to-br ${color} p-8 rounded-[1.9rem] h-full relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/20 shadow-inner group-hover:rotate-12 transition-transform">
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-white mb-3 leading-tight uppercase tracking-tight">{title}</h4>
            <p className="text-white/80 text-xs font-medium leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const LandscapeStep = ({ step, title, description, isLast }) => (
    <div className="flex-1 min-w-[250px] relative">
        {!isLast && (
            <div className="absolute top-10 left-[80%] w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent hidden lg:block"></div>
        )}

        <div className="flex flex-col items-center text-center px-4">
            <div className="relative z-10 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] border-2 border-white/20">
                    {step}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-[1.5px] rounded-3xl bg-gradient-to-b from-slate-400 via-white to-slate-400 shadow-xl w-full"
            >
                <div className="bg-white p-6 rounded-[1.4rem] min-h-[160px] flex flex-col justify-center">
                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{title}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                        {description}
                    </p>
                </div>
            </motion.div>
        </div>
    </div>
);

const Certifications = () => {
    const categoriesSet = [
        { name: "IT & Technology", color: "text-blue-500" },
        { name: "Health & Wellness", color: "text-emerald-500" },
        { name: "Language Learning", color: "text-amber-500" },
        { name: "Business & Entrepreneurship", color: "text-purple-500" },
        { name: "Management", color: "text-rose-500" },
        { name: "Sales & Marketing", color: "text-cyan-500" },
        { name: "Engineering & Construction", color: "text-orange-500" },
        { name: "Teaching & Academics", color: "text-indigo-500" },
        { name: "Personal Development", color: "text-fuchsia-500" },
        { name: "Artificial Intelligence", color: "text-sky-500" },
        { name: "Media & Entertainment", color: "text-teal-500" }
    ];

    const certs = [
        {
            title: "AI Specialist",
            description: "Master the intersection of machine learning, neural networks, and prompt engineering.",
            skills: ["ML Ops", "NLP", "Computer Vision", "Generative AI"],
            level: "Advanced",
            color: "from-blue-600 to-indigo-700"
        },
        {
            title: "Media Production",
            description: "Advanced certification in cinematic video production and digital entertainment workflows.",
            skills: ["Filmmaking", "Post-Production", "Sound Design", "Animation"],
            level: "Intermediate",
            color: "from-emerald-600 to-teal-700"
        },
        {
            title: "Full Stack IT",
            description: "A comprehensive certification covering backend systems and frontend architecture.",
            skills: ["Node.js", "React", "Docker", "Cybersecurity"],
            level: "Advanced",
            color: "from-purple-600 to-violet-700"
        },
        {
            title: "Modern Pedagogy",
            description: "Certification for advanced teaching methodologies and educational technology integration.",
            skills: ["Blended Learning", "Classroom Mgmt", "LMS Admin", "Child Psych"],
            level: "Intermediate",
            color: "from-amber-500 to-orange-600"
        },
        {
            title: "Sales & Marketing",
            description: "Master digital marketing growth hacks and high-ticket sales psychology.",
            skills: ["SEO/SEM", "GaryVee Strategy", "Negotiation", "CRM"],
            level: "Beginner",
            color: "from-fuchsia-600 to-pink-700"
        },
        {
            title: "Health & Nutrition",
            description: "Professional certification in nutrition science and holistic wellness coaching.",
            skills: ["Diet Planning", "Stress Mgmt", "Fitness Science", "Yoga"],
            level: "Beginner",
            color: "from-cyan-600 to-blue-700"
        }
    ];

    const benefits = [
        { icon: ShieldCheck, title: "Skill Validation", description: "Industry-recognized proof of your technical expertise.", color: "from-blue-600 to-blue-800" },
        { icon: Briefcase, title: "Hands-on Experience", description: "Certifications are based on building real-world projects.", color: "from-emerald-600 to-teal-700" },
        { icon: Layout, title: "Stronger Portfolio", description: "Stand out to recruiters with a verified portfolio.", color: "from-amber-500 to-orange-600" },
        { icon: Globe, title: "Career Opportunities", description: "Access a wider range of high-paying global roles.", color: "from-purple-600 to-pink-700" }
    ];

    const students = [
        { name: "John Doe", cert: "AI & ML Track", msg: "The AI certification landed me my first specialist role within 2 weeks!", color: "from-blue-600 to-indigo-700" },
        { name: "Sarah Smith", cert: "Media Production", msg: "The practical project requirement helped me build a portfolio for film school.", color: "from-emerald-600 to-teal-700" },
        { name: "Michael Lee", cert: "Full Stack IT", msg: "Industry-standard tools and direct feedback from mentors was invaluable.", color: "from-purple-600 to-violet-700" },
        { name: "Emily Chen", cert: "Academic Specialist", msg: "The teaching methodologies module transformed my classroom engagement.", color: "from-amber-500 to-orange-600" }
    ];

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
                <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.25em] mb-8 border border-blue-100 shadow-sm"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Industry Accredited
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-4xl lg:text-7xl font-black text-slate-900 leading-tight mb-8"
                        >
                            Professional <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Certifications</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl lg:mx-0 mx-auto"
                        >
                            Earn industry-recognized certifications from Nexvera Hub and showcase your skills with confidence. Our programs validate your knowledge and help you stand out.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center"
                        >
                            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-10 py-5 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm">
                                Explore Certifications
                                <Target className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>

                    <div className="flex-1 w-full max-w-xl order-1 lg:order-2">
                        {/* Certificate Mockup on Right Side of Hero */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotate: 2 }}
                            animate={{ opacity: 1, x: 0, rotate: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-gradient-to-br from-blue-950 to-slate-900 rounded-[2.5rem] shadow-3xl relative group overflow-hidden border-[8px] border-white ring-1 ring-slate-200"
                        >
                            <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
                            <div className="relative z-10 p-8 border border-white/10 flex flex-col items-center text-center">
                                <Award className="w-12 h-12 text-yellow-500 mb-6" />
                                <h3 className="text-white text-lg font-black uppercase tracking-[0.2em] mb-4">Certificate of Excellence</h3>
                                <div className="w-20 h-0.5 bg-yellow-500/30 mb-6"></div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">This certifies that</p>
                                <p className="text-white text-3xl font-serif mb-6 italic">Nexvera Graduate</p>
                                <p className="text-cyan-400 text-sm font-black uppercase tracking-widest">Professional Specialization</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Category Marquee - Colorful Text */}
            <div className="bg-transparent py-4 overflow-hidden relative border-y border-slate-100">
                <motion.div
                    animate={{ x: [0, -2000] }}
                    transition={{ duration: 35, ease: "linear", repeat: Infinity }}
                    className="flex whitespace-nowrap gap-16 items-center relative z-10"
                >
                    {[...categoriesSet, ...categoriesSet, ...categoriesSet].map((cat, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span className={`text-sm font-black uppercase tracking-widest ${cat.color}`}>{cat.name}</span>
                            <Star className="w-3 h-3 text-slate-200 fill-slate-100" />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Why Certification Matters */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-8 font-bold uppercase tracking-tight text-center lg:text-left">
                                Why Professional <br /> <span className="text-blue-600">Certification</span> Matters
                            </h2>
                            <p className="text-slate-600 text-lg font-medium leading-relaxed text-center lg:text-left">
                                Professional certifications demonstrate your expertise and commitment to learning. Nexvera Hub certifications help learners showcase their skills through structured training, practical projects, and successful course completion.
                            </p>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {benefits.map((benefit, idx) => (
                                <FeatureCard key={idx} {...benefit} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Available Certifications Grid */}
            <section className="py-20 lg:py-32 px-6 lg:px-12 relative bg-slate-50/50">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 font-bold uppercase tracking-tight mb-6 text-center">
                            Certifications for <span className="text-blue-600 underline underline-offset-8 decoration-blue-200">Every Direction</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-center">
                            We provide industry-standard certifications across all categories of excellence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {certs.map((cert, idx) => (
                            <CertificationCard key={idx} {...cert} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Certification Process Timeline - Landscape */}
            <section className="py-20 lg:py-32 px-6 lg:px-12 relative">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight font-bold uppercase tracking-tight text-center">
                            The Path to <span className="text-blue-600">Professional Excellence</span>
                        </h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 lg:overflow-x-auto lg:pb-12 scrollbar-hide items-center lg:items-start">
                        <LandscapeStep step="1" title="Enroll in Course" description="Choose any course track and get immediate access." />
                        <LandscapeStep step="2" title="Complete Modules" description="Work through structured lessons and workshops." />
                        <LandscapeStep step="3" title="Build Real Projects" description="Apply knowledge by building complex applications." />
                        <LandscapeStep step="4" title="Final Assessment" description="Pass a comprehensive final review by experts." />
                        <LandscapeStep step="5" title="Get Certified" description="Receive your official verifiable Nexvera Hub certification." isLast={true} />
                    </div>
                </div>
            </section>

            {/* Student Success Marquee - Colorful Cards */}
            <section className="py-20 lg:py-32 px-6 lg:px-12 overflow-hidden relative">
                <div className="container mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Certified Community</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 font-bold uppercase tracking-tight mb-4 text-center">
                            Success <span className="text-blue-600 underline underline-offset-8 decoration-blue-200">Stories</span>
                        </h2>
                    </div>

                    <div className="flex overflow-hidden relative">
                        <motion.div
                            animate={{ x: [0, -1600] }}
                            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                            className="flex gap-10"
                        >
                            {[...students, ...students, ...students].map((student, i) => (
                                <div
                                    key={i}
                                    className={`flex-shrink-0 w-[400px] p-[2px] rounded-[2.5rem] bg-gradient-to-br ${student.color} shadow-2xl transition-all h-fit`}
                                >
                                    <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2.4rem] h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 p-1 border border-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?img=${(i % 50) + 10}`} alt="student" className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all" />
                                            </div>
                                            <div>
                                                <h4 className="text-slate-900 font-black text-sm uppercase leading-none mb-1">{student.name}</h4>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r ${student.color} text-white uppercase tracking-widest`}>{student.cert}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 italic font-medium leading-relaxed text-sm">"{student.msg}"</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>
            <ConsultancyCTA />
        </div>
    );
};

import ConsultancyCTA from '../components/ConsultancyCTA';

export default Certifications;
