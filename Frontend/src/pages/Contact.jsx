import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle, Clock, Send, Building2, Smartphone, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

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
            // 1. Send Admin Notification
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN_ID,
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            // 2. Send Thank You Mail to User
            // await emailjs.send(
            //     import.meta.env.VITE_EMAILJS_SERVICE_ID,
            //     import.meta.env.VITE_EMAILJS_TEMPLATE_USER_ID,
            //     {
            //         name: formData.name,
            //         email: formData.email,
            //     },
            //     import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            // );

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
        <div className="pt-32 pb-24 bg-transparent overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header Section */}
                <div className="max-w-4xl mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6 border border-blue-100 shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Direct Support
                    </motion.div>
                    <h1 className="text-4xl md:text-4xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                        Let's Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Nexvera</span> Journey
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-2xl">
                        Have questions about our programs, certifications, or career support? Our dedicated team is here to guide you every step of the way.
                    </p>
                </div>

                {/* Top Section: Compact Form & Quick Connect */}
                <div className="grid lg:grid-cols-12 gap-12 items-start mb-12">
                    {/* Left: Shrunken Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-7 relative p-[2px] rounded-[3rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-2xl"
                    >
                        <div className="bg-white p-8 lg:p-12 rounded-[2.9rem] relative overflow-hidden">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">Contact Us</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-7 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300" 
                                        placeholder="Enter your full name" 
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
                                        <input 
                                            required
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-7 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300" 
                                            placeholder="name@example.com" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Contact Number</label>
                                        <input 
                                            required
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-7 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300" 
                                            placeholder="+91 98765 43210" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Your Message</label>
                                    <textarea 
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4" 
                                        className="w-full px-7 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 resize-none" 
                                        placeholder="Tell us how we can help..."
                                    ></textarea>
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </motion.div>


                    {/* Right: Quick Connect Box */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-5 bg-white p-10 lg:p-14 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden group h-full flex flex-col justify-center"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight uppercase">Quick Connect</h3>

                            <div className="space-y-6 lg:space-y-8 flex-grow">
                                {/* Email Us */}
                                <div className="flex items-center gap-5 group/item">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-500 shadow-inner group-hover/item:scale-110 group-hover/item:bg-blue-50 transition-all">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-1">Email Us</h4>
                                        <p className="text-slate-900 font-bold text-lg tracking-tight hover:text-blue-600 transition-colors cursor-pointer">contact@nexverahub.com</p>
                                    </div>
                                </div>

                                {/* Global Contact Lines */}
                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-cyan-500 shadow-inner group-hover/item:scale-110 group-hover/item:bg-cyan-50 transition-all mt-1">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-2">Global Contact Lines</h4>

                                        <div>
                                            <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest leading-none mb-1">India (Main Board)</p>
                                            <p className="text-slate-900 font-bold text-base tracking-tight">+91-9821000921</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest leading-none mb-1">United States (Main Board)</p>
                                            <p className="text-slate-900 font-bold text-base tracking-tight">+1-917-6721794</p>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-400 text-[9px] uppercase tracking-widest leading-none mb-1">United Kingdom (Main Board)</p>
                                            <p className="text-slate-900 font-bold text-base tracking-tight">+44-7520604822</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Our Timings */}
                                <div className="flex items-center gap-5 group/item">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-indigo-500 shadow-inner group-hover/item:scale-110 group-hover/item:bg-indigo-50 transition-all">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-1">Our Timings</h4>
                                        <p className="text-slate-900 font-bold text-lg tracking-tight hover:text-indigo-600 transition-colors cursor-pointer">Mon - Sat: 9 AM - 6 PM</p>
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
                        className="bg-white p-10 lg:p-14 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden group h-full flex flex-col order-2 lg:order-1"
                    >
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-100"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest mb-10 shadow-lg shadow-blue-200">
                                <Building2 className="w-4 h-4" />
                                Our Campus
                            </div>

                            <div className="space-y-10 flex-grow">
                                {/* India */}
                                <div className="flex items-start gap-6 group/item">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 transition-transform">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight uppercase">India</h3>
                                        <p className="text-slate-600 font-semibold leading-relaxed text-sm">
                                            Level - 16th & 17th DND Flyway, Plot No.C-001A, <br />
                                            Sector 16B, Noida, Uttar Pradesh 201301
                                        </p>
                                    </div>
                                </div>

                                {/* USA */}
                                <div className="flex items-start gap-6 group/item">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 transition-transform">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight uppercase">United States</h3>
                                        <p className="text-slate-600 font-semibold leading-relaxed text-sm">
                                            845 3rd Ave 6th floor, New York, NY 10022
                                        </p>
                                    </div>
                                </div>

                                {/* UK */}
                                <div className="flex items-start gap-6 group/item">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-blue-600 shadow-inner group-hover/item:scale-110 transition-transform">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight uppercase">United Kingdom</h3>
                                        <p className="text-slate-600 font-semibold leading-relaxed text-sm">
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
                        className="bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-100 h-[500px] lg:h-auto overflow-hidden relative order-1 lg:order-2"
                    >
                        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-[120%] z-10 flex flex-col items-center pointer-events-none transition-transform hover:scale-105">
                            {/* The Info Card */}
                            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-0.5">India Campus</h4>
                                    <p className="text-slate-600 text-[10px] font-semibold leading-snug">
                                        Max Towers, Noida
                                    </p>
                                </div>
                            </div>

                            {/* The Pin Point */}
                            <div className="relative flex flex-col items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-transparent -mt-1 opacity-70"></div>
                            </div>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14013.064560737191!2d77.31959828715822!3d28.591807300000007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce4f664532729%3A0x868f05c317c4611!2sMax%20Towers!5e0!3m2!1sen!2sin!4v1709716000000!5m2!1sen!2sin"
                            className="w-full h-full rounded-[2.8rem]"
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
