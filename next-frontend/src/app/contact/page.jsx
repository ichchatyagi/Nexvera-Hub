"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle, Clock, Send, Building2, Smartphone, Loader2, ChevronRight } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send message');

            await response.json();

            alert('Details sent successfully! Please check your email for confirmation.');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error('Email Error:', error);
            alert('Failed to send details. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-32 pb-24 bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-900">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header Section */}
                <div className="max-w-4xl mb-20 text-center lg:text-left mx-auto lg:mx-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-blue-100 shadow-sm"
                    >
                        <MessageCircle size={14} strokeWidth={3} />
                        Direct Support
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl lg:text-8xl font-black text-slate-950 leading-[0.9] mb-8 tracking-tighter uppercase mb-10">
                        Let's Start Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Nexvera</span> Journey
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed font-bold max-w-2xl uppercase tracking-tight">
                        Have questions about our programs, certifications, or career support? Our dedicated team is here to guide you every step of the way.
                    </p>
                </div>

                {/* Top Section: Compact Form & Quick Connect */}
                <div className="grid lg:grid-cols-12 gap-12 items-stretch mb-12">
                    {/* Left: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 relative p-[2px] rounded-[3.5rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl"
                    >
                        <div className="bg-white p-8 lg:p-16 rounded-[3.4rem] relative overflow-hidden h-full">
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 mb-10 uppercase tracking-tighter">Transmission <span className="text-blue-600">Portal</span></h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm" 
                                        placeholder="Identification Entry..." 
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input 
                                            required
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm" 
                                            placeholder="name@nexus.com" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                        <input 
                                            required
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm" 
                                            placeholder="+91 00000 00000" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Query Payload</label>
                                    <textarea 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4" 
                                        className="w-full px-8 py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 resize-none text-sm" 
                                        placeholder="Initiate message broadcast..."
                                    ></textarea>
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    className="w-full bg-slate-950 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-950/10 hover:bg-black hover:-translate-y-1 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Transmitting...' : 'Initialize Transmission'}
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </motion.div>


                    {/* Right: Quick Connect Box */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5 bg-white p-10 lg:p-16 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden group h-full flex flex-col justify-center"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-3xl font-black text-slate-950 mb-10 tracking-tighter uppercase">Quick <span className="text-blue-600">Connect</span></h3>

                            <div className="space-y-10 flex-grow">
                                {/* Email Us */}
                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 group-hover/item:bg-blue-50 transition-all">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-[0.3em] mb-1">Direct Email</h4>
                                        <p className="text-slate-950 font-black text-lg tracking-tight hover:text-blue-600 transition-colors cursor-pointer leading-none">contact@nexverahub.com</p>
                                    </div>
                                </div>

                                {/* Global Contact Lines */}
                                <div className="flex items-start gap-6 group/item">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center text-cyan-600 shadow-inner group-hover/item:scale-110 group-hover/item:bg-cyan-50 transition-all mt-1">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-[0.3em] mb-2">Global Comms</h4>
                                        <div>
                                            <p className="font-black text-slate-400 text-[8px] uppercase tracking-widest leading-none mb-1">India / Local Hub</p>
                                            <p className="text-slate-950 font-black text-base tracking-tight leading-none">+91-9821000921</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-400 text-[8px] uppercase tracking-widest leading-none mb-1">US / North America</p>
                                            <p className="text-slate-950 font-black text-base tracking-tight leading-none">+1-917-6721794</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-400 text-[8px] uppercase tracking-widest leading-none mb-1">UK / European Hub</p>
                                            <p className="text-slate-950 font-black text-base tracking-tight leading-none">+44-7520604822</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Our Timings */}
                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center text-indigo-600 shadow-inner group-hover/item:scale-110 group-hover/item:bg-indigo-50 transition-all">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-[0.3em] mb-1">Active Hours</h4>
                                        <p className="text-slate-950 font-black text-lg tracking-tight leading-none">Mon - Sat: 9 AM - 6 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Section: Physical Location & Map */}
                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                    {/* Left: Official Address Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-10 lg:p-16 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden group h-full flex flex-col order-2 lg:order-1"
                    >
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-100"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] mb-12 shadow-xl shadow-blue-500/20 max-w-max">
                                <Building2 size={16} />
                                Global Campuses
                            </div>

                            <div className="space-y-12 flex-grow">
                                {/* India */}
                                <div className="flex items-start gap-7 group/item">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 transition-transform">
                                        <MapPin size={30} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-950 mb-2 tracking-tighter uppercase">Main Headquarters</h3>
                                        <p className="text-slate-500 font-bold leading-relaxed text-sm uppercase tracking-tight">
                                            Level - 16th & 17th DND Flyway, Plot No.C-001A, <br />
                                            Sector 16B, Noida, Uttar Pradesh 201301
                                        </p>
                                    </div>
                                </div>

                                {/* USA */}
                                <div className="flex items-start gap-7 group/item">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 transition-transform">
                                        <MapPin size={30} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-950 mb-2 tracking-tighter uppercase">New York Node</h3>
                                        <p className="text-slate-500 font-bold leading-relaxed text-sm uppercase tracking-tight">
                                            845 3rd Ave 6th floor, New York, NY 10022
                                        </p>
                                    </div>
                                </div>

                                {/* UK */}
                                <div className="flex items-start gap-7 group/item">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 transition-transform">
                                        <MapPin size={30} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-950 mb-2 tracking-tighter uppercase">London Satellite</h3>
                                        <p className="text-slate-500 font-bold leading-relaxed text-sm uppercase tracking-tight">
                                            1st Floor, 239 Kensington High St, London W8 6SN
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Map with Pin Overlay */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-4 rounded-[4rem] shadow-2xl border border-slate-100 h-[500px] lg:h-auto overflow-hidden relative order-1 lg:order-2"
                    >
                        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-[120%] z-10 flex flex-col items-center pointer-events-none transition-transform hover:scale-105">
                            {/* The Info Card */}
                            <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-950 text-[10px] uppercase tracking-[0.2em] mb-0.5 leading-none">Main Hub</h4>
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-tight leading-none mt-1">
                                        Max Towers, Noida
                                    </p>
                                </div>
                            </div>

                            {/* The Pin Point */}
                            <div className="relative flex flex-col items-center">
                                <div className="w-10 h-10 bg-blue-600 rounded-full border-[6px] border-white shadow-xl flex items-center justify-center animate-bounce">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 to-transparent -mt-1 opacity-70"></div>
                            </div>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14013.064560737191!2d77.31959828715822!3d28.591807300000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce4f664532729%3A0x868f05c317c4611!2sMax%20Towers!5e0!3m2!1sen!2sin!4v1709716000000!5m2!1sen!2sin"
                            className="w-full h-full rounded-[3.5rem]"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Office Location"
                        ></iframe>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
