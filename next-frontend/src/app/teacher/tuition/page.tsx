"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ChevronRight, 
  Search, 
  Loader2,
  ArrowLeft,
  BookOpen,
  Users
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const TeacherTuitionListing = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'teacher' && user.role !== 'admin') {
        toast.error('Unauthorized access');
        router.push('/dashboard');
      } else {
        fetchTuitionSubjects();
      }
    }
  }, [user, isLoadingAuth]);

  const fetchTuitionSubjects = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get('/teacher/tuition/subjects');
      setSubjects(response.data || []);
    } catch (error) {
      toast.error('Failed to load assigned tuition subjects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(item => 
    item.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.class?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Tuition Registry</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header Navigation */}
        <div className="mb-16 flex items-center justify-between">
           <Link 
             href="/teacher/dashboard" 
             className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors group"
           >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                 <ArrowLeft size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
           </Link>

           <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Nexus Academy Faculty</span>
              <GraduationCap size={16} className="text-orange-600" />
           </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <GraduationCap size={16} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">Academic Registry</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter">
                Tuition <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-500">Syllabuses</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl">
                 Orchestrate the academic journey for your assigned students. Manage syllabus structure and learning materials with precision.
              </p>
           </div>

           <div className="relative w-full lg:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search Subjects or Classes..."
                className="w-full bg-white border border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 font-bold text-sm outline-none focus:border-orange-300 shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {filteredSubjects.map((item, i) => (
             <motion.div 
               key={item.subject?.subject_id || i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm group hover:border-orange-200 transition-all flex flex-col"
             >
                <div className="p-10 flex-1">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg">
                           Grade {item.class?.class_level}
                         </span>
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                           item.subject?.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                         }`}>
                           {item.subject?.status || 'draft'}
                         </span>
                      </div>
                      <div className="flex -space-x-3">
                         {[1, 2, 3].map((_, idx) => (
                           <div key={idx} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher${idx}`} alt="" />
                           </div>
                         ))}
                         <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                            +5
                         </div>
                      </div>
                   </div>

                   <h4 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2 group-hover:text-orange-600 transition-colors">
                     {item.subject?.name}
                   </h4>
                   <p className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px] mb-6">
                     {item.class?.title} Registry
                   </p>
                   
                   <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                     Manage the complete academic syllabus for {item.subject?.name}. Upload videos, articles, and interactive assets for Grade {item.class?.class_level} Nexvera students.
                   </p>

                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Learning Assets</p>
                         <p className="text-xl font-black text-slate-900 tracking-tighter">Verified Content</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Pedagogy Style</p>
                         <p className="text-xl font-black text-slate-900 tracking-tighter">Academic Hub</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Cohort</span>
                         <div className="flex items-center gap-2">
                            <Users size={12} className="text-slate-400" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">Grade {item.class?.class_level} Learners</span>
                         </div>
                      </div>
                      <Link 
                        href={`/teacher/tuition/${item.subject?.subject_id}`}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group/btn"
                      >
                         Forge Syllabus
                         <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </div>
             </motion.div>
           ))}

           {filteredSubjects.length === 0 && (
              <div className="lg:col-span-2 py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                 <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <BookOpen size={40} />
                 </div>
                 <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">
                    {searchQuery ? 'No Matches Found' : 'No Active Assignments'}
                 </h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {searchQuery ? `We couldn't find any results for "${searchQuery}"` : "You haven't been assigned to any tuition subjects yet."}
                 </p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TeacherTuitionListing;
