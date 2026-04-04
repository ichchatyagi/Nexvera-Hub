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
  Video,
  Users,
  IndianRupee,
  Wallet,
  ArrowUpRight,
  TrendingDown,
  Activity,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && user) {
      fetchDashboardData();
    }
  }, [user, isLoadingAuth]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Data for all users (upcoming live classes)
      const liveRes = await api.get('/live-classes');
      setLiveSessions(liveRes.data?.filter((l: any) => l.status !== 'completed').slice(0, 3) || []);

      if (user?.role === 'teacher' || user?.role === 'admin') {
        // Teacher specific data
        try {
          const earningsRes = await api.get('/instructor/earnings');
          setEarnings(earningsRes.data);
        } catch (e) {
          console.error('Failed to load instructor earnings:', e);
        }
      }

      // Student/Learning data
      try {
        const enrollRes = await api.get('/enrollments/my-learning');
        setEnrollments(enrollRes.data || []);
      } catch (e) {
        // Teachers might not have enrollments, that's fine
        setEnrollments([]);
      }
      
    } catch (error) {
      toast.error('Failed to sync hub metrics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={56} />
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Synchronizing academic data...</p>
      </div>
    );
  }

  const studentStats = [
    { label: 'Active Courses', value: enrollments.length.toString(), icon: <BookOpen size={20} />, color: 'bg-blue-600' },
    { label: 'Learning Time', value: '12.5h', icon: <Clock size={20} />, color: 'bg-cyan-500' },
    { label: 'Certifications', value: '2', icon: <Trophy size={20} />, color: 'bg-orange-500' },
    { label: 'Avg. Progress', value: '68%', icon: <TrendingUp size={20} />, color: 'bg-indigo-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center md:text-left mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block"
            >
              Nexvera Hub Access Node
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tighter"
            >
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-6xl">{user?.name}</span>
            </motion.h1>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Live • {user?.role}</span>
          </div>
        </div>

        {/* Teacher Earnings Widget (Conditional) */}
        {user?.role === 'teacher' && earnings && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter border-l-4 border-blue-600 pl-6">
                 Estimated <span className="text-blue-600">Earnings</span>
               </h2>
               <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                  <AlertCircle size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Calculated Estimates</span>
               </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
               {/* Total Card */}
               <div className="lg:col-span-4 bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-3xl pointer-events-none group-hover:bg-blue-600/30 transition-all duration-700" />
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 border border-white/10">
                     <Wallet className="text-blue-500" size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Available for Settlement</p>
                  <h3 className="text-5xl font-black tracking-tighter mb-8 flex items-baseline gap-2">
                     <span className="text-blue-500 text-3xl">₹</span>
                     {earnings.totalPending?.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/60">
                     <span className="flex items-center gap-1.5 text-green-400"><ArrowUpRight size={14}/> +12.4%</span>
                     <span>Vs Last Month</span>
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5">
                     <p className="text-[9px] font-medium leading-relaxed text-white/30 italic">
                        * Payouts are processed separately according to Nexvera's billing cycles and may differ from these real-time estimates.
                     </p>
                  </div>
               </div>

               {/* Breakdown Table */}
               <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0">Asset Performance Breakdown</h4>
                     <Link href="/teacher/courses" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Manage Courses</Link>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="bg-slate-50/50">
                              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-300">Course Identifier</th>
                              <th className="px-8 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-300">Cohort Size</th>
                              <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-300">Calculated Yield</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {earnings.breakdown?.slice(0, 4).map((item: any, i: number) => (
                             <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-6">
                                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.courseTitle}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Commission: {item.basis}</p>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                      <Users size={12} className="text-slate-400" />
                                      <span className="text-sm font-black text-slate-700 tracking-tighter">{item.students} Learners</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <span className="text-sm font-black text-blue-600 tracking-tighter">₹{item.amount.toLocaleString()}</span>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          </motion.section>
        )}

        {/* Stats Grid for Students (or Learning view for Teachers) */}
        {(user?.role === 'student' || enrollments.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {studentStats.map((stat, i) => (
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
        )}

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Course Feed */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-blue-600 pl-6">
               Academic <span className="text-blue-600">Track</span>
            </h2>
            
            <div className="space-y-8">
              {enrollments.length > 0 ? enrollments.map((enr, i) => {
                const course = enr.course;
                const progress = enr.progress || 0;
                
                return (
                  <div key={enr.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group">
                     <div className="w-56 h-36 rounded-[2.5rem] bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-50">
                        <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">{course.category}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{course.level}</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight truncate-2">{course.title}</h4>
                        
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <Users size={10} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                             Mentor: <span className={course.teacher_name ? "text-blue-600" : "text-slate-300 italic"}>
                               {course.teacher_name || "Assignment Pending"}
                             </span>
                           </p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                           <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                              ></motion.div>
                           </div>
                           <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">{progress}%</span>
                        </div>
                     </div>
                     <Link 
                       href={`/courses/${course.slug}`}
                       className="w-16 h-16 rounded-[2rem] bg-slate-950 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all active:scale-90 shadow-xl"
                     >
                       <Play fill="currentColor" size={24} className="ml-1" />
                     </Link>
                  </div>
                );
              }) : (
                <div className="p-24 text-center bg-white rounded-[4rem] border border-slate-100 border-dashed">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                      <BookOpen size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">{user?.role === 'teacher' ? 'No Learning Tracks' : 'No Enrollments Detected'}</h3>
                   <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                      {user?.role === 'teacher' 
                        ? 'Your teaching profile is active. You can also enroll in courses to expand your own horizons.' 
                        : "You haven't added any curriculums to your learning path yet. Explore our catalog to begin your professional journey."}
                   </p>
                   <Link href="/courses" className="px-10 py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-200 hover:scale-105 transition-all">Browse Courses</Link>
                </div>
              )}
            </div>
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
                       <div key={session.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                          {session.status === 'live' && (
                             <div className="absolute top-4 right-4 animate-pulse">
                                <span className="w-3 h-3 rounded-full bg-red-600 block shadow-lg shadow-red-200"></span>
                             </div>
                          )}
                          <h5 className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-6 truncate">{session.title}</h5>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(session.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <Link href={`/live-classes/${session.id}/join`} className="flex items-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
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

                {user?.role === 'student' && (
                  <div className="bg-slate-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 blur-[80px] -mr-20 -mt-20 opacity-30"></div>
                     <h4 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">Nexvera <span className="text-blue-500">Elite</span> Upgrade</h4>
                     <p className="text-xs text-white/40 font-medium leading-relaxed mb-8 relative z-10">Unlock premium academic support with personal mentorship and full roadmap access.</p>
                     <button className="w-full py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-[9px] rounded-2xl relative z-10 hover:bg-blue-50 transition-all">Upgrade Portal</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
