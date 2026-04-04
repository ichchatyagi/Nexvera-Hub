"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const CourseEnrollmentsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && user?.role === 'admin') {
      fetchData();
    }
  }, [user, isLoadingAuth, id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch enrollments
      const enrollmentsRes: any = await api.get(`/admin/courses/${id}/enrollments`);
      setEnrollments(enrollmentsRes.data || []);

      // Fetch course details for title/slug
      try {
          // Attempt to get course details. Note: endpoints might vary, using /courses/:id
          const courseRes: any = await api.get(`/courses/${id}`);
          setCourse(courseRes.data);
      } catch (err) {
          console.error("Failed to fetch course title", err);
      }
    } catch (error) {
      toast.error('Failed to load cohort data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing User Registry</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-2">Administrative privileges required.</p>
      </div>
    );
  }

  return (
    <div className="px-12 pb-24">
      <div className="container mx-auto">
        <div className="mb-12">
           <button 
             onClick={() => router.back()}
             className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 group"
           >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to catalog</span>
           </button>

           <div className="flex items-center gap-3 mb-2">
              <Users size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Course Cohort</span>
           </div>
           <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
             Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Learners</span>
           </h1>
           {course && (
             <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">
               Identity: {course.title} <span className="text-slate-200 mx-2">|</span> ID: {id}
             </p>
           )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="p-3 bg-blue-50 rounded-2xl w-fit text-blue-600 mb-4">
                    <Users size={20} />
                 </div>
                 <p className="text-3xl font-black text-slate-950 tracking-tighter mb-1">{enrollments.length}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Enrollments</p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="p-3 bg-green-50 rounded-2xl w-fit text-green-600 mb-4">
                    <Target size={20} />
                 </div>
                 <p className="text-3xl font-black text-slate-950 tracking-tighter mb-1">
                   {Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress?.percentage || 0), 0) / (enrollments.length || 1))}%
                 </p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Avg. Completion</p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="p-3 bg-cyan-50 rounded-2xl w-fit text-cyan-600 mb-4">
                    <CheckCircle2 size={20} />
                 </div>
                 <p className="text-3xl font-black text-slate-950 tracking-tighter mb-1">
                   {enrollments.filter(e => e.status === 'active').length}
                 </p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Healthy Subscriptions</p>
               </div>
            </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Learner Identity</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Status</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Progression</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Acquisition Date</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Operations</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {enrollments.map((enr) => (
                      <tr key={enr._id} className="hover:bg-slate-50/30 transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                  <Users size={18} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-0.5">{enr.student_id}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global UUID</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              enr.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                            } border`}>
                              {enr.status}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-600 rounded-full" 
                                    style={{ width: `${enr.progress?.percentage || 0}%` }}
                                  />
                               </div>
                               <span className="text-xs font-black text-slate-900 tracking-tighter">{enr.progress?.percentage || 0}%</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                               <Calendar size={12} className="text-slate-300" />
                               {new Date(enr.enrolled_at || Date.now()).toLocaleDateString('en-IN', {
                                 day: '2-digit',
                                 month: 'short',
                                 year: 'numeric'
                               })}
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => router.push(`/admin/enrollments/user/${enr.student_id}`)}
                              className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all border border-transparent hover:border-slate-100"
                            >
                               <ExternalLink size={16} />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>

           {enrollments.length === 0 && (
             <div className="py-24 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                   <Users size={32} />
                </div>
                <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-1">Null Cohort</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No active deployments detected for this asset.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentsPage;
