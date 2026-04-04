"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Wallet, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Activity,
  ArrowLeft,
  Loader2,
  Shield,
  ArrowUpRight,
  TrendingDown,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AdminEarningsReport = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [earnings, setEarnings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [instructorId, setInstructorId] = useState('');

  useEffect(() => {
    if (!isLoadingAuth && user?.role === 'admin') {
      // Logic for admin access already handled by layout, 
      // but we keep this effect for any page-specific initializations if needed
    }
  }, [user, isLoadingAuth]);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get('/instructor/earnings');
      setEarnings(response.data);
      toast.success('Calculated latest yields');
    } catch (error) {
      toast.error('Failed to resolve instructor metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={32} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Processing Yield Data</p>
      </div>
    );
  }

  return (
    <div className="px-12 pb-24">
      <div className="container mx-auto">
        {/* Header - toned down */}
        <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Shield size={14} className="text-blue-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Personnel Audit Module</span>
              </div>
              <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter leading-none">
                Instructor <span className="text-blue-600">Earnings</span> Report
              </h1>
              <p className="text-slate-400 text-sm font-medium mt-4">Authority view for inspecting faculty yields and settlements.</p>
           </div>
           
           <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start">
              <button className="px-6 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Real-time Estimates</button>
              <button className="px-6 py-2 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Settlement History</button>
           </div>
        </div>

        {/* Search / Instructor Selection */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-16 flex flex-col md:flex-row gap-6 items-end">
           <div className="flex-1 w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Personnel Identifier (Instructor ID)</label>
              <div className="relative">
                 <input 
                   value={instructorId}
                   onChange={(e) => setInstructorId(e.target.value)}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                   placeholder="Enter UUID for faculty analysis..."
                 />
                 <Shield size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
           </div>
           <button 
             onClick={fetchEarnings}
             className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
           >
              Run Audit Report
           </button>
        </div>

        {earnings ? (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-12"
           >
              {/* Summary Cards */}
              <div className="grid lg:grid-cols-4 gap-8">
                 <div className="bg-slate-950 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl" />
                    <Wallet className="text-blue-500 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Aggregate Pending</p>
                    <h3 className="text-3xl font-black tracking-tighter">₹{earnings.totalPending?.toLocaleString()}</h3>
                 </div>
                 
                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <Users className="text-cyan-500 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Active Cohort Support</p>
                    <h3 className="text-3xl font-black tracking-tighter text-slate-950">
                       {earnings.breakdown?.reduce((acc: number, item: any) => acc + item.students, 0)} <span className="text-sm text-slate-400">Total Learners</span>
                    </h3>
                 </div>

                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <TrendingUp className="text-green-500 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Max Yield Asset</p>
                    <h3 className="text-xl font-black tracking-tight text-slate-950 truncate">
                       {earnings.breakdown?.[0]?.courseTitle || 'N/A'}
                    </h3>
                 </div>

                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 mb-3 block">
                       <FileText size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 underline cursor-pointer">Export Ledger (CSV)</span>
                 </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0">Full Asset Breakdown</h4>
                    <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                       <AlertCircle size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Unsettled Balances</span>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-slate-50/50">
                             <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Asset</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Cohort Size</th>
                             <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Commission Basis</th>
                             <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Accrued Yield</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {earnings.breakdown?.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-10 py-8">
                                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.courseTitle}</p>
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-1">ID: {item.courseId}</p>
                               </td>
                               <td className="px-10 py-8">
                                  <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-[10px] font-black">#</div>
                                     <span className="text-sm font-black text-slate-700 tracking-tighter">{item.students}</span>
                                  </div>
                               </td>
                               <td className="px-10 py-8">
                                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.basis}</span>
                               </td>
                               <td className="px-10 py-8 text-right">
                                  <span className="text-lg font-black text-slate-900 tracking-tighter">₹{item.amount.toLocaleString()}</span>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 
                 <div className="p-10 bg-slate-50/50 border-t border-slate-50">
                    <div className="bg-blue-600/5 p-8 rounded-[2rem] border border-blue-600/10 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                             <Download size={20} />
                          </div>
                          <div>
                             <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Generate Formal Statement</h5>
                             <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Ready for accounting reconciliation</p>
                          </div>
                       </div>
                       <button className="px-10 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Download Report</button>
                    </div>
                 </div>
              </div>
           </motion.div>
        ) : (
           <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-200">
                 <Activity size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Auditor Ready</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Select a personnel member to calculate their current performance and yield projections.</p>
           </div>
        )}

        <div className="mt-16 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Authority Disclaimer</p>
           <p className="text-xs text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
             Earnings calculations are based on real-time transaction data and commission models. Final settlement amounts may vary due to chargebacks, taxes, and platform operational costs. Actual payouts must be triggered via the accounting module.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AdminEarningsReport;
