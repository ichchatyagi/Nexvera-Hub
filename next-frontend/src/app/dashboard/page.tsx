"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Play, 
  ChevronRight, 
  Calendar,
  Loader2,
  CheckCircle2,
  Video
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      // Backend: GET /enrollments/mine
      const enrollRes: any = await api.get('/enrollments/mine');
      setEnrollments(enrollRes || []);

      // Fetch upcoming live classes
      const liveRes: any = await api.get('/live-classes');
      const liveData = Array.isArray(liveRes) ? liveRes : liveRes?.data || [];
      setLiveSessions(liveData.filter((l: any) => l.status !== 'completed').slice(0, 3));
    } catch (error) {
      toast.error('Failed to sync learning metrics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeEnrollments = enrollments.filter(e => !e.isCompleted);
  const completedEnrollments = enrollments.filter(e => e.isCompleted);

  const stats = [
    { label: 'Active Courses', value: activeEnrollments.length.toString(), icon: <BookOpen size={20} />, color: 'bg-blue-600' },
    { label: 'Completed', value: completedEnrollments.length.toString(), icon: <CheckCircle2 size={20} />, color: 'bg-green-600' },
    { label: 'Certifications', value: completedEnrollments.length.toString(), icon: <Trophy size={20} />, color: 'bg-orange-500' },
    { label: 'Avg. Progress', value: `${enrollments.length ? Math.round(enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) / enrollments.length) : 0}%`, icon: <TrendingUp size={20} />, color: 'bg-indigo-600' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={56} />
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Synchronizing academic data...</p>
      </div>
    );
  }

  const CourseCard = ({ enr }: { enr: any }) => (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
       <div className="w-56 h-36 rounded-[2.5rem] bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-50">
          <img 
            src={enr.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            alt={enr.courseTitle} 
          />
       </div>
       <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
               {enr.isCompleted ? 'Completed' : 'In Progress'}
             </span>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{enr.level}</span>
          </div>
          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 leading-tight truncate-2">{enr.courseTitle}</h4>
          
          <div className="flex items-center gap-6">
             <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${enr.progressPercentage}%` }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                ></motion.div>
             </div>
             <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">{enr.progressPercentage}%</span>
          </div>
       </div>
       <Link 
         href={enr.currentLessonId ? `/courses/${enr.courseSlug}/lessons/${enr.currentLessonId}` : `/courses/${enr.courseSlug}`}
         className="w-16 h-16 rounded-[2rem] bg-slate-950 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all active:scale-90 shadow-xl"
       >
         <Play fill="currentColor" size={24} className="ml-1" />
       </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center md:text-left mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block"
          >
            Learner Hub Alpha
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tighter"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{user?.name}</span>
          </motion.h1>
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
          {/* Main Course Feed */}
          <div className="lg:col-span-8">
            {activeEnrollments.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-blue-600 pl-6">
                   Active <span className="text-blue-600">Curriculums</span>
                </h2>
                <div className="space-y-8">
                  {activeEnrollments.map((enr) => <CourseCard key={enr.courseId} enr={enr} />)}
                </div>
              </div>
            )}

            {completedEnrollments.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-green-500 pl-6">
                   Completed <span className="text-green-600">Milestones</span>
                </h2>
                <div className="space-y-8">
                  {completedEnrollments.map((enr) => <CourseCard key={enr.courseId} enr={enr} />)}
                </div>
              </div>
            )}

            {enrollments.length === 0 && (
                <div className="p-24 text-center bg-white rounded-[4rem] border border-slate-100 border-dashed">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                      <BookOpen size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">No Enrollments Detected</h3>
                   <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">You haven't added any curriculums to your learning path yet. Explore our catalog to begin your professional journey.</p>
                   <Link href="/courses" className="px-10 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-200 hover:scale-105 transition-all">Browse Courses</Link>
                </div>
            )}
          </div>

          {/* Right Section: Live Classes */}
          <div className="lg:col-span-4">
             <div className="sticky top-32 space-y-12">
               <div>
                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-cyan-400 pl-6">
                    Live <span className="text-cyan-500">Access</span>
                  </h2>
                  <div className="space-y-4">
                     {liveSessions.length > 0 ? liveSessions.map((session, i) => (
                       <div key={session._id || session.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          {session.status === 'live' && (
                             <div className="absolute top-4 right-4 animate-pulse">
                                <span className="w-3 h-3 rounded-full bg-red-600 block shadow-lg shadow-red-200"></span>
                             </div>
                          )}
                          <h5 className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-6 truncate">{session.title}</h5>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {session.scheduled_start ? new Date(session.scheduled_start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Upcoming'}
                                </span>
                             </div>
                             <Link href={`/live-classes/${session.id || session._id}/join`} className="flex items-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Join Now <ChevronRight size={14} />
                             </Link>
                          </div>
                       </div>
                     )) : (
                       <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                          <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">No upcoming live sessions</p>
                       </div>
                     )}
                  </div>
               </div>

               <div className="bg-slate-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 blur-[80px] -mr-20 -mt-20 opacity-30"></div>
                  <h4 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">Nexvera <span className="text-blue-500">Elite</span> Upgrade</h4>
                  <p className="text-xs text-white/40 font-medium leading-relaxed mb-8 relative z-10">Unlock premium academic support with personal mentorship and full roadmap access.</p>
                  <button className="w-full py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-[9px] rounded-2xl relative z-10 hover:bg-blue-50 transition-all">Upgrade Portal</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
