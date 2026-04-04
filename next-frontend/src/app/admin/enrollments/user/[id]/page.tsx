"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  BookOpen, 
  Clock,
  ExternalLink,
  ShieldAlert,
  Mail,
  Target
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const UserEnrollmentsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, isLoading: isLoadingAuth } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && currentUser?.role === 'admin') {
      fetchData();
    }
  }, [currentUser, isLoadingAuth, id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch enrollments
      const enrollmentsRes: any = await api.get(`/admin/users/${id}/enrollments`);
      setEnrollments(enrollmentsRes.data || []);

      // Fetch user identity
      try {
          const userRes: any = await api.get(`/users/${id}`);
          setTargetUser(userRes.data);
      } catch (err) {
          console.error("Failed to fetch user details", err);
      }
    } catch (error) {
      toast.error('Failed to load user enrollment history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Retrieving User Profile</p>
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
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
              <span className="text-[10px] font-black uppercase tracking-widest">Back to registry</span>
           </button>

           <div className="flex items-center gap-3 mb-2">
              <User size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Learner Dossier</span>
           </div>
           <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
             User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Portfolio</span>
           </h1>
           
           {targetUser ? (
             <div className="flex flex-col lg:flex-row lg:items-center gap-6 mt-8 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl font-black">
                   {targetUser.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{targetUser.email}</h2>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <ShieldAlert size={12} className="text-blue-600" />
                         Role: {targetUser.role}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <Mail size={12} className="text-blue-600" />
                         {targetUser.id}
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">
               Context ID: {id}
             </p>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-3">
                    <BookOpen size={16} className="text-blue-600" />
                    Asset Acquisition List
                 </h3>
                 <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {enrollments.length} Records
                 </span>
              </div>

              <div className="space-y-4">
                 {enrollments.map((enr) => (
                    <div key={enr._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-slate-200 transition-all group shadow-sm">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                <BookOpen size={20} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{enr.course_id}</p>
                                <div className="flex items-center gap-3">
                                   <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                     enr.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                   }`}>
                                     {enr.status}
                                   </span>
                                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                      <Calendar size={10} /> Enrolled {new Date(enr.enrolled_at || Date.now()).toLocaleDateString()}
                                   </span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-8 pl-16 md:pl-0">
                             <div className="text-right whitespace-nowrap">
                                <p className="text-xs font-black text-slate-950 tracking-tighter mb-1">{enr.progress?.percentage || 0}%</p>
                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-blue-600 rounded-full transition-all"
                                     style={{ width: `${enr.progress?.percentage || 0}%` }}
                                   />
                                </div>
                             </div>
                             <button 
                               onClick={() => router.push(`/admin/enrollments/course/${enr.course_id}`)}
                               className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
                             >
                                <ExternalLink size={16} />
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}

                 {enrollments.length === 0 && (
                   <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active deployments detected for this user.</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-950/20">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">User Statistics</h4>
                 <div className="space-y-8">
                    <div>
                       <p className="text-3xl font-black tracking-tighter mb-1">{enrollments.length}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Deployments</p>
                    </div>
                    <div>
                       <p className="text-3xl font-black tracking-tighter mb-1">
                         {enrollments.length > 0 
                            ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress?.percentage || 0), 0) / enrollments.length) 
                            : 0}%
                       </p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Progress Index</p>
                    </div>
                    <div>
                        <p className="text-xl font-black tracking-tighter mb-1">
                           {enrollments.some(e => e.status === 'active') ? 'DEPLOYED' : 'IDLE'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Status</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Clock size={14} className="text-blue-600" /> Security Logs
                 </h4>
                 <div className="space-y-4">
                    <div className="flex gap-4">
                       <div className="w-1 h-1 mt-1.5 rounded-full bg-blue-600 shrink-0" />
                       <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
                          Full portfolio scan authorized by {currentUser?.email}
                       </p>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-1 h-1 mt-1.5 rounded-full bg-slate-200 shrink-0" />
                       <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                          Registry audit complete
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserEnrollmentsPage;
