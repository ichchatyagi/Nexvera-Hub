"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Clock, 
  ChevronRight, 
  Play, 
  Plus, 
  Search, 
  Filter,
  GraduationCap,
  Award,
  Globe,
  Loader2,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'teacher' && user.role !== 'admin') {
        toast.error('Unauthorized access');
        router.push('/dashboard');
      } else {
        fetchTeacherCourses();
      }
    }
  }, [user, isLoadingAuth]);

  const fetchTeacherCourses = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get('/teacher/courses');
      setCourses(response.data || []);
    } catch (error) {
      toast.error('Failed to load assigned courses');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Teacher Portal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <GraduationCap size={16} className="text-blue-600" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Faculty Dashboard</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Nexvera</span> Courses
              </h1>
              <p className="text-slate-400 font-medium max-w-xl">
                 Manage the curriculum and pedagogy for courses assigned to you by Nexvera Authority. Your expertise drives the intelligence of our hub.
              </p>
           </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
           {[
             { label: 'Assigned Assets', value: courses.length.toString(), icon: <BookOpen className="text-blue-600" /> },
             { label: 'Total Learners', value: (courses.reduce((acc, c) => acc + (c.stats?.enrollments || 0), 0)).toLocaleString(), icon: <Users className="text-cyan-500" /> },
             { label: 'Content Duration', value: (courses.reduce((acc, c) => acc + (c.total_duration_hours || 0), 0)) + 'h', icon: <Clock className="text-orange-500" /> },
             { label: 'Average Quality', value: (courses.length > 0 ? (courses.reduce((acc, c) => acc + (c.stats?.average_rating || 0), 0) / courses.length).toFixed(1) : '0.0') + '★', icon: <Award className="text-yellow-500" /> },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   {stat.icon}
                </div>
                <p className="text-3xl font-black text-slate-950 tracking-tighter mb-1">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {courses.map((course, i) => (
             <motion.div 
               key={course._id || course.id || i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm group hover:border-blue-200 transition-all flex flex-col md:flex-row"
             >
                <div className="w-full md:w-64 h-64 md:h-auto overflow-hidden relative">
                   <img src={course.thumbnail_url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="" />
                   <div className="absolute top-6 left-6">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md border ${
                        course.status === 'published' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                      }`}>
                         {course.status}
                      </span>
                   </div>
                </div>
                
                <div className="flex-1 p-10 flex flex-col justify-between">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                           {course.category?.main || 'Uncategorized'}
                         </span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {course.level}
                         </span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-950 uppercase tracking-tighter mb-4 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                        {course.short_description || "Pedagogical materials for the Nexvera Hub academic registry."}
                      </p>
                   </div>

                   <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrollment Identity</span>
                         <div className="flex items-center gap-2">
                            <Users size={12} className="text-slate-400" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">Course Cohort #1</span>
                         </div>
                      </div>
                      <Link 
                        href={`/teacher/courses/${course._id || course.id}/curriculum`}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-[9px] rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group/btn"
                      >
                         Assemble Curriculum
                         <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </div>
             </motion.div>
           ))}

           {courses.length === 0 && (
              <div className="lg:col-span-2 py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                 <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                    <BookOpen size={40} />
                 </div>
                 <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">No Active Assignments</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">You haven't been assigned to any Nexvera courses yet.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
