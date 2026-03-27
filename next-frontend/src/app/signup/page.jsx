"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import PageBackground from '@/components/PageBackground';

const Signup = () => {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-transparent selection:bg-blue-100 selection:text-blue-900 overflow-hidden px-4">
            <PageBackground />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 lg:p-12 relative overflow-hidden"
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                <div className="flex flex-col items-center text-center mb-10">
                    <Link href="/" className="mb-8 hover:scale-105 transition-transform block">
                        <img
                            src="/logo.png"
                            alt="Nexvera Logo"
                            className="h-20 w-auto drop-shadow-sm"
                        />
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome to</h1>
                    <h2 className="text-xl font-bold text-blue-600 uppercase tracking-[0.2em]">Nexvera Hub</h2>
                </div>

                <form className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-semibold placeholder:text-slate-300 text-sm"
                            placeholder="Full Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-semibold placeholder:text-slate-300 text-sm"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <input
                            required
                            type="password"
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-semibold placeholder:text-slate-300 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest text-xs mt-2">
                        Sign Up
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative mb-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <span className="relative px-4 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or join with</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 w-full py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                            <Facebook className="text-[#1877F2] group-hover:scale-110 transition-transform" size={18} fill="currentColor" />
                            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">Facebook</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 w-full py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                            <Instagram className="text-[#E4405F] group-hover:scale-110 transition-transform" size={18} />
                            <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">Instagram</span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-500 font-bold text-sm">
                    Existing user? <Link href="/login" className="text-blue-600 font-black hover:underline ml-1">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
