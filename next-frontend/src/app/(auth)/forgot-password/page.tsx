"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, KeyRound, Mail, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageBackground from '@/components/PageBackground';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await api.post('/auth/forgot-password', { email: formData.email });
            toast.success('Reset code sent to your email');
            setStep('otp');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send reset code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setIsLoading(true);
            await api.post('/auth/reset-password', {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });
            toast.success('Password reset successfully!');
            window.location.href = '/login';
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Automatically convert to uppercase and limit to 5 chars
        const val = e.target.value.toUpperCase().slice(0, 5);
        setFormData({ ...formData, otp: val });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-transparent selection:bg-blue-100 selection:text-blue-900 overflow-hidden px-4 py-12 relative">
            <PageBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl min-h-[500px] bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 p-8 md:p-12 flex flex-col relative z-10 overflow-hidden"
            >
                {/* Background Ornaments */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -ml-24 -mb-24 opacity-50"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black uppercase tracking-[0.3em] text-[10px] group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Security</span>
                        <div className="flex items-center gap-1.5 justify-end">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Recovery Flow</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {step === 'email' ? (
                            <motion.div
                                key="email-step"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="text-center md:text-left mb-8">
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase leading-none">Security Recovery</h1>
                                    <p className="text-slate-500 font-medium text-xs tracking-wide">Enter your email to receive a recovery code</p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <Mail size={12} /> Email Address
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-70"
                                    >
                                        {isLoading && <Loader2 className="animate-spin" size={18} />}
                                        Send Recovery Code <ArrowLeft className="rotate-180" size={16} />
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center md:text-left mb-6">
                                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                        <CheckCircle2 size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Code Dispatched</span>
                                    </div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase leading-none">Validate Code</h1>
                                    <p className="text-slate-500 font-medium text-xs tracking-wide">Enter the 5-char code and your new security key</p>
                                </div>

                                <form onSubmit={handleResetSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                            <KeyRound size={12} /> Recovery OTP
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.otp}
                                            onChange={handleOtpChange}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-black text-center tracking-[0.5em] text-lg uppercase placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-200"
                                            placeholder="XXXXX"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Security Key</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Security Key</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all font-bold placeholder:text-slate-200 text-sm"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-70"
                                    >
                                        {isLoading && <Loader2 className="animate-spin" size={18} />}
                                        Update Security Key <ArrowLeft className="rotate-180" size={16} />
                                    </button>
                                </form>
                                <button
                                    onClick={() => setStep('email')}
                                    className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                                >
                                    Resend Code
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
