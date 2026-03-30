"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageBackground from '@/components/PageBackground';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
        } catch (error) {
            // Error handling is managed in AuthContext/toast
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-transparent selection:bg-blue-100 selection:text-blue-900 overflow-hidden px-4 py-12 relative">
            <PageBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl min-h-[620px] bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 flex flex-col md:flex-row overflow-hidden relative z-10"
            >
                {/* Left Column: Branding Content */}
                <div className="md:w-5/12 bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-600 p-8 text-white flex flex-col items-center justify-center gap-4 relative overflow-hidden text-center">
                    {/* Background Ornaments */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-32 -mb-32"></div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
                            <img src="/logo.png" alt="Nexvera" className="h-40 w-auto mx-auto" />
                        </Link>
                        <h2 className="text-3xl lg:text-4xl font-black leading-tight uppercase tracking-tighter mb-4">
                            Join <br />
                            the Global <br />
                            <span className="text-blue-200">Elite.</span>
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
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Gateway</span>
                            <div className="flex items-center gap-1.5 justify-end">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Public Access</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-4 text-center md:text-left">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight mb-0.5 uppercase leading-none">Initialize Account</h1>
                            <p className="text-slate-500 font-medium text-[10px] tracking-wide">Nexvera Platform Access Gateway</p>
                        </div>

                        <form className="space-y-2.5" onSubmit={handleSubmit}>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Channel</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Vault</label>
                                <input
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                            <div className="space-y-1.5 pb-0.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Path</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['student', 'teacher'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role as any })}
                                            className={`py-2 rounded-[1.2rem] border text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em] text-xs mt-1 disabled:opacity-70"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={18} />}
                                Create Profile <ArrowLeft className="rotate-180" size={16} />
                            </button>
                        </form>

                        <div className="mt-4">
                            <div className="relative mb-3 text-center">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                <span className="relative px-4 bg-white text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Global Authentication</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 w-full py-2 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                                    <Facebook className="text-[#1877F2] group-hover:scale-110 transition-transform" size={16} fill="currentColor" />
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Facebook</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 w-full py-2 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                                    <Instagram className="text-[#E4405F] group-hover:scale-110 transition-transform" size={16} />
                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Instagram</span>
                                </button>
                            </div>
                        </div>

                        <p className="mt-4 text-center text-slate-400 font-bold text-sm">
                            Existing user? <Link href="/login" className="text-blue-600 font-black hover:underline underline-offset-4 ml-1">Login to Hub</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

