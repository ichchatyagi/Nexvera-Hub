import React from 'react';
import { NavLink } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

const SignUp = () => {
    return (
        <div className="min-h-screen flex flex-row-reverse">
            {/* Left side Form (visually right because of flex-row-reverse) */}
            <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 lg:px-24 bg-white relative overflow-hidden">
                <div className="absolute top-10 right-12">
                    <NavLink to="/" className="text-2xl font-black text-blue-900 uppercase">
                        NEXVERA<span className="text-cyan-500 lowercase font-medium ml-0.5 italic">Hub</span>
                    </NavLink>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Create Account</h1>
                    <p className="text-slate-500 mb-10">Start your 14-day free trial today.</p>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Full Name</label>
                            <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-blue-100" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Email</label>
                            <input type="email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-blue-100" placeholder="name@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Password</label>
                            <input type="password" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-blue-100" placeholder="••••••••" />
                        </div>
                        <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all">
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-bold uppercase tracking-widest text-[10px]">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center w-full bg-[#1877F2] text-white font-bold py-4 rounded-2xl hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all border border-transparent">
                                <Facebook className="w-6 h-6" />
                            </button>
                            <button className="flex items-center justify-center w-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold py-4 rounded-2xl hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 transition-all border border-transparent">
                                <Instagram className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-slate-500">
                        Already have an account? <NavLink to="/login" className="text-blue-600 font-bold hover:underline">Log In</NavLink>
                    </p>
                </div>
            </div>

            {/* Right side Illustration (visually left because of flex-row-reverse) */}
            <div className="hidden lg:flex flex-1 bg-blue-600 items-center justify-center p-24">
                <div className="text-center text-white">
                    <img
                        src="https://illustrations.popsy.co/white/success.svg"
                        alt="SignUp Illustration"
                        className="w-80 h-auto mb-12 drop-shadow-2xl mx-auto"
                    />
                    <h2 className="text-4xl font-black mb-4">Level Up Your Skills</h2>
                    <p className="text-blue-100 text-lg">Access 200+ premium courses and certificates recognized globally.</p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
