import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Clock,
    User,
    Calendar,
    ArrowRight,
    TrendingUp,
    BookOpen,
    Cpu,
    Briefcase,
    Layout,
    Lightbulb,
    Rocket,
    Map,
    Code
} from 'lucide-react';

const blogPosts = [
    {
        id: 1,
        title: "Beginner’s Guide to Web Development",
        excerpt: "A complete roadmap for aspiring web developers. Learn about frontend, backend, and full-stack paths and the technologies you need to master.",
        category: "Programming Tutorials",
        author: "Alex Rivera",
        date: "March 5, 2026",
        readTime: "12 Min Read",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
        color: "from-blue-600 to-indigo-700",
        metallicGlow: "from-blue-400 via-white to-indigo-400"
    },
    {
        id: 2,
        title: "How to Prepare for Software Developer Interviews",
        excerpt: "Master the art of technical interviews. From data structures to soft skills, we cover everything you need to land your dream job.",
        category: "Career Advice",
        author: "Sarah Bloom",
        date: "March 2, 2026",
        readTime: "15 Min Read",
        image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800",
        color: "from-emerald-600 to-teal-700",
        metallicGlow: "from-emerald-400 via-white to-teal-400"
    },
    {
        id: 3,
        title: "Top 10 Programming Languages to Learn in 2026",
        excerpt: "The technology landscape is shifting. Find out which languages are gaining traction and why they should be on your radar.",
        category: "Technology Trends",
        author: "Michael Chen",
        date: "Feb 28, 2026",
        readTime: "10 Min Read",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
        color: "from-amber-500 to-orange-600",
        metallicGlow: "from-yellow-400 via-white to-orange-400"
    },
    {
        id: 4,
        title: "How to Build Your First Portfolio Project",
        excerpt: "A step-by-step guide to conceptualizing, building, and deploying a project that will actually impress hiring managers.",
        category: "Project Guides",
        author: "Casey Neistat",
        date: "Feb 25, 2026",
        readTime: "20 Min Read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        color: "from-fuchsia-600 to-pink-700",
        metallicGlow: "from-fuchsia-400 via-white to-pink-400"
    },
    {
        id: 5,
        title: "Effective Learning Strategies for Tech Students",
        excerpt: "Stop passive consumption and start building. Learn scientifically proven methods to retain complex programming concepts.",
        category: "Learning Tips",
        author: "Dr. Aris",
        date: "Feb 20, 2026",
        readTime: "8 Min Read",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
        color: "from-purple-600 to-violet-700",
        metallicGlow: "from-purple-400 via-white to-violet-400"
    },
    {
        id: 6,
        title: "The Rise of Agentic AI in Industry",
        excerpt: "How AI agents are transforming DevOps, automation, and decision-making in large scale enterprises in 2026.",
        category: "Technology Trends",
        author: "Dr. Aris",
        date: "Feb 15, 2026",
        readTime: "18 Min Read",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        color: "from-cyan-600 to-blue-700",
        metallicGlow: "from-cyan-400 via-white to-blue-400"
    }
];

const BlogCard = ({ post }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate(`/blog/${post.id}`)}
            className={`relative p-[2px] rounded-[2.5rem] bg-gradient-to-br ${post.metallicGlow || 'from-slate-400 via-white to-slate-400'} shadow-2xl group overflow-hidden cursor-pointer h-full`}
        >
            <div className="bg-white rounded-[2.4rem] h-full flex flex-col overflow-hidden relative">
                {/* Image Section */}
                <div className="h-64 overflow-hidden relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <span className={`px-3 py-1 bg-gradient-to-r ${post.color} text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/20 shadow-lg`}>
                            {post.category}
                        </span>
                    </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight leading-normal group-hover:text-blue-600 transition-colors">
                        {post.title}
                    </h3>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-1">
                        {post.excerpt}
                    </p>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-slate-900 font-black text-xs uppercase tracking-tight">{post.author}</span>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">
                            Read Article <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Blog = () => {
    const [activeCategory, setActiveCategory] = useState("All");

    const categories = [
        { name: "All", icon: BookOpen },
        { name: "Programming Tutorials", icon: Code },
        { name: "Career Advice", icon: Briefcase },
        { name: "Technology Trends", icon: TrendingUp },
        { name: "Project Guides", icon: Layout },
        { name: "Learning Tips", icon: Lightbulb }
    ];

    const filteredPosts = activeCategory === "All"
        ? blogPosts
        : blogPosts.filter(post => post.category === activeCategory);

    return (
        <div className="bg-transparent overflow-hidden">
            {/* Blog Hero */}
            <section className="relative pt-32 lg:pt-40 pb-20 px-6 lg:px-12 overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none -mr-1/4">
                    <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                        <path d="M50,150 C200,50 400,250 500,100 L500,0 L0,0 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

                <div className="container mx-auto relative z-10 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.25em] mb-8 border border-blue-100 shadow-sm"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Insights & Guides
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-4xl lg:text-7xl font-black text-slate-900 leading-tight mb-8"
                    >
                        Nexvera Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Blog</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl mx-auto"
                    >
                        Explore insights, tutorials, career advice, and technology guides from the Nexvera Hub learning community.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-6 lg:px-12 py-5 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center gap-3 uppercase tracking-widest text-sm">
                            Explore Guides
                            <Rocket className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Blog Categories Section */}
            <section className="py-12 px-6 lg:px-12">
                <div className="container mx-auto">
                    <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                        {categories.map((cat, idx) => {
                            const Icon = cat.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setActiveCategory(cat.name)}
                                    className={`relative p-[1.5px] rounded-2xl bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-lg cursor-pointer transition-all ${activeCategory === cat.name ? 'ring-4 ring-blue-500/30 scale-105' : ''}`}
                                >
                                    <div className={`${activeCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:text-blue-600'} px-6 py-4 rounded-[0.9rem] flex items-center gap-3 transition-colors`}>
                                        <Icon className="w-5 h-5" />
                                        <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">{cat.name}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Blog Listing Grid */}
            <section className="py-20 px-6 lg:px-12">
                <div className="container mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto"
                        >
                            {filteredPosts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No articles found in this category</h3>
                        </div>
                    )}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 px-6 lg:px-12">
                <div className="container mx-auto max-w-5xl">
                    <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        viewport={{ once: true }}
                        className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-r from-slate-200 via-white to-slate-200 shadow-xl"
                    >
                        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-[2.4rem] p-10 lg:p-14 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-full h-full opacity-10">
                                <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0 100 C 20 0 50 0 100 100 Z" />
                                </svg>
                            </div>

                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
                                <div className="max-w-xl">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 mb-6 mx-auto lg:mx-0">
                                        <BookOpen className="w-4 h-4 text-white" />
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Continue Reading</span>
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tight mb-4">
                                        Continue Your <span className="text-cyan-200">Learning Journey</span>
                                    </h2>
                                    <p className="text-blue-50 text-base font-medium leading-relaxed opacity-90">
                                        Explore more courses, guides, and roadmaps from Nexvera Hub.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                    <button className="px-8 py-4 bg-white text-blue-600 font-black rounded-xl shadow-lg hover:bg-blue-50 transition-all active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-2">
                                        Browse Courses
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button className="px-8 py-4 bg-cyan-400 text-slate-900 font-black rounded-xl shadow-lg hover:bg-cyan-300 transition-all active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-2">
                                        View Roadmaps
                                        <Map className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Blog;
