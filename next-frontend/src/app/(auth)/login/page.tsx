"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Loader2 } from 'lucide-react';
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back to</h1>
                    <h2 className="text-xl font-bold text-blue-600 uppercase tracking-[0.2em]">Nexvera Hub</h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-semibold placeholder:text-slate-300 text-sm"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                            <a href="#" className="text-xs text-blue-600 font-bold hover:underline">Forgot?</a>
                        </div>
                        <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-semibold placeholder:text-slate-300 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest text-xs mt-2 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isLoading && <Loader2 className="animate-spin" size={16} />}
                        Login
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative mb-6 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <span className="relative px-4 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or login with</span>
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

                <p className="mt-10 text-center text-slate-500 font-bold text-sm">
                    New here? <Link href="/register" className="text-blue-600 font-black hover:underline ml-1">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
