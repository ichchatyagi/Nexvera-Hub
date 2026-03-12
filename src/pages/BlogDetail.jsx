import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Tag,
    Share2,
    MessageSquare,
    ChevronRight,
    BookOpen,
    ArrowRight,
    Map,
    Rocket
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
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
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
        image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200",
        color: "from-emerald-600 to-teal-700",
        metallicGlow: "from-emerald-400 via-white to-teal-400"
    }
];

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Auto-scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const post = blogPosts.find(p => p.id === parseInt(id)) || blogPosts[0];

    return (
        <div className="bg-transparent overflow-hidden pb-24">
            {/* Header Section */}
            <header className="relative pt-32 lg:pt-40 pb-20 px-6 lg:px-12 overflow-hidden text-center lg:text-left">
                <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none -mr-1/4">
                    <svg viewBox="0 0 500 500" className="w-full h-full text-blue-400">
                        <path d="M50,150 C200,50 400,250 500,100 L500,0 L0,0 Z" fill="currentColor" />
                    </svg>
                </div>

                <div className="container mx-auto relative z-10 max-w-5xl">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/blog')}
                        className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest mb-12 hover:text-blue-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Insights
                    </motion.button>

                    <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 mb-8">
                        <div className="max-w-3xl">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`inline-block px-4 py-1.5 bg-gradient-to-r ${post.color} text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6 shadow-lg`}
                            >
                                {post.category}
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight"
                            >
                                {post.title}
                            </motion.h1>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Author</p>
                                <p className="text-slate-900 font-black text-xs uppercase">{post.author}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Published</p>
                                <p className="text-slate-900 font-black text-xs uppercase">{post.date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Read Time</p>
                                <p className="text-slate-900 font-black text-xs uppercase">{post.readTime}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content Area */}
            <section className="px-6 lg:px-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* Table of Contents - Sidebar */}
                        <aside className="lg:w-1/4 hidden lg:block sticky top-32 h-fit">
                            <div className="p-[1.5px] rounded-3xl bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-xl">
                                <div className="bg-white p-8 rounded-[1.4rem]">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        In This Article
                                    </h4>
                                    <ul className="space-y-4">
                                        {[
                                            "Introduction",
                                            "Why Learn Web Development",
                                            "Key Technologies",
                                            "Best Learning Path",
                                            "Conclusion"
                                        ].map((item, idx) => (
                                            <li key={idx}>
                                                <a href="#" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors group">
                                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </aside>

                        {/* Article Body */}
                        <div className="lg:w-3/4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative p-[2px] rounded-[3.5rem] bg-gradient-to-br from-slate-400 via-white to-slate-400 shadow-2xl mb-16 overflow-hidden"
                            >
                                <div className="bg-white rounded-[3.4rem] p-8 md:p-16">
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12 italic">
                                            "{post.excerpt}"
                                        </p>

                                        <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tight">Introduction</h2>
                                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                            The digital landscape is evolving faster than ever. As we move further into 2026, the demand for high-quality, practical technology skills has reached an all-time high. Whether you're a seasoned professional or a curious beginner, understanding the fundamental shifts in how we build and deploy software is crucial...
                                        </p>

                                        <div className={`p-8 bg-gradient-to-br ${post.color} rounded-3xl text-white mb-12 relative overflow-hidden group shadow-2xl`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                            <h3 className="text-xl font-black mb-4 uppercase tracking-widest">Key Industry Pro-Tip</h3>
                                            <p className="font-medium opacity-90 leading-relaxed italic">
                                                Consistent daily practice of at least 2 hours is more effective than long weekend study sessions. Focus on active implementation rather than just viewing tutorials.
                                            </p>
                                        </div>

                                        <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tight">Key Technologies in 2026</h2>
                                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                            We've seen major advancements in AI integration, edge computing, and high-performance frontend frameworks. Mastering these specific areas will set you apart in the competitive job market...
                                        </p>

                                        <pre className="p-8 bg-slate-900 rounded-3xl text-blue-300 font-mono text-sm overflow-x-auto shadow-inner mb-12 border border-blue-500/20">
                                            <code>{`// AI Agent Integration Example 2026
const nexusAgent = new NexveraAI.Agent({
    model: 'ultra-v3',
    capabilities: ['code_generation', 'live_debug']
});

await nexusAgent.initiateLearningFlow({
    topic: 'Web3 Architecture',
    intensity: 'maximum'
});`}</code>
                                        </pre>

                                        <blockquote className="border-l-8 border-blue-500 bg-blue-50 p-8 rounded-r-3xl text-slate-700 italic font-medium text-xl shadow-sm mb-12">
                                            "The best way to predict the future of technology is to build it yourself using the best available learning resources."
                                        </blockquote>

                                        <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tight">Conclusion</h2>
                                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                            Starting your journey might feel overwhelming, but with the right roadmap and persistence, anyone can master modern technology. Nexvera Hub is here to support you every step of the way with structured paths and direct mentorship.
                                        </p>
                                    </div>

                                    {/* Related Actions */}
                                    <div className="pt-12 border-t border-slate-100 flex flex-wrap gap-4 mt-8">
                                        <button className="flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                            Share Article
                                        </button>
                                        <button className="flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                                            <MessageSquare className="w-4 h-4" />
                                            Leave Comment
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Area */}
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
                                        <Rocket className="w-5 h-5 text-white" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest">Master Your Skill</span>
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tight mb-6">
                                        Continue Your <span className="text-cyan-200">Learning Journey</span>
                                    </h2>
                                    <p className="text-white/90 text-lg font-medium leading-relaxed">
                                        Explore more courses, guides, and roadmaps from Nexvera Hub and accelerate your professional growth.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                    <Link to="/course" className="px-8 py-4 bg-white text-indigo-600 font-black rounded-xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 text-xs uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-3">
                                        Browse Courses
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link to="/roadmaps" className="px-8 py-4 bg-cyan-400 text-slate-900 font-black rounded-xl shadow-xl hover:bg-cyan-300 transition-all active:scale-95 text-xs uppercase tracking-widest whitespace-nowrap flex items-center justify-center gap-3">
                                        View Roadmaps
                                        <Map className="w-4 h-4" />
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

export default BlogDetail;
