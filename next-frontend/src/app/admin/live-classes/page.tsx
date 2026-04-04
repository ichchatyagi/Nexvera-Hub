"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Search, 
  Filter, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  BookOpen,
  ChevronDown,
  Activity,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

enum LiveClassStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

interface LiveClassData {
  _id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  timezone: string;
  status: LiveClassStatus;
  max_participants: number;
  registered_students: string[];
  attended_students: string[];
  actual_start: string | null;
  actual_end: string | null;
}

const AdminLiveClassesMonitoring = () => {
  const router = useRouter();
  const [liveClasses, setLiveClasses] = useState<LiveClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [courseIdFilter, setCourseIdFilter] = useState<string>('');
  const [teacherIdFilter, setTeacherIdFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    fetchLiveClasses(true);
  }, []);

  const fetchLiveClasses = async (initial = false) => {
    try {
      if (initial) setIsLoading(true);
      else setIsFiltering(true);

      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (courseIdFilter) params.courseId = courseIdFilter;
      if (teacherIdFilter) params.teacherId = teacherIdFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response: any = await api.get('/admin/live-classes', { params });
      setLiveClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to load live class intelligence');
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  const getStatusBadge = (status: LiveClassStatus) => {
    switch (status) {
      case LiveClassStatus.LIVE:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
          </div>
        );
      case LiveClassStatus.SCHEDULED:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full">
            <CheckCircle size={10} />
            <span className="text-[10px] font-black uppercase tracking-widest">Scheduled</span>
          </div>
        );
      case LiveClassStatus.ENDED:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-full">
            <Clock size={10} />
            <span className="text-[10px] font-black uppercase tracking-widest">Completed</span>
          </div>
        );
      case LiveClassStatus.CANCELLED:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full">
            <XCircle size={10} />
            <span className="text-[10px] font-black uppercase tracking-widest">Cancelled</span>
          </div>
        );
    }
  };

  const summaries = [
    { label: 'Total Scheduled', value: liveClasses.filter(c => c.status === LiveClassStatus.SCHEDULED).length, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Currently Live', value: liveClasses.filter(c => c.status === LiveClassStatus.LIVE).length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', pulse: true },
    { label: 'Completed', value: liveClasses.filter(c => c.status === LiveClassStatus.ENDED).length, icon: CheckCircle, color: 'text-slate-500', bg: 'bg-slate-50' },
    { label: 'Cancelled', value: liveClasses.filter(c => c.status === LiveClassStatus.CANCELLED).length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  if (isLoading && liveClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={40} />
        <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-sm">Accessing Session Node</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Retrieving live class telemetry from database cluster...</p>
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
              <Video size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Global Faculty Operations</span>
            </div>
            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Monitoring</span>
            </h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {summaries.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue-100 transition-all"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform relative`}>
                  <stat.icon size={24} />
                  {stat.pulse && (
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Real-time</span>
              </div>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-2">{stat.value}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Session Status</label>
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs appearance-none transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="ended">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">From Date</label>
                    <input 
                        type="date" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">To Date</label>
                    <input 
                        type="date" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Course ID</label>
                    <input 
                        type="text" 
                        placeholder="Catalog ID..." 
                        value={courseIdFilter}
                        onChange={(e) => setCourseIdFilter(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs transition-all placeholder:text-slate-300"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Instructor ID</label>
                    <input 
                        type="text" 
                        placeholder="Faculty UUID..." 
                        value={teacherIdFilter}
                        onChange={(e) => setTeacherIdFilter(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-xs transition-all placeholder:text-slate-300"
                    />
                </div>

                <div className="flex items-end">
                    <button 
                        onClick={() => fetchLiveClasses()}
                        disabled={isFiltering}
                        className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                    >
                        {isFiltering ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />}
                        Sync
                    </button>
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Class Matrix</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Time Window</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Course / Teacher</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {liveClasses.map((lc) => (
                  <tr key={lc._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 ${lc.status === LiveClassStatus.LIVE ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50'}`}>
                           <Video size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight mb-1">{lc.title}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {lc._id.substring(0, 12)}...</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="self-start">
                        {getStatusBadge(lc.status)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-900">
                           <Calendar size={12} className="text-slate-400" />
                           <span className="text-[11px] font-black uppercase tracking-tight">
                              {new Date(lc.scheduled_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                           <Clock size={12} />
                           <span className="text-[10px] font-bold">
                              {new Date(lc.scheduled_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(lc.scheduled_end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                             <BookOpen size={12} className="text-blue-500" />
                             <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">COURSE: {lc.course_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <User size={12} className="text-cyan-500" />
                             <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">FACULTY: {lc.teacher_id}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => router.push(`/admin/live-classes/${lc._id}`)}
                         className="p-3 rounded-2xl bg-slate-50 text-slate-300 hover:bg-white hover:text-blue-600 transition-all border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-blue-500/10"
                       >
                         <ArrowRight size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && liveClasses.length === 0 && (
            <div className="py-32 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <Video size={40} />
               </div>
               <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">No Sessions Found</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">The session node returned zero matching records for your current filter parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLiveClassesMonitoring;
