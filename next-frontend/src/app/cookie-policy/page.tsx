import React from 'react';

const CookiePolicy = () => {
    return (
        <div className="min-h-screen py-24 px-6 lg:px-12 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-16 text-center">
                    <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Browsing Framework</p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">
                        Cookie <span className="text-blue-500">Policy</span>
                    </h1>
                    <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/50 text-slate-600 font-bold shadow-sm text-sm">
                        <span>Effective: 14.04.2026</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>nexveraHub.com</span>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 shadow-2xl shadow-blue-900/5">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 italic">01. Introduction</h2>
                        <div className="text-lg text-slate-600 leading-relaxed font-bold">
                            <p>
                                This Cookie Policy explains how <span className="text-blue-500 underline decoration-blue-200 underline-offset-8">NexveraHub.com</span> uses cookies and similar technologies to improve your experience on our platform.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50/70 backdrop-blur-md p-10 lg:p-14 rounded-[40px] flex flex-col md:flex-row gap-10 items-center border border-blue-100 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px]"></div>
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shrink-0 shadow-xl shadow-blue-600/5 rotate-12 group-hover:rotate-0 transition-transform duration-500 border border-blue-100">
                            <span className="text-4xl font-bold">🍪</span>
                        </div>
                        <div className="relative z-10 font-bold">
                            <h3 className="text-2xl font-black text-slate-900 mb-4">What Are Cookies?</h3>
                            <p className="text-slate-500 leading-relaxed">Cookies are small text files stored on your device that help us remember your preferences and provide a more personalized, seamless browsing experience.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                        {[
                            { title: "Essential", desc: "Required for core website functionality, security, and authentication." },
                            { title: "Performance", desc: "Helps us optimize site speed and understand user navigation patterns." },
                            { title: "Functional", desc: "Stores your specific choices like language or region preferences." },
                            { title: "Marketing", desc: "Used only with consent to provide relevant educational updates." }
                        ].map((item, idx) => (
                            <div key={idx} className="p-8 rounded-[32px] bg-white/40 backdrop-blur-md border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></span>
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50/70 backdrop-blur-xl border border-blue-200/50 rounded-[40px] p-12 text-center shadow-sm relative overflow-hidden">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Take Control</h2>
                        <p className="text-slate-600 mb-10 max-w-lg mx-auto italic font-bold leading-relaxed">You can manage your cookie preferences through your browser settings. Note that disabling essential cookies may impact certain site features.</p>
                        <div className="inline-flex flex-col gap-1">
                            <p className="text-blue-600 font-black text-lg tracking-tight">contact@nexveraHub.com</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">nexveraHub.com | 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
