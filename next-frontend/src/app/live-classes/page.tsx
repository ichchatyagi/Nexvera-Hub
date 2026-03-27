"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  ChevronRight, 
  Loader2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  course_id: string;
  course_title: string;
  teacher_name: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

const LiveClassesList = () => {
  const { user, isAuthenticated } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchLiveClasses();
  }, [isAuthenticated]);

  const fetchLiveClasses = async () => {
    try {
      setIsLoading(true);
      // Assuming a dedicated endpoint or filtered GET
      const response = await api.get('/live-classes');
      setLiveClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to load live sessions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full text-center p-12 bg-white rounded-[3rem] shadow-2xl shadow-blue-500/5 border border-slate-100">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <Video size={40} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Identity Verification</h2>
           <p className="text-slate-500 font-medium mb-10 leading-relaxed">Please sign in to access your upcoming live interactive sessions and academic consultations.</p>
           <Link href="/login" className="block w-full py-5 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-200 hover:scale-105 transition-all active:scale-95">
             Secure Log In
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6 block"
          >
            Live Hub
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-tight"
          >
            Real-Time <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Mentorship</span> Sessions
          </motion.h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-6" size={56} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing upcoming live feeds...</p>
          </div>
        ) : liveClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveClasses.map((item, idx) => {
              const startDate = new Date(item.start_time);
              const isLive = item.status === 'live';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col relative overflow-hidden"
                >
                  {isLive && (
                    <div className="absolute top-0 right-0 p-6">
                       <span className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-100">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          Live Now
                       </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-8">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isLive ? 'bg-red-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <Video size={24} strokeWidth={2.5} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Class</span>
                        <span className="text-sm font-bold text-slate-900 tracking-tight truncate max-w-[150px] uppercase font-black">{item.course_title}</span>
                     </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-950 mb-6 uppercase tracking-tight leading-relaxed line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="space-y-4 mb-10 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <Calendar className="text-blue-500" size={18} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                        <span className="text-xs font-bold text-slate-700 tracking-tight">{startDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <Clock className="text-cyan-500" size={18} />
                       <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</span>
                        <span className="text-xs font-bold text-slate-700 tracking-tight">{startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <Link 
                      href={`/live-classes/${item.id}/join`}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 text-center flex items-center justify-center gap-2 ${
                        isLive 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-200' 
                        : 'bg-slate-950 text-white hover:bg-black shadow-xl shadow-slate-200'
                      }`}
                    >
                      {isLive ? 'Join Session Now' : 'Enter Waiting Room'}
                      <ChevronRight size={14} />
                    </Link>
                    <p className="text-[9px] font-black text-center text-slate-300 uppercase tracking-[0.2em] italic">Access secure token provided upon joining</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-md p-20 rounded-[4rem] text-center border border-slate-100 max-w-2xl mx-auto shadow-2xl shadow-blue-500/5">
            <div className="w-24 h-24 bg-white shadow-xl shadow-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
               <Video size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tight mb-4">No Active Sessions</h3>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto">None of your enrolled courses have upcoming live classes currently scheduled. Check back later for updates from your instructors.</p>
            <Link href="/courses" className="mt-12 inline-flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:translate-x-1 transition-transform">
               Explore Available Courses <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassesList;
