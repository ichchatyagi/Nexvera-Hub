import React from 'react';
import { NavLink } from 'react-router-dom';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import logo from '../assets/logo.PNG';

const Footer = () => {
    return (
        <footer className="bg-white/80 backdrop-blur-md border-t border-slate-100 pt-16 pb-8">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* COLUMN 1 — Nexvera Hub Branding */}
                    <div className="flex flex-col items-center lg:-ml-12">
                        <NavLink to="/" className="inline-block mb-4">
                            <img src={logo} alt="Nexvera Hub" className="h-32 w-auto object-contain" />
                        </NavLink>

                        <div className="flex gap-4">
                            {[
                                { Icon: Facebook, href: "https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr", brandColor: "bg-[#1877F2]", iconColor: "text-white" },
                                { Icon: Instagram, href: "https://www.instagram.com/nexverahub", brandColor: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", iconColor: "text-white" },
                                { Icon: Linkedin, href: "https://www.linkedin.com/company/nexverahub/", brandColor: "bg-[#0A66C2]", iconColor: "text-white" }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 ${social.brandColor} ${social.iconColor}`}
                                >
                                    <social.Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* COLUMN 2 — Platform */}
                    <div>
                        <h4 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li><NavLink to="/about" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">About Nexvera</NavLink></li>
                            <li><NavLink to="/certifications" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Certifications</NavLink></li>
                            <li><NavLink to="/course" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Courses</NavLink></li>
                        </ul>
                    </div>

                    {/* COLUMN 3 — Resources */}
                    <div>
                        <h4 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><NavLink to="/blog" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Blog</NavLink></li>
                            <li><NavLink to="/free-guides" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Free Guides</NavLink></li>
                            <li><NavLink to="/roadmaps" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Learning Roadmaps</NavLink></li>
                        </ul>
                    </div>

                    {/* COLUMN 4 — Support */}
                    <div>
                        <h4 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><NavLink to="/career-support" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Career Support</NavLink></li>
                            <li><NavLink to="/student-stories" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Success Stories</NavLink></li>
                            <li><NavLink to="/faq" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">FAQ</NavLink></li>
                            <li><NavLink to="/contact" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Contact</NavLink></li>
                        </ul>
                    </div>
                </div>

                {/* BOTTOM STRIP */}
                <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 font-bold text-sm">
                        © 2026 Nexvera Hub. All Rights Reserved.
                    </p>
                    <p className="text-slate-400 font-bold text-sm">
                        A Company by <a href="https://nexstarmedia.in/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors">Nexstar Media</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

