import React from 'react';

const RefundAndCancellation = () => {
    return (
        <div className="min-h-screen py-24 px-6 lg:px-12 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-16 text-center">
                    <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Financial Framework</p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">
                        Refund & <span className="text-blue-500">Cancellation</span>
                    </h1>
                    <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/50 text-slate-600 font-bold shadow-sm text-sm">
                        <span>Effective: 15.04.2026</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>nexveraHub.com</span>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 shadow-2xl shadow-blue-900/5">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 italic">01. Our policy</h2>
                        <div className="text-lg text-slate-600 leading-relaxed font-bold">
                            <p>
                                At <strong className="text-slate-900 underline decoration-blue-500 underline-offset-8 font-black">NexveraHub.com</strong>, we strive to provide high-quality learning experiences. This policy outlines the terms for refunds and cancellations.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50/50 backdrop-blur-md rounded-[40px] p-10 border border-blue-100 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl"></div>
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Course Purchases
                             </h3>
                             <div className="space-y-6 text-slate-500 text-sm font-bold leading-relaxed">
                                <div>
                                    <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest mb-2">Eligibility</h4>
                                    <p className="italic">Requests within 7–15 days of purchase and less than 30% content accessed.</p>
                                </div>
                                <div className="h-px bg-blue-100"></div>
                                <div>
                                    <h4 className="font-black text-blue-400 text-xs uppercase tracking-widest mb-2">Non-Refundable</h4>
                                    <p className="italic">Significant content access, downloads, or discounted promo purchases.</p>
                                </div>
                             </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-10 border border-slate-100 shadow-sm">
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Process
                             </h3>
                             <div className="space-y-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-100 flex items-center justify-center text-blue-600 font-black italic shadow-sm">01</div>
                                    <p className="text-sm font-bold text-slate-600">Email contact@nexveraHub.com</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-100 flex items-center justify-center text-blue-600 font-black italic shadow-sm">02</div>
                                    <p className="text-sm font-bold text-slate-600">Review within 3–5 Business Days</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-100 flex items-center justify-center text-blue-600 font-black italic shadow-sm">03</div>
                                    <p className="text-sm font-bold text-slate-600">Process within 7–10 Business Days</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 space-y-12 shadow-lg shadow-blue-900/5">
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 italic">Performance Disclaimer</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-bold italic border-l-4 border-blue-400 pl-6">
                                "Expected leads" or outcomes mentioned in any plan are estimates only and not guaranteed. Refunds will not be issued based on performance expectations alone.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-500 font-bold text-xs">
                             <div className="p-8 rounded-3xl bg-blue-50/30 border border-blue-100 shadow-sm">
                                <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest mb-2 font-black">Subscriptions</h4>
                                <p>Fees non-refundable once billed. Cancel future renewals at any time.</p>
                             </div>
                             <div className="p-8 rounded-3xl bg-blue-50/30 border border-blue-100 shadow-sm">
                                <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest mb-2 font-black">Service Offerings</h4>
                                <p>Eligibility depends on milestone completion and service usage.</p>
                             </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/70 backdrop-blur-xl border border-blue-200/50 rounded-[40px] p-12 text-center relative overflow-hidden shadow-sm">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Refund Support</h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto italic font-bold leading-relaxed">Have a specific question about your purchase? We're here to help.</p>
                        <div className="inline-flex flex-col gap-1">
                            <p className="text-blue-600 font-black text-xl tracking-tight">contact@nexveraHub.com</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">nexveraHub.com | 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundAndCancellation;
