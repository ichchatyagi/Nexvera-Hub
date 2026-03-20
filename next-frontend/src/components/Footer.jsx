import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-white/80 backdrop-blur-md border-t border-slate-100 pt-16 pb-8">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* COLUMN 1 — Nexvera Hub Branding */}
                    <div className="flex flex-col items-center lg:-ml-12">
                        <Link href="/" className="inline-block mb-4">
                            <Image src="/assets/logo.PNG" alt="Nexvera Hub" width={200} height={130} className="h-32 w-auto object-contain" />
                        </Link>

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
                            <li><Link href="/about" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">About Nexvera</Link></li>
                            <li><Link href="/certifications" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Certifications</Link></li>
                            <li><Link href="/course" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Courses</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3 — Resources */}
                    <div>
                        <h4 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="/blog" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Blog</Link></li>
                            <li><Link href="/free-guides" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Free Guides</Link></li>
                            <li><Link href="/roadmaps" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Learning Roadmaps</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 4 — Support */}
                    <div>
                        <h4 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="/career-support" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Career Support</Link></li>
                            <li><Link href="/student-stories" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Success Stories</Link></li>
                            <li><Link href="/faq" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">FAQ</Link></li>
                            <li><Link href="/contact" className="text-slate-500 hover:text-blue-600 font-semibold transition-all">Contact</Link></li>
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

