import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen py-24 px-6 lg:px-12 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Legal Framework</p>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">
                        Terms & <span className="text-blue-500">Conditions</span>
                    </h1>
                    <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/50 text-slate-600 font-bold shadow-sm text-sm">
                        <span>Effective: 15.04.2026</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>nexveraHub.com</span>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Intro Section */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 shadow-2xl shadow-blue-900/5">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 italic">01. Introduction</h2>
                        <div className="text-lg text-slate-600 leading-relaxed space-y-6 font-bold">
                            <p>
                                Welcome to <strong className="text-slate-900 font-black">NexveraHub.com</strong> (“Platform”, “we”, “our”, “us”), a modern learning platform designed to empower students with practical skills, real-world knowledge, and career-focused education.
                            </p>
                            <p>
                                By accessing or using NexveraHub.com, you agree to comply with and be legally bound by these Terms & Conditions.
                            </p>
                        </div>
                    </div>

                    {/* Content Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50/50 backdrop-blur-md rounded-[40px] p-10 border border-blue-100 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-400/10 transition-all"></div>
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Platform Nature
                             </h3>
                             <p className="text-slate-500 text-sm leading-relaxed mb-8 font-bold">NexveraHub provides online courses, skill development, and career-oriented learning. We act as a digital learning platform and do not guarantee specific academic, career, or financial outcomes.</p>
                             <div className="flex flex-wrap gap-2">
                                {["Courses", "Training", "Mentorship"].map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-500">{tag}</span>
                                ))}
                             </div>
                        </div>

                        <div className="bg-blue-50/50 backdrop-blur-md rounded-[40px] p-10 border border-blue-100 shadow-sm">
                             <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                User Accounts
                             </h3>
                             <ul className="space-y-4 text-slate-600 text-sm font-bold">
                                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span> Accurate Registration Required</li>
                                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span> Credential Confidentiality</li>
                                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400"></span> 18+ or Parental Supervision</li>
                             </ul>
                             <p className="mt-8 text-[10px] font-black text-blue-400 uppercase tracking-widest">Compliance mandatory</p>
                        </div>
                    </div>

                    {/* Detailed Layout */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 lg:p-14 space-y-20 shadow-lg shadow-blue-900/5">
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 italic">04. Access & Rights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-slate-500 font-bold">
                                <div className="space-y-4">
                                    <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest">Course Eligibility</h4>
                                    <p>Upon enrollment, users are granted a limited, non-exclusive, non-transferable license to access course content for personal, non-commercial use.</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-black text-blue-500 text-xs uppercase tracking-widest">Intellectual Property</h4>
                                    <p>Videos, materials, and logos are proprietary. Copying, reselling, or unauthorized recording is strictly prohibited.</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-blue-50/70 backdrop-blur-xl border border-blue-100 rounded-[32px] p-10 shadow-sm transition-all">
                            <h2 className="text-3xl font-black text-slate-900 mb-6 italic">05. Payments & Refunds</h2>
                            <p className="text-slate-600 mb-10 max-w-2xl leading-relaxed font-bold">Fees must be paid in full prior to access. Refund requests must be made within 7–15 working days, provided substantial content has not been accessed.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {["Secure Pay", "GST Ready", "15D Refund", "Transparency"].map((item, i) => (
                                    <div key={i} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-blue-100 text-center font-black text-[10px] uppercase tracking-widest text-blue-600">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 italic">08. User Conduct</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm leading-relaxed text-slate-500 font-bold">
                                {[
                                    { t: "No Piracy", d: "Unauthorized sharing of credentials or content." },
                                    { t: "No Abuse", d: "Posting harmful or illegal content on platform." },
                                    { t: "Integrity", d: "No impersonation or disruption of services." }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2 p-6 rounded-3xl border border-slate-100 bg-white/40 shadow-sm">
                                        <h4 className="font-black text-slate-900 text-sm tracking-tight">{item.t}</h4>
                                        <p className="text-xs">{item.d}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Contact/Footer Section */}
                    <div className="bg-blue-50/70 backdrop-blur-xl border border-blue-200/50 rounded-[40px] p-12 text-center relative overflow-hidden">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Need Clarification?</h2>
                        <p className="text-slate-600 mb-10 max-w-md mx-auto italic font-bold leading-relaxed">For any queries regarding our Terms & Conditions, please reach out to our legal department.</p>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-blue-600">contact@nexveraHub.com</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">nexveraHub.com | 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
