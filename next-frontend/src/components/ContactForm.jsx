"use client";

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import api from '../lib/api';
import PhoneInput from './PhoneInput';

const ContactForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        inquiryFor: '',
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
            await api.post('/contact', formData);
            alert('Details sent successfully! Please check your email for confirmation.');
            setFormData({ name: '', email: '', phone: '', inquiryFor: '', message: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Email Error:', error);
            alert('Failed to send details. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3">
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 sm:px-8 sm:py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm"
                    placeholder="Enter your name..."
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 sm:px-8 sm:py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm"
                    placeholder="name@email.com"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <PhoneInput
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="00000 00000"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry For</label>
                <select
                    required
                    name="inquiryFor"
                    value={formData.inquiryFor}
                    onChange={handleChange}
                    className="w-full px-6 py-4 sm:px-8 sm:py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold appearance-none cursor-pointer text-sm"
                >
                    <option value="" disabled>Select an option...</option>
                    <option value="enroll_course" className="text-slate-900">Enroll in a course</option>
                    <option value="join_instructor" className="text-slate-900">Join as an instructor</option>
                    <option value="request_consultation" className="text-slate-900">Request consultation</option>
                </select>
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-6 py-4 sm:px-8 sm:py-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 resize-none text-sm"
                    placeholder="Enter your message..."
                ></textarea>
            </div>
            <button
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-black py-5 sm:py-6 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 disabled:opacity-70"
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </form>
    );
};

export default ContactForm;
