"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Star,
    ArrowRight,
    Trophy,
    Rocket,
    Users,
    Briefcase,
    Award,
    ExternalLink,
    Heart
} from 'lucide-react';

const ScrollingMarquee = ({ children, speed = 40, direction = "left" }) => (
    <div className="flex overflow-hidden group">
        <motion.div
            initial={{ x: direction === "left" ? 0 : "-50%" }}
            animate={{ x: direction === "left" ? "-50%" : 0 }}
            transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            className="flex flex-nowrap gap-10 py-10"
        >
            {children}
            {children}
        </motion.div>
    </div>
);

const SuccessCardMarquee = ({ name, course, achievement, story, image, color, metallicGlow, isMarquee = true }) => (
    <div className={isMarquee ? "w-[450px] shrink-0" : "w-full"}>
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative p-[2px] rounded-[2.5rem] bg-gradient-to-br ${metallicGlow || 'from-slate-400 via-white to-slate-400'} shadow-2xl group overflow-hidden h-full`}
        >
            <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.4rem] h-full flex flex-col items-center text-center relative`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md p-1 mb-6 ring-4 ring-white/30">
                    <img src={image} alt={name} className="w-full h-full object-cover rounded-xl" />
                </div>

                <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{name}</h3>
                <p className="text-white/80 font-bold uppercase tracking-wider text-[10px] mb-4">{course}</p>

                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{achievement}</span>
                </div>

                <p className="text-white font-medium leading-relaxed italic opacity-90 text-sm">
                    "{story}"
                </p>
            </div>
        </motion.div>
    </div>
);

const TestimonialCardMarquee = ({ name, course, feedback, rating }) => (
    <div className="w-[350px] shrink-0">
        <motion.div
            whileHover={{ y: -5 }}
            className="p-[1.5px] rounded-3xl bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 shadow-xl h-full"
        >
            <div className="bg-white p-8 rounded-[1.4rem] h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    ))}
                </div>
                <p className="text-slate-600 font-medium italic mb-6 leading-relaxed text-sm">"{feedback}"</p>
                <div className="mt-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600">
                        {name[0]}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 leading-none">{name}</h4>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-1">{course}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
);

const ProjectCard = ({ title, tech, description }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        className="p-[2px] rounded-3xl bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-600 shadow-lg group"
    >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[1.3rem] h-full flex flex-col">
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {tech.map((t) => (
                    <span key={t} className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-tight rounded-lg border border-white/10">
                        {t}
                    </span>
                ))}
            </div>
            <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">{description}</p>
            <button className="mt-auto flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest group/btn">
                View Project
                <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
            </button>
        </div>
    </motion.div>
);

const JourneyStep = ({ step, title, description, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="flex-1 min-w-[200px] relative group"
    >
        <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/10 mb-6 z-10 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                {step}
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2 px-2 uppercase tracking-tight">{title}</h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed px-4">{description}</p>
        </div>
        {/* Connector Line (Desktop) */}
        <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[2px] bg-gradient-to-r from-slate-200 to-transparent -z-10 group-last:hidden"></div>
    </motion.div>
);

const StudentStories = () => {
    const featuredStories = [
        {
            name: "Aditi Sharma",
            course: "Full Stack Development",
            achievement: "Frontend Dev @ TechNova",
            story: "Nexvera's curriculum gave me the practical skills I needed to land my dream job right after graduation.",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
            color: "from-blue-600 to-indigo-600",
            metallicGlow: "from-blue-400 via-white to-indigo-400"
        },
        {
            name: "Sarah Chen",
            course: "Nutrition Science",
            achievement: "Certified Nutritionist",
            story: "The depth of the course was incredible. I now run my own successful consulting practice.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
            color: "from-emerald-500 to-teal-600",
            metallicGlow: "from-emerald-300 via-white to-teal-400"
        },
        {
            name: "Marco Rossi",
            course: "Conversational Spanish",
            achievement: "Fluent in 6 Months",
            story: "Nexvera's interactive methods made learning Spanish fun and effective. Highly recommended!",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            color: "from-red-500 to-orange-600",
            metallicGlow: "from-red-400 via-white to-orange-400"
        },
        {
            name: "Aisha Khan",
            course: "Startup Essentials",
            achievement: "VC Funded Founder",
            story: "The mentorship at Nexvera Hub was pivotal in refining my business model and securing funding.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
            color: "from-amber-500 to-orange-600",
            metallicGlow: "from-yellow-400 via-white to-amber-600"
        },
        {
            name: "David Miller",
            course: "Project Management",
            achievement: "Senior PM @ GlobalLogix",
            story: "The project management frameworks I learned are exactly what I use in my daily operations.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
            color: "from-purple-600 to-violet-700",
            metallicGlow: "from-purple-400 via-white to-violet-400"
        },
        {
            name: "Linda Wu",
            course: "Digital Marketing",
            achievement: "Marketing Lead @ Zenith",
            story: "Nexvera's hands-on approach to social media ads transformed my understanding of growth marketing.",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
            color: "from-pink-600 to-rose-600",
            metallicGlow: "from-pink-400 via-white to-rose-400"
        },
        {
            name: "James Wilson",
            course: "Civil Engineering",
            achievement: "Site Engineer",
            story: "The construction management modules were incredibly helpful for my field inspections.",
            image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
            color: "from-slate-700 to-slate-900",
            metallicGlow: "from-slate-400 via-white to-slate-400"
        },
        {
            name: "Elena Rodriguez",
            course: "Teaching Methodologies",
            achievement: "Award-winning Educator",
            story: "Learning modern pedagogy helped me engage my students like never before. A game-changer.",
            image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
            color: "from-cyan-500 to-blue-600",
            metallicGlow: "from-cyan-300 via-white to-blue-400"
        },
        {
            name: "Sam Taylor",
            course: "Public Speaking",
            achievement: "TEDx Speaker",
            story: "I went from stage fright to giving a professional talk. The confidence I gained is priceless.",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
            color: "from-orange-500 to-red-600",
            metallicGlow: "from-orange-400 via-white to-red-400"
        },
        {
            name: "Rajesh Kumar",
            course: "Machine Learning",
            achievement: "AI Researcher @ AI21",
            story: "The math and coding concepts were explained so clearly. It built a solid foundation for my career.",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
            color: "from-violet-600 to-purple-800",
            metallicGlow: "from-violet-400 via-white to-purple-400"
        },
        {
            name: "Chloe Bennett",
            course: "Video Production",
            achievement: "Indie Film Director",
            story: "The storytelling techniques I learned at Nexvera were the heartbeat of my first short film.",
            image: "https://images.unsplash.com/photo-1544723345-429a17387431?w=400&h=400&fit=crop",
            color: "from-fuchsia-600 to-pink-600",
            metallicGlow: "from-fuchsia-400 via-white to-pink-400"
        }
    ];

    const wallOfFame = [
        {
            name: "Rahul Verma",
            course: "Data Science",
            achievement: "Project Excellence",
            story: "Completed 5 advanced projects and received internship recognition for outstanding work.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
            color: "from-amber-500 to-orange-600",
            metallicGlow: "from-yellow-400 via-orange-100 to-yellow-600"
        },
        {
            name: "Ishani Gupta",
            course: "Mobile App Development",
            achievement: "Internship Success",
            story: "Built a fully functional e-commerce app that was featured in the student showcase.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
            color: "from-emerald-500 to-teal-600",
            metallicGlow: "from-emerald-300 via-white to-teal-400"
        }
    ];

    const testimonials = [
        { name: "Julia Parker", course: "Digital Marketing", feedback: "Nexvera Hub helped me gain confidence in coding and prepare for interviews.", rating: 5 },
        { name: "Marcus Thorne", course: "DevOps Engineer", feedback: "The Cloud & DevOps path is incredible. Highly practical and precisely what industry needs.", rating: 5 },
        { name: "Sofia Martinez", course: "Web Development", feedback: "From zero to building full-scale apps. The learning curve is perfectly balanced.", rating: 5 },
        { name: "Kevin Lee", course: "Data Science", feedback: "The AI courses are top-notch. I learned more in 3 months than self-study.", rating: 5 },
        { name: "Sarah Jenkins", course: "UI/UX Design", feedback: "A beautiful learning experience. The instructors care about your success.", rating: 5 },
        { name: "Michael Smith", course: "Cybersecurity", feedback: "In-depth labs and real-world scenarios. I feel prepared for any challenge.", rating: 5 },
        { name: "Priya Das", course: "Language Learning", feedback: "Learning Hindi was so easy with Nexvera. The native instructors are patient.", rating: 5 },
        { name: "Tom Wilson", course: "Business", feedback: "The entrepreneurship track gave me the tools to launch my startup with confidence.", rating: 4 },
        { name: "Anna Kowalski", course: "Engineering", feedback: "The civil engineering modules are very detailed and cover latest standards.", rating: 5 },
        { name: "Hiroshi Tanaka", course: "Personal Development", feedback: "The productivity coaching transformed my workflow. I'm twice as efficient now.", rating: 5 },
        { name: "Fatima Al-Sayed", course: "Management", feedback: "The project management course is essential for anyone leading teams effectively.", rating: 5 },
        { name: "Robert Brown", course: "AI", feedback: "State-of-the-art AI education. The hands-on projects are mind-blowing.", rating: 5 }
    ];

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative pt-6 lg:pt-12 pb-24 px-6 lg:px-12 overflow-hidden">
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-100"
                            >
                                <Trophy className="w-4 h-4" />
                                Student Success Center
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl lg:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tighter"
                            >
                                Student <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Success Stories</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-slate-600 font-medium leading-relaxed mb-12 lg:mx-0 mx-auto"
                            >
                                Discover how Nexvera Hub students transformed their learning into real achievements through projects, internships, and career support.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex justify-center lg:justify-start"
                            >
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm">
                                    Start Your Journey
                                    <Rocket className="w-5 h-5" />
                                </button>
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
                                    src="https://illustrations.popsy.co/blue/success.svg"
                                    alt="Student Success"
                                    className="w-full h-auto drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                        <path d="M0,100 C150,200 350,0 500,100 L500,0 L0,0 Z" fill="currentColor" />
                    </svg>
                </div>
            </section>

            {/* Featured Section Marquee */}
            <section className="py-16 lg:py-24 bg-slate-50/50">
                <div className="container mx-auto px-6 lg:px-12 mb-12 text-center text-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight tracking-tighter">Our <span className="text-blue-600">Global Achievers</span></h2>
                    <p className="text-slate-500 font-medium mt-2">Success from across all 11 of our specialized categories</p>
                </div>
                <ScrollingMarquee speed={60}>
                    {featuredStories.map((story, idx) => (
                        <SuccessCardMarquee key={idx} {...story} isMarquee={true} />
                    ))}
                </ScrollingMarquee>
            </section>

            {/* Testimonials Marquee */}
            <section className="py-16 lg:py-24 bg-blue-50/30">
                <div className="container mx-auto px-6 lg:px-12 mb-12 text-center text-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight tracking-tighter">What Our <span className="text-blue-600">Learners Say</span></h2>
                    <p className="text-slate-500 font-medium mt-2">Real feedback from over 1,000+ graduates</p>
                </div>
                <ScrollingMarquee speed={50} direction="right">
                    {testimonials.map((t, idx) => (
                        <TestimonialCardMarquee key={idx} {...t} />
                    ))}
                </ScrollingMarquee>
            </section>

            {/* Stats Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 text-center bg-white text-center">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: "Students Enrolled", value: "1,000+", icon: Users, color: "text-blue-600" },
                            { label: "Projects Built", value: "800+", icon: Rocket, color: "text-cyan-500" },
                            { label: "Internships Completed", value: "150+", icon: Briefcase, color: "text-indigo-600" },
                            { label: "Certificates Issued", value: "1,500+", icon: Award, color: "text-fuchsia-600" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className={`mb-4 mx-auto w-12 h-12 flex items-center justify-center ${stat.color} bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-xl transition-all duration-300 shadow-sm`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-5xl font-black text-slate-900 mb-2 drop-shadow-sm tracking-tighter">
                                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${stat.color.replace('text-', 'from-') + ' to-slate-400'}`}>
                                        {stat.value}
                                    </span>
                                </h4>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Wall of Fame */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="bg-white/40 backdrop-blur-xl border border-blue-50 p-12 lg:p-20 rounded-[4rem] relative overflow-hidden shadow-2xl">
                        {/* Glowing Backgrounds */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                        <div className="relative z-10 text-center mb-16 text-center">
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 font-bold tracking-tight tracking-tighter uppercase">Student <span className="text-blue-600">Wall of Fame</span></h2>
                            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
                                Celebrating our most inspiring learners who turned skills into success.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto relative z-10">
                            {wallOfFame.map((story, idx) => (
                                <SuccessCardMarquee key={idx} {...story} isMarquee={false} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Showcase */}
            <section className="py-16 lg:py-24 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-16 gap-4 text-center sm:text-left">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight tracking-tighter uppercase">Student <span className="text-blue-600">Project Showcase</span></h2>
                            <p className="text-slate-500 font-medium">Real world applications built by our students</p>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all">
                            View All Showcase <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ProjectCard
                            title="NexCommerce Platform"
                            tech={["React", "Node.js", "Tailwind"]}
                            description="A full-featured e-commerce platform with stripe integration and inventory management."
                        />
                        <ProjectCard
                            title="HealthTrack AI"
                            tech={["Python", "TensorFlow", "FastAPI"]}
                            description="An AI-powered health monitoring app that predicts metabolic trends."
                        />
                        <ProjectCard
                            title="LMS Dashboard"
                            tech={["Next.js", "Prisma", "PostgreSQL"]}
                            description="A modern learning management system with real-time course tracking and assessment tools."
                        />
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="py-16 lg:py-24 px-6 lg:px-12 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto">
                    <div className="text-center mb-20 text-center">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 font-bold tracking-tight tracking-tighter uppercase">The Student Journey</h2>
                        <p className="text-slate-500 font-medium pb-2">Your transformation from learner to leader</p>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap gap-8 justify-center items-start">
                        <JourneyStep
                            index={0}
                            step="01"
                            color="from-blue-600 to-indigo-600"
                            title="Enroll"
                            description="Choose from our wide range of industry-aligned courses."
                        />
                        <JourneyStep
                            index={1}
                            step="02"
                            color="from-cyan-500 to-blue-500"
                            title="Learn"
                            description="Gain hands-on experience through practical lessons."
                        />
                        <JourneyStep
                            index={2}
                            step="03"
                            color="from-indigo-600 to-purple-600"
                            title="Build"
                            description="Apply knowledge by creating high-quality projects."
                        />
                        <JourneyStep
                            index={3}
                            step="04"
                            color="from-fuchsia-600 to-pink-600"
                            title="Prepare"
                            description="Get expert guidance on resume & interviews."
                        />
                        <JourneyStep
                            index={4}
                            step="05"
                            color="from-orange-500 to-red-600"
                            title="Achieve"
                            description="Successfully transition into a professional career."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-6 lg:px-12">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative p-10 lg:p-14 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" />
                            </svg>
                        </div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                            <div className="lg:text-left text-center">
                                <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                        <Heart className="w-6 h-6 text-white fill-white" />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tight tracking-tighter">
                                        Your Success Story <span className="text-cyan-200">Starts Here</span>
                                    </h2>
                                </div>
                                <p className="text-white/90 font-bold max-w-xl text-lg leading-relaxed">
                                    Join Nexvera Hub and start building the skills that can transform your future in technology today.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="px-8 py-4 bg-white text-indigo-600 font-black rounded-xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap">
                                    Browse Courses
                                </button>
                                <button className="px-8 py-4 bg-cyan-400 text-slate-900 font-black rounded-xl shadow-xl hover:bg-cyan-300 transition-all active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap">
                                    Join Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default StudentStories;
