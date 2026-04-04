"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  CreditCard, 
  ArrowRight, 
  AlertCircle,
  Plus,
  IndianRupee,
  Activity,
  Layers,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminOverview() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        // This endpoint currently returns { message: 'Admin dashboard – coming soon' }
        const response: any = await api.get('/users/admin/dashboard');
        setDashboardData(response.data);
      } catch (err: any) {
        console.error('Dashboard fetch failed:', err);
        setError('Backend admin summary endpoint not available yet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Users', value: 'N/A', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Courses', value: 'N/A', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { label: 'Active Enrollments', value: 'N/A', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Monthly Revenue', value: 'N/A', icon: IndianRupee, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="px-12 pb-24">
      {/* Hero Section */}
      <div className="mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] -ml-10 -mb-10" />
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
              Welcome to the Nexvera Hub authority node. Monitor platform vitals, manage global catalog assets, and oversee faculty operations from a unified command center.
            </p>
            
            {dashboardData?.message && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{dashboardData.message}</span>
              </div>
            )}
            
            {error && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 backdrop-blur-md">
                 <AlertCircle size={14} className="text-orange-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{error}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue-100 transition-all"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Real-time</span>
            </div>
            <p className="text-4xl font-black text-slate-950 tracking-tighter mb-2">{stat.value}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 px-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Control</h3>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">View All Modules</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/admin/courses" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
                    <BookOpen size={24} />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3 transition-colors group-hover:text-blue-600">Manage Catalog</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Create, update, and publish Nexvera courses for global learners.</p>
              </div>
            </Link>

            <Link href="/admin/instructors/earnings" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <TrendingUp size={24} />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3 transition-colors group-hover:text-blue-600">Faculty Yields</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Review instructor performance, earnings, and pending settlements.</p>
              </div>
            </Link>

            <Link href="/admin/users" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/10">
                    <Users size={24} />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3 transition-colors group-hover:text-blue-600">User Intelligence</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Manage personnel roles, account statuses, and platform authority levels.</p>
              </div>
            </Link>

            <Link href="/admin/analytics" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/5">
                    <BarChart3 size={24} />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-3 transition-colors group-hover:text-blue-600">Intelligence Node</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Access platform-wide vitals, revenue trajectories, and growth analytics.</p>
              </div>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8 px-4">System Vitals</h3>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="space-y-8">
                {[
                  { label: 'API Gateway', status: 'Operational', color: 'text-green-500' },
                  { label: 'Payment Node', status: 'Operational', color: 'text-green-500' },
                  { label: 'Media CDN', status: 'Operational', color: 'text-green-500' },
                  { label: 'Database Cluster', status: 'Optimizing', color: 'text-blue-500' },
                ].map((vital) => (
                  <div key={vital.label} className="flex items-center justify-between">
                     <div>
                        <p className="text-[11px] font-black text-slate-950 uppercase tracking-tight mb-1">{vital.label}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authority Status</p>
                     </div>
                     <div className={`text-[10px] font-black uppercase tracking-widest ${vital.color}`}>
                        {vital.status}
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-12 pt-10 border-t border-slate-50">
                <div className="bg-blue-50 p-6 rounded-2xl">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Nexvera Bulletin</p>
                   <p className="text-[11px] text-blue-900/60 font-medium leading-relaxed">
                     Global catalog synchronization complete. 4 course assets pending final audit.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
