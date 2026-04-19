"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Users, 
  Activity, 
  Calendar, 
  Video, 
  User, 
  BookOpen, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function LiveClassAdminDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [liveClass, setLiveClass] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const response: any = await api.get(`/admin/live-classes/${id}`);
        if (response.success) {
          setLiveClass(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch details');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'System node unreachable');
        toast.error('Telemetry acquisition failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'live':
        return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'SESSION ACTIVE', pulse: true };
      case 'ended':
        return { color: 'text-slate-400', bg: 'bg-slate-100', label: 'CONCLUDED', pulse: false };
      case 'cancelled':
        return { color: 'text-orange-500', bg: 'bg-orange-50', label: 'TERMINATED', pulse: false };
      default:
        return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'SCHEDULED', pulse: false };
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-blue-600 mb-6"
        >
          <Loader2 size={48} />
        </motion.div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Acquiring Telemetry...</p>
      </div>
    );
  }

  if (error || !liveClass) {
    return (
      <div className="px-12 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl max-w-lg text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-orange-500">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-4">Error Accessing <span className="text-orange-500">Node</span></h2>
          <p className="text-slate-500 font-medium mb-10 text-sm leading-relaxed">{error || 'Session identity could not be verified'}</p>
          <button 
            onClick={() => router.back()}
            className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mx-auto"
          >
            <ChevronLeft size={14} /> Back to Command Center
          </button>
        </div>
      </div>
    );
  }

  const registeredCount = liveClass.registered_students?.length || 0;
  const attendedCount = liveClass.attended_students?.length || 0;
  const attendanceRate = registeredCount > 0 ? (attendedCount / registeredCount) * 100 : 0;
  const statusCfg = getStatusConfig(liveClass.status);

  return (
    <div className="px-12 pb-24">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-3 text-slate-400 hover:text-slate-950 transition-colors"
        >
          <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <ChevronLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Global Live Classes</span>
        </button>

        <div className="flex items-center gap-4">
           <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full ${statusCfg.bg} border border-slate-100`}>
              {statusCfg.pulse && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
               <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                  <Video size={28} />
               </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Live Session Entity</p>
              <h1 className="text-4xl font-black text-slate-950 tracking-tighter leading-tight mb-6 uppercase">
                {liveClass.title}
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {liveClass.description || 'No descriptive metadata captured for this session.'}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <User size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Teacher Node: {liveClass.teacher_id}</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <BookOpen size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Catalog ID: {liveClass.course_id}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Grid */}
          <div className="grid md:grid-cols-2 gap-8">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
             >
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Calendar size={18} />
                   </div>
                   <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">Scheduled Payload</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</p>
                      <p className="text-sm font-black text-slate-950">{formatDate(liveClass.scheduled_start)}</p>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</p>
                      <p className="text-sm font-black text-slate-950">{formatDate(liveClass.scheduled_end)}</p>
                   </div>
                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Zone</p>
                      <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider">{liveClass.timezone || 'UTC'}</p>
                   </div>
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
             >
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                      <Clock size={18} />
                   </div>
                   <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">Actual Telemetry</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Start</p>
                      <p className="text-sm font-black text-slate-950">{formatDate(liveClass.actual_start)}</p>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal End</p>
                      <p className="text-sm font-black text-slate-950">{formatDate(liveClass.actual_end)}</p>
                   </div>
                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Drift</p>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">0ms Nominal</p>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* Infrastructure Work (Recording) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-slate-950 p-12 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px]" />
             
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Activity size={16} className="text-blue-400" />
                     </div>
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Media Persistence</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Recording Audit</h3>
                  <p className="text-slate-400 text-sm font-medium">Platform-level recording state and artifact identification.</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">State</p>
                      <p className="text-sm font-bold uppercase tracking-tight text-white">{liveClass.recording?.status || 'N/A'}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Entity ID</p>
                      <p className="text-sm font-bold uppercase tracking-tight text-blue-400">{liveClass.recording?.video_id?.slice(-8) || 'NONE'}</p>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Sidebar Metrics */}
        <div className="space-y-8">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    <Users size={24} />
                 </div>
                 <div className="text-right">
                    <p className="text-[32px] font-black text-slate-950 tracking-tighter leading-none">{attendanceRate.toFixed(1)}%</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Convergence</p>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-950 leading-none mb-1">{registeredCount}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-950 leading-none mb-1">{attendedCount}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attended</p>
                    </div>
                 </div>

                 <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${attendanceRate}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                    />
                 </div>
              </div>
           </motion.div>

           <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 border-dashed">
              <div className="flex items-center gap-3 mb-6">
                 <AlertCircle size={14} className="text-slate-400" />
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Protocol</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                As an authority node, you can verify session integrity but cannot directly manipulate active stream parameters. Contact Technical Support for stream resets.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
