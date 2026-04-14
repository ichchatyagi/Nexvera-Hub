"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = 'danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 pb-0 flex justify-between items-start">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  <AlertTriangle size={24} />
               </div>
               <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8">
               <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3">
                  {title}
               </h3>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {message}
               </p>
            </div>

            <div className="p-8 bg-slate-50 flex gap-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
               >
                 {cancelLabel}
               </button>
               <button 
                 onClick={() => {
                   onConfirm();
                   onClose();
                 }}
                 className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${variant === 'danger' ? 'bg-red-600 shadow-red-500/20 hover:bg-red-700' : 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700'}`}
               >
                 {confirmLabel}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
