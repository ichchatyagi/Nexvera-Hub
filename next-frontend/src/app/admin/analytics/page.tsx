"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  IndianRupee, 
  Activity, 
  Video,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AnalyticsData {
  users: {
    total_users: number;
    total_students: number;
    total_teachers: number;
    active_students_30d: number;
  };
  catalog: {
    total_courses: number;
    published_courses: number;
  };
  learning: {
    total_enrollments: number;
    active_enrollments: number;
  };
  revenue: {
    revenue_all_time: number;
    revenue_last_30d: number;
    revenue_mtd: number;
  };
  live_classes: {
    live_classes_scheduled_today: number;
    live_classes_live_now: number;
    live_classes_completed_7d: number;
  };
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response: any = await api.get('/admin/analytics/overview');
        setData(response.data);
      } catch (err: any) {
        console.error('Analytics fetch failed:', err);
        setError('Intelligence node synchronization failed. Check backend connectivity.');
        toast.error('Failed to load platform analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Intelligence Console</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-12 py-24">
        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Command Node Error</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">{error || 'Unknown error occurred while fetching platform data.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-2xl shadow-slate-900/10"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 pb-24">
      {/* Hero Header */}
      <div className="mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 blur-[100px] -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-6">
                 <BarChart3 size={14} className="text-blue-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Intelligence Console v1.0</span>
              </div>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Vitals</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Real-time telemetery from across the Nexvera infrastructure. High-fidelity tracking of revenue, personnel, and learning engagement.
              </p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] min-w-[160px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MTD Yield</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(data.revenue.revenue_mtd)}</p>
               </div>
               <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] min-w-[160px]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Now</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-2xl font-black text-white tracking-tighter">{data.live_classes.live_classes_live_now}</p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { label: 'Total Revenue', value: formatCurrency(data.revenue.revenue_all_time), icon: IndianRupee, color: 'text-orange-500', bg: 'bg-orange-50', trend: '+12.5%', isUp: true },
          { label: 'Market Velocity', value: data.catalog.total_courses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Catalog Size', isUp: true },
          { label: 'Personnel Force', value: formatCompact(data.users.total_users), icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-50', trend: 'Global Reach', isUp: true },
          { label: 'Engagement', value: formatCompact(data.learning.total_enrollments), icon: Activity, color: 'text-green-500', bg: 'bg-green-50', trend: 'Enrollments', isUp: true },
        ].map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:border-blue-100 transition-all hover:shadow-2xl hover:shadow-slate-200/50"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon size={28} />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${kpi.isUp ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} text-[9px] font-black`}>
                {kpi.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-4xl font-black text-slate-950 tracking-tighter mb-2">{kpi.value}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Revenue & Economy Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-1">Economy Hub</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Financial Performance Node</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/20">
                  <TrendingUp size={24} />
               </div>
            </div>

            <div className="space-y-10">
               <div className="flex justify-between items-end border-b border-slate-50 pb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Month-to-Date Revenue</p>
                    <p className="text-4xl font-black text-slate-950 tracking-tighter">{formatCurrency(data.revenue.revenue_mtd)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Target Paced</p>
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-[78%] rounded-full" />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center lg:text-left">Last 30 Days</p>
                    <div className="bg-slate-50 p-6 rounded-3xl">
                       <p className="text-xl font-black text-slate-950 tracking-tight text-center">{formatCurrency(data.revenue.revenue_last_30d)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center lg:text-left">All Time Gross</p>
                    <div className="bg-slate-950 p-6 rounded-3xl">
                       <p className="text-xl font-black text-white tracking-tight text-center">{formatCurrency(data.revenue.revenue_all_time)}</p>
                    </div>
                  </div>
               </div>

               <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-tight mb-1">Razorpay Settle Net</p>
                    <p className="text-[10px] text-blue-600/70 font-medium leading-relaxed">Economic flows are automatically net of processor fees and adjusted for currency volatility.</p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* User Intelligence Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-1">Human Capital</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Personnel Distribution Node</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/20">
                  <Users size={24} />
               </div>
            </div>

            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                    <p className="text-3xl font-black text-slate-950 tracking-tighter mb-1">{data.users.total_students}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Students</p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                    <p className="text-3xl font-black text-slate-950 tracking-tighter mb-1">{data.users.total_teachers}</p>
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Faculty Members</p>
                  </div>
               </div>

               <div className="bg-slate-950 p-10 rounded-[3rem] text-white">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-black uppercase tracking-widest">Active Retention (30d)</p>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase">Vitals Green</div>
                  </div>
                  <div className="flex items-end gap-4 mb-2">
                    <p className="text-5xl font-black tracking-tighter">{data.users.active_students_30d}</p>
                    <p className="text-slate-400 text-sm font-medium mb-2 pb-1">active users</p>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Personnel who have engaged in enrollment, payment, or live class activities within the current lunar cycle.
                  </p>
               </div>
               
               <div className="flex items-center gap-4 px-4">
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                     ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Growth Pattern: Optimized</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Live Operations & Learning */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-950 p-12 rounded-[3.5rem] text-white relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Video size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Live Operations</h3>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">Broadcast Intelligence</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Scheduled Today', value: data.live_classes.live_classes_scheduled_today, icon: Calendar },
                  { label: 'Live Streams Now', value: data.live_classes.live_classes_live_now, icon: Activity, ring: 'ring-2 ring-green-500 ring-offset-4 ring-offset-slate-950' },
                  { label: 'Completed (7d)', value: data.live_classes.live_classes_completed_7d, icon: Layers },
                ].map((stat) => (
                  <div key={stat.label} className={`p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center text-center ${stat.ring || ''}`}>
                    <stat.icon size={20} className="text-slate-500 mb-4" />
                    <p className="text-4xl font-black text-white tracking-tighter mb-2">{stat.value}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 border-l border-white/5 pl-0 lg:pl-16">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <BookOpen size={24} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Engagement Flux</h3>
                  <p className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em]">Learning Telemetry</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white tracking-tighter">{data.learning.total_enrollments}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total System Enrollments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-cyan-400 tracking-tighter">{data.learning.active_enrollments}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Active Course Vectors</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Catalog Density</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{data.catalog.published_courses}/{data.catalog.total_courses} PUBLISHED</p>
                   </div>
                   <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-1">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" 
                        style={{ width: `${(data.catalog.published_courses / (data.catalog.total_courses || 1)) * 100}%` }}
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
