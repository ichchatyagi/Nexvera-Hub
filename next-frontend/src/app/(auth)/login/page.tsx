"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageBackground from '@/components/PageBackground';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData);
        } catch (error) {
            // Error handling is managed in AuthContext/toast
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-transparent selection:bg-blue-100 selection:text-blue-900 overflow-hidden px-4 py-12 md:py-0 relative">
            <PageBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl min-h-[620px] bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 flex flex-col md:flex-row overflow-hidden relative z-10"
            >
                {/* Left Column: Branding Content */}
                <div className="md:w-5/12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white flex flex-col items-center justify-center gap-4 relative overflow-hidden text-center">
                    {/* Background Ornaments */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
                            <img src="/logo.png" alt="Nexvera" className="h-40 w-auto mx-auto" />
                        </Link>
                        <h2 className="text-3xl lg:text-4xl font-black leading-tight uppercase tracking-tighter mb-4">
                            Elevate <br />
                            Your Professional <br />
                            <span className="text-blue-200">Journey.</span>
                        </h2>
                        <p className="text-blue-200/60 font-medium text-xs max-w-[220px] leading-relaxed mx-auto italic">
                            Industry Hub Access Terminal.
                        </p>
                    </div>
                </div>

                {/* Right Column: Form Area */}
                <div className="md:w-7/12 p-5 lg:p-8 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black uppercase tracking-[0.3em] text-[10px] group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Website
                        </Link>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status</span>
                            <div className="flex items-center gap-1.5 justify-end">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Portal Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-4 text-center md:text-left">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight mb-0.5 uppercase leading-none">Account Login</h1>
                            <p className="text-slate-500 font-medium text-[10px] tracking-wide">Nexvera Platform Entrypoint</p>
                        </div>

                        <form className="space-y-2.5" onSubmit={handleSubmit}>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
                                    <a href="#" className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline decoration-2">Forgot?</a>
                                </div>
                                <input
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em] text-xs mt-1 disabled:opacity-70"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={18} />}
                                Sign In <ArrowLeft className="rotate-180" size={16} />
                            </button>
                        </form>

                        <div className="mt-4">
                            <div className="relative mb-3 text-center">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <span className="relative px-4 bg-white text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Quick Authentication</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                                    <Facebook className="text-[#1877F2] group-hover:scale-110 transition-transform" size={16} fill="currentColor" />
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Facebook</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                                    <Instagram className="text-[#E4405F] group-hover:scale-110 transition-transform" size={16} />
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Instagram</span>
                                </button>
                            </div>
                        </div>

                        <p className="mt-4 text-center text-slate-400 font-bold text-sm">
                            New here? <Link href="/register" className="text-blue-600 font-black hover:underline underline-offset-4 ml-1">Create Hub Account</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

