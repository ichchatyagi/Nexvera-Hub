"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Play, CheckCircle2, Clock, BookOpen, Layout, Users, Award, Star,
  ChevronRight, ChevronDown, Loader2, Lock, ArrowRight, Check
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function TuitionClassDetail() {
  const { classSlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (classSlug) fetchClassData();
  }, [classSlug]);

  const fetchClassData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/tuition/classes/${classSlug}`);
      setClassData(res.data);
    } catch (error) {
      toast.error('Failed to load tuition class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (billingMode: 'monthly' | 'bundle') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tuition/${classSlug}`);
      return;
    }

    try {
      toast.loading('Initializing checkout...', { id: 'payment' });

      const orderRes = await api.post('/payments/order', {
        courseId: classData._id,
        product_type: 'tuition',
        access_scope: 'class',
        billing_mode: billingMode
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
        description: `Tuition: ${classData.title} (${billingMode})`,
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
              toast.success(`${billingMode === 'bundle' ? 'Bundle' : 'Monthly'} access granted!`, { id: 'payment' });
              fetchClassData();
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

  if (!classData) return null;

  const { tuition_meta } = classData;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <section className="bg-slate-950 text-white pt-24 pb-32">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <Link href="/tuition" className="text-blue-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mb-8">
            <ChevronRight size={14} className="rotate-180" /> Back to All Classes
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-blue-600/20 px-4 py-2 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
              Class {tuition_meta.class_level}
            </span>
            <div className="flex items-center gap-1 text-orange-400">
              <Star fill="currentColor" size={14} />
              <span className="text-xs font-black text-white">{classData.stats?.average_rating || '5.0'}</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-7xl font-black mb-6 uppercase tracking-tighter leading-[0.95]">{classData.title}</h1>
          <p className="text-lg text-white/60 mb-10 max-w-3xl font-medium leading-relaxed">{classData.description}</p>

          <div className="flex flex-wrap gap-3">
            {(tuition_meta.boards_supported || []).map((board: string, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-slate-300">
                <CheckCircle2 size={16} className="text-green-500" /> {board}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-12 -mt-16">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* Purchase CTA Widget */}
          <div className="lg:col-span-4 lg:col-start-9 lg:order-2 order-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl p-8 sticky top-32 z-20 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">Class Full Access</h3>
              <div className="space-y-4">
                {tuition_meta.pricing?.monthly_enabled ? (
                  <div className="p-6 rounded-[2rem] border-2 border-slate-100 hover:border-blue-200 bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-tight">Monthly Pass</h4>
                        <p className="text-xs text-slate-500 mt-1">Access all subjects</p>
                      </div>
                      <span className="text-2xl font-black text-slate-900">₹{tuition_meta.pricing.monthly_price?.toLocaleString()}</span>
                    </div>
                    <button onClick={() => handleEnroll('monthly')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-colors active:scale-95 shadow-xl">
                      Subscribe Monthly
                    </button>
                  </div>
                ) : null}

                {tuition_meta.pricing?.bundle_enabled ? (
                  <div className="p-6 rounded-[2rem] border-2 border-blue-600 bg-blue-50/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-blue-900 uppercase tracking-tight">Annual Bundle</h4>
                        <p className="text-xs text-blue-600 mt-1">One-time payment</p>
                      </div>
                      <span className="text-2xl font-black text-blue-600">₹{tuition_meta.pricing.bundle_price?.toLocaleString()}</span>
                    </div>
                    <button onClick={() => handleEnroll('bundle')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-colors active:scale-95 shadow-xl shadow-blue-600/30">
                      Buy Full Bundle
                    </button>
                  </div>
                ) : null}

                {!tuition_meta.pricing?.monthly_enabled && !tuition_meta.pricing?.bundle_enabled && (
                  <div className="p-6 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Pricing unavailable
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Subjects List */}
          <div className="lg:col-span-8 lg:order-1 order-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 pt-8">Subjects Included</h2>
            <div className="space-y-6">
              {(!tuition_meta.subjects || tuition_meta.subjects.length === 0) ? (
                <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100">
                  <p className="text-slate-500 font-medium">No subjects have been published for this class yet.</p>
                </div>
              ) : (
                tuition_meta.subjects.map((sub: any) => (
                  <div key={sub.subject_id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                        <BookOpen size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{sub.name}</h3>
                        <div className="flex bg-slate-50 rounded-lg p-2 items-center gap-4 text-xs font-bold text-slate-400 tracking-widest uppercase mt-4">
                          {sub.pricing?.monthly_enabled && <span className="text-slate-700">₹{sub.pricing.monthly_price}/mo</span>}
                          {sub.pricing?.bundle_enabled && <span>₹{sub.pricing.bundle_price} bundle</span>}
                        </div>
                      </div>
                    </div>
                    <Link href={`/tuition/${classSlug}/${sub.slug}`} className="shrink-0">
                      <div className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-6 py-4 rounded-2xl transition-colors font-bold uppercase tracking-widest text-[10px]">
                        View Subject <ArrowRight size={14} />
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
