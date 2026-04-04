"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  IndianRupee,
  Calendar,
  ChevronDown,
  User,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

interface Transaction {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  metadata?: any;
  createdAt: string;
}

const AdminPaymentsDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [courseIdFilter, setCourseIdFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchTransactions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      else setIsFiltering(true);

      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (userIdFilter) params.userId = userIdFilter;
      if (courseIdFilter) params.courseId = courseIdFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response: any = await api.get('/admin/payments/transactions', { params });
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to synchronize financial records');
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  }, [statusFilter, userIdFilter, courseIdFilter, fromDate, toDate]);

  useEffect(() => {
    fetchTransactions(true);
  }, []);

  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return { 
          label: 'Completed', 
          icon: <CheckCircle size={12} />, 
          color: 'text-green-600 bg-green-50 border-green-100',
          dot: 'bg-green-500'
        };
      case TransactionStatus.FAILED:
        return { 
          label: 'Failed', 
          icon: <XCircle size={12} />, 
          color: 'text-red-600 bg-red-50 border-red-100',
          dot: 'bg-red-500'
        };
      case TransactionStatus.REFUNDED:
        return { 
          label: 'Refunded', 
          icon: <RefreshCcw size={12} />, 
          color: 'text-orange-600 bg-orange-50 border-orange-100',
          dot: 'bg-orange-500'
        };
      default:
        return { 
          label: 'Pending', 
          icon: <Clock size={12} />, 
          color: 'text-slate-500 bg-slate-50 border-slate-100',
          dot: 'bg-slate-400'
        };
    }
  };

  // Metrics
  const metrics = {
    totalCompleted: transactions.filter(t => t.status === TransactionStatus.COMPLETED).length,
    totalVolume: transactions
      .filter(t => t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    totalFailed: transactions.filter(t => t.status === TransactionStatus.FAILED).length,
    totalRefunded: transactions.filter(t => t.status === TransactionStatus.REFUNDED).length,
  };

  const stats = [
    { label: 'Settled Transactions', value: metrics.totalCompleted, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Net Volume', value: `₹${metrics.totalVolume.toLocaleString()}`, icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Transaction Failures', value: metrics.totalFailed, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Total Reversals', value: metrics.totalRefunded, icon: RefreshCcw, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Financial Ledger</p>
      </div>
    );
  }

  return (
    <div className="px-12 pb-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Financial Intelligence</span>
            </div>
            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
              Payments & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Transactions</span>
            </h1>
          </div>
        </div>

        {/* Metrics Cards */}
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
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Node</span>
              </div>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-2">{stat.value}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Node Status</label>
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs appearance-none transition-all"
                >
                  <option value="all">Global (All)</option>
                  <option value="completed">Settled (Completed)</option>
                  <option value="pending">In-Transit (Pending)</option>
                  <option value="failed">Terminated (Failed)</option>
                  <option value="refunded">Reversed (Refunded)</option>
                </select>
                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Temporal From</label>
              <div className="relative">
                 <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs transition-all"
                 />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Temporal To</label>
              <div className="relative">
                 <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs transition-all"
                 />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Personnel ID</label>
              <div className="flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all focus-within:border-blue-200">
                <User className="text-slate-400 mr-4" size={16} />
                <input 
                  type="text" 
                  placeholder="UUID..." 
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  className="w-full py-4 bg-transparent outline-none text-xs font-bold placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Catalog Asset ID</label>
              <div className="flex gap-4">
                <div className="flex-1 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all focus-within:border-blue-200">
                  <BookOpen className="text-slate-400 mr-4" size={16} />
                  <input 
                    type="text" 
                    placeholder="Mongo ID..." 
                    value={courseIdFilter}
                    onChange={(e) => setCourseIdFilter(e.target.value)}
                    className="w-full py-4 bg-transparent outline-none text-xs font-bold placeholder:text-slate-300"
                  />
                </div>
                <button 
                  onClick={() => fetchTransactions()}
                  disabled={isFiltering}
                  className="px-6 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center gap-2"
                >
                  {isFiltering ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
          <AnimatePresence>
            {isFiltering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center font-black uppercase tracking-widest text-[10px] text-blue-600"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin" size={24} />
                  Recalibrating Records
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Catalog Reference</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => {
                  const statusInfo = getStatusConfig(tx.status);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-slate-400">
                          <Calendar size={14} className="text-slate-300" />
                          <div>
                            <p className="text-[11px] font-black text-slate-900 tracking-tight">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                                year: 'numeric', month: 'short', day: 'numeric' 
                              })}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(tx.createdAt).toLocaleTimeString(undefined, { 
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-xs font-black text-slate-900 tracking-tight font-mono truncate max-w-[120px]" title={tx.id}>
                            #{tx.id.substring(0, 8)}
                          </p>
                          {tx.razorpayPaymentId && (
                            <div className="flex items-center gap-1 mt-1">
                              <ShieldCheck size={10} className="text-blue-500" />
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tx.razorpayPaymentId}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-slate-950 uppercase">₹{Number(tx.amount).toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{tx.currency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.color}`}>
                          <div className={`w-1 h-1 rounded-full ${statusInfo.dot}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <BookOpen size={12} className="text-slate-300" />
                             <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter truncate max-w-[150px]" title={tx.courseId}>
                                {tx.courseId}
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <User size={12} className="text-slate-300" />
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]" title={tx.userId}>
                                {tx.userId}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Razorpay</span>
                          {tx.razorpayOrderId && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter font-mono">{tx.razorpayOrderId}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {!isLoading && transactions.length === 0 && (
            <div className="py-32 text-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200"
               >
                  <CreditCard size={40} />
               </motion.div>
               <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">No Transactions Detected</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">The financial ledger returned zero records for the current protocol parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsDashboard;
