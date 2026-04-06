"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  Video, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Calendar,
  Loader2,
  Clock,
  Play,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingForm, setSchedulingForm] = useState({
    course_id: '',
    title: '',
    description: '',
    scheduled_start: '',
    scheduled_end: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    max_participants: 100,
    features: { chat_enabled: true, qa_enabled: true }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch teacher's assigned courses from the consolidated endpoint
      const coursesRes = await api.get('/teacher/courses'); 
      setCourses(coursesRes.data || []);

      // Fetch teacher's live classes
      const liveRes = await api.get('/live-classes/mine');
      setLiveClasses(liveRes.data?.filter((l: any) => l.status !== 'ended' && l.status !== 'cancelled') || []);

      // Fetch instructor earnings (calculated from assignments)
      const earningsRes = await api.get('/instructor/earnings');
      setEarnings(earningsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard metrics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading('Synchronizing faculty schedule...', { id: 'schedule' });
      await api.post('/live-classes', schedulingForm);
      toast.success('Live session broadcast scheduled', { id: 'schedule' });
      setIsScheduleModalOpen(false);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Schedule conflict detected', { id: 'schedule' });
    }
  };

  const stats = [
    { label: 'Active Students', value: (earnings?.breakdown?.reduce((acc: number, curr: any) => acc + curr.students, 0) || 0).toLocaleString(), icon: <Users size={20} />, color: 'bg-blue-600' },
    { label: 'Assigned Courses', value: courses.length.toString(), icon: <BookOpen size={20} />, color: 'bg-cyan-500' },
    { label: 'Live Sessions', value: liveClasses.length.toString(), icon: <Video size={20} />, color: 'bg-indigo-600' },
    { label: 'Instructor Earnings (Assigned)', value: `$${(earnings?.totalPending || 0).toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'bg-green-600' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={56} />
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Calibrating instructor metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block"
            >
              Instructor Portal Alpha
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tighter"
            >
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{user?.name}</span>
            </motion.h1>
          </div>
          
          {user?.role === 'admin' && (
            <button className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group">
               <Plus size={18} className="group-hover:rotate-90 transition-transform" />
               Create New Course
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                 {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-950 uppercase tracking-tight">{stat.value}</h4>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Courses Section */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-blue-600 pl-6">
               Active <span className="text-blue-600">Curriculums</span>
            </h2>
            
            <div className="space-y-6">
              {courses.length > 0 ? courses.map((course, i) => (
                <div key={course._id || course.id || i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                   <div className="w-40 h-28 rounded-3xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50">
                      <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight mb-2">{course.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{course.category?.main || 'Uncategorized'} • {course.level}</p>
                   </div>
                   <div className="flex items-center gap-10 px-8 border-x border-slate-100 hidden md:flex">
                      <div className="text-center">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Students</p>
                         <p className="text-sm font-black text-slate-900">{course.stats?.enrollments || 0}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Rating</p>
                         <p className="text-sm font-black text-slate-900">{course.stats?.average_rating?.toFixed(1) || '0.0'}</p>
                      </div>
                   </div>
                   <Link 
                     href={`/teacher/courses/${course._id || course.id}/curriculum`}
                     className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group"
                   >
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              )) : (
                <div className="p-20 text-center bg-white rounded-[3.5rem] border border-slate-100 border-dashed">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active courses published yet</p>
                </div>
              )}
            </div>

            {/* Earnings Breakdown Table */}
            <div className="mt-12 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm overflow-hidden">
               <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <TrendingUp size={20} className="text-green-600" /> Faculty Payout <span className="text-green-600">Breakdown</span>
               </h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                           <th className="pb-6 pl-4">Asset Identity</th>
                           <th className="pb-6 text-center">Cohorts</th>
                           <th className="pb-6 text-right pr-4">Accrued ($)</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {earnings?.breakdown?.map((item: any, i: number) => (
                           <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="py-5 pl-4">
                                 <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{item.courseTitle}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {item.courseId.substring(0, 8)}</p>
                              </td>
                              <td className="py-5 text-center text-xs font-black text-slate-700">{item.students}</td>
                              <td className="py-5 text-right pr-4 text-xs font-black text-green-600">${item.amount.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>

          {/* Live Classes Section */}
          <div className="lg:col-span-4">
             <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-cyan-400 pl-6">
                Upcoming <span className="text-cyan-500">Events</span>
             </h2>

             <div className="space-y-4">
               {liveClasses.length > 0 ? liveClasses.map((item, i) => (
                 <div key={item._id || item.id || i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="flex items-center gap-4 mb-4">
                       <span className={`w-2 h-2 rounded-full ${item.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-blue-500'}`}></span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.status}</span>
                    </div>
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 truncate">{item.title}</h5>
                    <div className="space-y-3 pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-3">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                             {new Date(item.scheduled_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <Link 
                         href={`/live-classes/${item._id || item.id}/join`}
                         className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all group/btn"
                       >
                         <span className="text-[10px] font-black uppercase tracking-widest">Start Stream</span>
                         <Play size={12} fill="currentColor" className="group-hover/btn:scale-125 transition-transform" />
                       </Link>
                    </div>
                 </div>
                )) : (
                  <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">No upcoming live sessions</p>
                     <button 
                       onClick={() => setIsScheduleModalOpen(true)}
                       className="text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline"
                     >
                       Schedule Your First Broadcast
                     </button>
                  </div>
                )}
             </div>

             <button 
               onClick={() => setIsScheduleModalOpen(true)}
               className="w-full mt-8 py-5 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all flex items-center justify-center gap-3"
             >
                <Plus size={14} /> Global Link New Live Event
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsScheduleModalOpen(false)}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">
                     Schedule <span className="text-blue-600">Live Broadcast</span>
                   </h2>
                   <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                     <Plus size={20} className="rotate-45" />
                   </button>
                </div>
                <form onSubmit={handleScheduleSession} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Linked Curriculum Asset</label>
                      <select 
                        required
                        value={schedulingForm.course_id}
                        onChange={(e) => setSchedulingForm({ ...schedulingForm, course_id: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm appearance-none"
                      >
                         <option value="">Select Primary Asset...</option>
                         {courses.map(c => (
                           <option key={c._id} value={c._id}>{c.title}</option>
                         ))}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transmission Title</label>
                      <input 
                        required
                        value={schedulingForm.title}
                        onChange={(e) => setSchedulingForm({ ...schedulingForm, title: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                        placeholder="Live Analysis: Market Trends..."
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Scheduled Start</label>
                         <input 
                           type="datetime-local"
                           required
                           value={schedulingForm.scheduled_start}
                           onChange={(e) => setSchedulingForm({ ...schedulingForm, scheduled_start: e.target.value })}
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                         />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Scheduled End</label>
                         <input 
                           type="datetime-local"
                           required
                           value={schedulingForm.scheduled_end}
                           onChange={(e) => setSchedulingForm({ ...schedulingForm, scheduled_end: e.target.value })}
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                         />
                      </div>
                   </div>
                   <div className="flex justify-end gap-6 pt-10 border-t border-slate-50">
                      <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Abort</button>
                      <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Authorize Broadcast</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
