"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    return (
        <div className="min-h-screen flex bg-white selection:bg-blue-100 selection:text-blue-900">
            {/* Left side Form */}
            <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 bg-white relative overflow-hidden">
                <div className="absolute top-12 left-12">
                    <Link href="/" className="text-[1.8rem] font-black text-slate-950 uppercase tracking-tighter leading-none">
                        NEXVERA<span className="text-blue-600 font-black italic tracking-tight">Hub</span>
                    </Link>
                </div>

                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md w-full mx-auto"
                >
                    <div className="mb-12">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Access Portal</span>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-950 mb-4 tracking-tighter uppercase leading-[0.85]">Welcome <br /> <span className="text-blue-600">Back</span></h1>
                        <p className="text-slate-400 font-bold uppercase tracking-tight text-sm">Please identify your credentials to proceed.</p>
                    </div>

                    <form className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal ID (Email)</label>
                            <input 
                                required
                                type="email" 
                                className="w-full px-8 py-5 bg-slate-100 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold placeholder:text-slate-300 text-sm" 
                                placeholder="name@nexus.com" 
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
                                <a href="#" className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">Revive Key?</a>
                            </div>
                            <input 
                                required
                                type="password" 
                                className="w-full px-8 py-5 bg-slate-100 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold placeholder:text-slate-300 text-sm" 
                                placeholder="••••••••" 
                            />
                        </div>
                        <button className="w-full bg-slate-950 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-950/10 hover:bg-black hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.3em] text-[10px]">
                            Establish Connection
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px]">
                                <span className="px-6 bg-white text-slate-400 font-black uppercase tracking-[0.4em]">External Hubs</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <button className="flex items-center justify-center w-full bg-[#1877F2] text-white font-black py-5 rounded-2xl hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95">
                                <Facebook size={20} />
                            </button>
                            <button className="flex items-center justify-center w-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-black py-5 rounded-2xl hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 transition-all active:scale-95">
                                <Instagram size={20} />
                            </button>
                        </div>
                    </div>

                    <p className="mt-12 text-center text-slate-400 font-bold uppercase tracking-tight text-xs">
                        New Entity? <Link href="/signup" className="text-blue-600 font-black hover:underline ml-1">Create Account</Link>
                    </p>
                </motion.div>
            </div>

            {/* Right side Illustration */}
            <div className="hidden lg:flex flex-1 bg-slate-950 items-center justify-center p-24 relative overflow-hidden group">
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
                
                <div className="text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                    >
                        <img
                            src="https://illustrations.popsy.co/white/abstract-art-6.svg"
                            alt="Log In Illustration"
                            className="w-[450px] h-auto mb-16 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-auto group-hover:scale-105 transition-transform duration-700"
                        />
                        <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none">The <span className="text-blue-500">Nexus</span> Awaits</h2>
                        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto leading-relaxed">Join thousands of students and masters in the high-performance Nexvera community.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
