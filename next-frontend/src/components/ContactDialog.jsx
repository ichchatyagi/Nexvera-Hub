"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ContactForm from './ContactForm';

const ContactDialog = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center">
                    {/* Fixed Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                    />

                    {/* Scrollable Container */}
                    <div className="relative w-full h-full overflow-y-auto flex justify-center p-4 sm:p-6 lg:p-8 pt-12 sm:pt-20 lg:pt-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col mb-12 h-fit"
                        >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all z-10 active:scale-95"
                        >
                            <X size={24} />
                        </button>

                        <div className="overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                            <div className="mb-8 text-center sm:text-left">
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-950 mb-2 uppercase tracking-tighter">
                                    Start Your <span className="text-blue-600">Journey</span>
                                </h2>
                                <p className="text-slate-500 font-medium text-sm sm:text-base">
                                    Tell us a bit about yourself and we'll get back to you within 24 hours.
                                </p>
                            </div>

                            <ContactForm onSuccess={onClose} />
                        </div>
                    </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ContactDialog;
