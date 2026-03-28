"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, BookOpen, Layout, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [isVerifying, setIsVerifying] = useState(!!courseId);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (courseId) {
      const verifyEnrollment = async () => {
        try {
          // Backend webhook may take a second or two to process. 
          // Simple polling for a few retries.
          let retries = 5;
          while (retries > 0) {
            try {
              const res: any = await api.get(`/enrollments/check/${courseId}`);
              if (res?.isEnrolled) {
                setIsConfirmed(true);
                break;
              }
            } catch (e) {
              // Ignore failure, keep polling
            }
            retries--;
            await new Promise(r => setTimeout(r, 3000));
          }
        } finally {
          setIsVerifying(false);
        }
      };

      verifyEnrollment();
    }
  }, [courseId]);

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 flex items-center justify-center px-6 text-slate-900 border-none	">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden text-center"
      >
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-20 flex justify-center ">
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
             className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-xl"
           >
              {isVerifying ? <Loader2 className="animate-spin " size={48} /> : <CheckCircle2 size={48} />}
           </motion.div>
        </div>
        
        <div className="p-12">
          <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter mb-4 leading-none ">
            Payment <span className="text-blue-600">Successful!</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 px-4">
            {isVerifying 
              ? "Verifying your enrollment access... This usually takes just a moment." 
              : isConfirmed 
                ? "Confirmation complete! Your enrollment is active—you can start learning immediately."
                : "Thank you for enrolling! Your seat is secured. Access will be available in your dashboard shortly."
            }
          </p>

          <div className="space-y-4">
            <Link 
              href="/dashboard"
              className="w-full inline-flex items-center justify-center py-5 rounded-[1.8rem] bg-slate-950 text-white font-black uppercase tracking-widest text-xs gap-3 hover:bg-black transition-all active:scale-95 no-underline"
            >
              Go to Dashboard <ChevronRight size={16} />
            </Link>
            
            <Link 
              href="/courses"
              className="w-full inline-flex items-center justify-center py-5 rounded-[1.8rem] bg-blue-50 text-blue-600 font-black uppercase tracking-widest text-xs gap-3 hover:bg-blue-100 transition-all no-underline"
            >
              Browse More Courses
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-8 opacity-40 grayscale">
             <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ">
                <BookOpen size={14} /> Nexvera HUB
             </div>
             <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ">
                <Layout size={14} /> Learning Platform
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Next.js requires Suspense boundary when using useSearchParams() in static builds
const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
