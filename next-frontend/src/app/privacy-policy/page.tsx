import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen py-24 px-6 lg:px-12 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-16 text-center">
                    <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Privacy Framework</p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">
                        Privacy <span className="text-blue-500">Policy</span>
                    </h1>
                    <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/50 text-slate-600 font-bold shadow-sm text-sm">
                        <span>Effective: 15.04.2026</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>nexveraHub.com</span>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 shadow-2xl shadow-blue-900/5">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 italic">01. Introduction</h2>
                        <div className="text-lg text-slate-600 leading-relaxed space-y-6 font-medium">
                            <p>
                                NexveraHub.com (“we”, “our”, “us”) is committed to protecting your privacy in accordance with applicable Indian laws, including the <strong className="text-slate-900">Information Technology Act, 2000</strong> and the <strong className="text-slate-900">IT Rules, 2021</strong>.
                            </p>
                            <p>
                                By using NexveraHub.com, you consent to the collection and use of your information as described in this Privacy Policy.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50/50 backdrop-blur-md rounded-[40px] p-10 border border-blue-100 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-400/10 transition-all"></div>
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Data Collection
                             </h3>
                             <ul className="space-y-4 text-slate-600 text-sm font-bold">
                                <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></span> Personal ID (Name, Email, Phone)</li>
                                <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></span> Billing & Compliance Metadata</li>
                                <li className="flex gap-2 items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/30"></span> Device & Usage Logs</li>
                             </ul>
                        </div>

                        <div className="bg-blue-50/50 backdrop-blur-md rounded-[40px] p-10 border border-blue-100 shadow-sm">
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Purpose
                             </h3>
                             <div className="flex flex-wrap gap-2">
                                {["Service", "Payments", "Support", "Legal", "Marketing"].map((tag, i) => (
                                    <span key={i} className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-100">{tag}</span>
                                ))}
                             </div>
                             <p className="mt-6 text-sm text-slate-500 font-bold leading-relaxed">Data is collected solely to enhance platform functionality and meet legal obligations.</p>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 space-y-16 shadow-lg shadow-blue-900/5">
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 italic">05. Data Management</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-slate-500 font-bold">
                                <div className="space-y-4">
                                    <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest">Sharing Protocol</h4>
                                    <p>We share data with payment processors and government authorities when legally required. We <strong className="text-slate-900">never</strong> sell or rent your personal data.</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest">Security Practices</h4>
                                    <p>We implement SSL encryption, secure servers, and access control mechanisms as per IT Act, 2000 standards.</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-blue-50/70 backdrop-blur-xl border border-blue-100 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
                             <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl"></div>
                            <h2 className="text-2xl font-black text-slate-900 mb-8 italic border-b border-blue-100 pb-4">Grievance Redressal</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-bold">
                                <div className="space-y-2">
                                    <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest">Grievance Officer</p>
                                    <p className="text-2xl font-black text-slate-900">Atul Srivastava</p>
                                    <p className="text-slate-500 text-sm font-black">contact@nexveraHub.com</p>
                                </div>
                                <div className="bg-white/60 p-8 rounded-3xl border border-blue-100 shadow-sm">
                                    <h4 className="font-black text-blue-600 text-xs uppercase tracking-widest mb-4">Response Timeline</h4>
                                    <ul className="space-y-2 text-sm text-slate-600 font-bold">
                                        <li className="flex justify-between"><span>Acknowledgement:</span> <span className="text-blue-600 text-xs">24—48h</span></li>
                                        <li className="flex justify-between"><span>Resolution:</span> <span className="text-blue-600 text-xs">15 Days</span></li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="bg-blue-50/70 backdrop-blur-xl border border-blue-200/50 rounded-[40px] p-12 text-center relative overflow-hidden">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Exercise Your Rights</h2>
                        <p className="text-slate-600 mb-10 max-w-md mx-auto italic font-black leading-relaxed">You have the right to access, correct, or request deletion of your data at any time.</p>
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

export default PrivacyPolicy;
