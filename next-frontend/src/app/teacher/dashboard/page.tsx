"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Play
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
      const liveRes = await api.get('/live-classes');
      setLiveClasses(liveRes.data?.filter((l: any) => l.status !== 'completed') || []);

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

  const stats = [
    { label: 'Active Students', value: (earnings?.breakdown?.reduce((acc: number, curr: any) => acc + curr.students, 0) || 0).toLocaleString(), icon: <Users size={20} />, color: 'bg-blue-600' },
    { label: 'Assigned Courses', value: courses.length.toString(), icon: <BookOpen size={20} />, color: 'bg-cyan-500' },
    { label: 'Live Sessions', value: liveClasses.length.toString(), icon: <Video size={20} />, color: 'bg-indigo-600' },
    { label: 'Instructor Earnings (Assigned)', value: `₹${(earnings?.totalPending || 0).toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'bg-green-600' },
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
                <div key={course.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                   <div className="w-40 h-28 rounded-3xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50">
                      <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight mb-2">{course.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{course.category} • {course.level}</p>
                   </div>
                   <div className="flex items-center gap-10 px-8 border-x border-slate-100 hidden md:flex">
                      <div className="text-center">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Students</p>
                         <p className="text-sm font-black text-slate-900">42</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Rating</p>
                         <p className="text-sm font-black text-slate-900">{course.rating}</p>
                      </div>
                   </div>
                   <button className="p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group">
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              )) : (
                <div className="p-20 text-center bg-white rounded-[3.5rem] border border-slate-100 border-dashed">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active courses published yet</p>
                   <button className="mt-6 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline">Launch your first curriculum</button>
                </div>
              )}
            </div>
          </div>

          {/* Live Classes Section */}
          <div className="lg:col-span-4">
             <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-cyan-400 pl-6">
                Upcoming <span className="text-cyan-500">Events</span>
             </h2>

             <div className="space-y-4">
               {liveClasses.length > 0 ? liveClasses.map((item, i) => (
                 <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="flex items-center gap-4 mb-4">
                       <span className={`w-2 h-2 rounded-full ${item.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-blue-500'}`}></span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.status}</span>
                    </div>
                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 truncate">{item.title}</h5>
                    <div className="space-y-3 pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-3">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                             {new Date(item.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <Link 
                         href={`/live-classes/${item.id}/join`}
                         className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all group/btn"
                       >
                         <span className="text-[10px] font-black uppercase tracking-widest">Start Stream</span>
                         <Play size={12} fill="currentColor" className="group-hover/btn:scale-125 transition-transform" />
                       </Link>
                    </div>
                 </div>
               )) : (
                 <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No upcoming live sessions</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
