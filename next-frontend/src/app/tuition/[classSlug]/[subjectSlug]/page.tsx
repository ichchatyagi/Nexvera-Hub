"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, BookOpen, Clock, Award, ChevronRight, ChevronDown,
  Loader2, Lock, ArrowRight, User, Star
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function TuitionSubjectDetail() {
  const { classSlug, subjectSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [subjectData, setSubjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (classSlug && subjectSlug) fetchSubjectData();
  }, [classSlug, subjectSlug]);

  const fetchSubjectData = async () => {
    try {
      setIsLoading(true);
      // Resolve class ID securely using strictly the slug endpoint correctly
      const classRes = await api.get(`/tuition/classes/${classSlug}`);
      const cData = classRes.data;
      setClassData(cData);

      // Fetch Subject mapping accurately using natively formatted variables 
      const subRes = await api.get(`/tuition/classes/${cData._id}/subjects/${subjectSlug}`);
      setSubjectData(subRes.data);
      if (subRes.data.syllabus?.length > 0) {
        setActiveSection(subRes.data.syllabus[0].section_id);
      }
    } catch (error) {
      toast.error('Failed to load tuition subject details');
    } finally {
      setIsLoading(false);
    }
  };

  const tuitionReviews = [
    { user: "Arjun Mehta", comment: "We love the tuitions at Nexvera Hub! The instructors are very patient and ensure every concept is clear before moving forward.", rating: 5 },
    { user: "Sanya Gupta", comment: "The syllabus is completed well ahead of time, allowing for thorough revision and practice tests.", rating: 5 },
    { user: "Rohan Das", comment: "Very accurate teaching methods. My grades have improved significantly since I joined these tuition classes.", rating: 4.5 },
    { user: "Ananya Iyer", comment: "The small batch sizes and personalized attention make a huge difference. Highly recommend Nexvera for academic support.", rating: 5 },
    { user: "Kabir Singh", comment: "The study materials provided are excellent and cover all the important topics in depth.", rating: 4 },
    { user: "Ishita Sharma", comment: "Teachers are very approachable and help with doubts even after class hours. A great learning environment.", rating: 5 }
  ];

  const handleEnroll = async (billingMode: 'monthly' | 'bundle') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tuition/${classSlug}/${subjectSlug}`);
      return;
    }

    try {
      toast.loading('Initializing subject checkout...', { id: 'payment' });

      const orderRes = await api.post('/payments/order', {
        courseId: classData._id,
        product_type: 'tuition',
        access_scope: 'subject',
        billing_mode: billingMode,
        subjectId: subjectData.subject_id
      });
      const { keyId, orderId, amount, currency } = orderRes.data;

      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Nexvera Hub',
        description: `Subject: ${subjectData.name} (${billingMode})`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            toast.loading('Verifying payment...', { id: 'payment' });

            const verifyRes = await api.post('/payments/verify', {
              courseId: classData._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.enrolled) {
              toast.success(`${billingMode === 'bundle' ? 'Bundle' : 'Monthly'} access to ${subjectData.name} granted!`, { id: 'payment' });
              fetchSubjectData();
            } else {
              toast.error('Payment verification failed', { id: 'payment' });
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: 'payment' });
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => toast.dismiss('payment') }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (res: any) => toast.error(`Payment failed: ${res.error.description}`, { id: 'payment' }));
      rzp.open();
      toast.dismiss('payment');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start purchase flow', { id: 'payment' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      </div>
    );
  }

  if (!subjectData || !classData) return null;

  return (
    <div className="bg-transparent min-h-screen pb-24">
      <section className="bg-transparent text-slate-900 pt-24 pb-32">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <Link href={`/tuition/${classSlug}`} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-700 transition-colors flex items-center gap-2 mb-8">
            <ChevronRight size={14} className="rotate-180" /> Back to Class
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-blue-600/10 px-4 py-2 rounded-xl text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
              Class {classData.tuition_meta.class_level}
            </span>
          </div>

          <h1 className="text-4xl lg:text-7xl font-black mb-6 uppercase tracking-tighter leading-[0.95] text-slate-950">{subjectData.name}</h1>
          <p className="text-lg text-slate-600 mb-10 max-w-3xl font-medium leading-relaxed">{subjectData.description || 'Comprehensive foundational subject covering syllabus rigorously.'}</p>

        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-12 -mt-16">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Subject CTA Widget */}
          <div className="lg:col-span-4 lg:col-start-9 lg:order-2 order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl p-8 sticky top-32 z-20 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">Subject Access</h3>
              <div className="space-y-4">
                {subjectData.pricing?.monthly_enabled ? (
                  <div className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-200 bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-tight">Monthly Pass</h4>
                        <p className="text-xs text-slate-500 mt-1">Access to {subjectData.name}</p>
                      </div>
                      <span className="text-2xl font-black text-slate-900">₹{subjectData.pricing.monthly_price?.toLocaleString() || 0}</span>
                    </div>
                    <button onClick={() => handleEnroll('monthly')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-colors active:scale-95 shadow-xl">
                      Subscribe Monthly
                    </button>
                  </div>
                ) : null}

                {subjectData.pricing?.bundle_enabled ? (
                  <div className="p-6 rounded-[2rem] border-2 border-blue-600 bg-blue-50/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-blue-900 uppercase tracking-tight">Annual Bundle</h4>
                        <p className="text-xs text-blue-600 mt-1">One-time payment</p>
                      </div>
                      <span className="text-2xl font-black text-blue-600">₹{subjectData.pricing.bundle_price?.toLocaleString() || 0}</span>
                    </div>
                    <button onClick={() => handleEnroll('bundle')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-colors active:scale-95 shadow-xl shadow-blue-600/30">
                      Buy Subject Bundle
                    </button>
                  </div>
                ) : null}

                {!subjectData.pricing?.monthly_enabled && !subjectData.pricing?.bundle_enabled && (
                  <div className="p-6 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Pricing unavailable
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mentorship Lead</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 tracking-tight text-sm">Academy Faculty</p>
                    <p className="text-[10px] text-blue-600 uppercase tracking-widest font-bold">Academic Expert</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Syllabus */}
          <div className="lg:col-span-8 lg:order-1 order-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 pt-8 border-l-4 border-blue-600 pl-6">
              Subject <span className="text-blue-600">Syllabus</span>
            </h2>
            <div className="space-y-4">
              {(!subjectData.syllabus || subjectData.syllabus.length === 0) ? (
                <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100">
                  <p className="text-slate-500 font-medium">Syllabus content has not been published yet.</p>
                </div>
              ) : (
                subjectData.syllabus.map((section: any, index: number) => (
                  <div key={section.section_id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                    <button
                      onClick={() => setActiveSection(activeSection === section.section_id ? null : section.section_id)}
                      className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors text-left outline-none"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">{section.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                            {section.lessons?.length || 0} Modules • {section.lessons?.reduce((acc: any, l: any) => acc + (l.duration_minutes || 0), 0) || 0} Min
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform ${activeSection === section.section_id ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {activeSection === section.section_id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="p-4 space-y-2">
                            {(section.lessons || []).map((lesson: any) => (
                              <div
                                key={lesson.lesson_id}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-blue-50/50 transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-lg bg-slate-50 shadow-sm flex items-center justify-center text-slate-400`}>
                                    <Lock size={12} />
                                  </div>
                                  <span className="text-sm font-bold tracking-tight text-slate-600">
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-3">
                                  {lesson.duration_minutes || 0}m
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee - Full Width Section */}
      <section className="py-24 overflow-hidden bg-transparent">
        <div className="container mx-auto px-6 lg:px-12 mb-12">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-950 uppercase tracking-tighter mb-4 border-l-4 border-blue-600 pl-6">
              Student <span className="text-blue-600">Feedback</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] pl-10">Real experiences from our tuition community</p>
        </div>
        
        <div className="relative w-full">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50/0 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50/0 to-transparent z-10 pointer-events-none"></div>

            <motion.div 
              animate={{ x: [0, -2000] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="flex gap-6 whitespace-nowrap py-4"
            >
              {[...tuitionReviews, ...tuitionReviews, ...tuitionReviews, ...tuitionReviews].map((rev, idx) => {
                const colors = ['border-blue-500', 'border-cyan-500', 'border-indigo-500', 'border-violet-500'];
                const accentColor = colors[idx % colors.length];
                const bgGradient = accentColor.replace('border-', 'from-').replace('-500', '-600') + ' to-' + accentColor.replace('border-', '').replace('-500', '-400');

                return (
                  <div key={idx} className={`w-[500px] bg-white border-t-4 ${accentColor} p-8 rounded-[2rem] flex flex-col gap-4 group hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-blue-500/5 whitespace-normal`}>
                    <div className="flex items-center gap-1 text-orange-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          fill={i < Math.floor(rev.rating) ? "currentColor" : "none"} 
                          size={14} 
                          className={i < Math.floor(rev.rating) ? "" : "text-slate-200"} 
                        />
                      ))}
                      {rev.rating % 1 !== 0 && (
                         <div className="relative overflow-hidden w-[7px]">
                            <Star fill="currentColor" size={14} className="absolute left-0" />
                         </div>
                      )}
                      <span className="text-[10px] font-black text-slate-400 ml-2">{rev.rating}</span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed text-[13px]">
                      "{rev.comment}"
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-[11px] font-black text-white shadow-lg`}>
                          {rev.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{rev.user}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
        </div>
      </section>
    </div>
  );
}
