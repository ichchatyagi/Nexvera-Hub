"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Plus, Edit, Trash2, Users, BookOpen, Loader2, UserPlus, 
  CheckCircle, X, Shield, Globe, Lock, ArrowLeft, MonitorPlay
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminTuitionDashboard() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();

  // Primary Views Model
  const [view, setView] = useState<'list' | 'subjects'>('list');
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Class Scope
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState<any>({
    title: '', slug: '', description: '', short_description: '', language: 'English', thumbnail_url: '',
    class_level: 10, boards_supported: '', pricing: { monthly_enabled: false, monthly_price: 0, bundle_enabled: false, bundle_price: 0, currency: 'INR' }
  });

  // Subject Scope
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState<any>({
    name: '', slug: '', short_description: '', pricing: { monthly_enabled: false, monthly_price: 0, bundle_enabled: false, bundle_price: 0, currency: 'INR' }
  });

  // Instructor Scope
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [instructorForm, setInstructorForm] = useState({ instructor_id: '', is_lead: false });

  useEffect(() => {
    if (!isLoadingAuth && user?.role === 'admin') {
      fetchClasses();
      fetchTeachers();
    }
  }, [user, isLoadingAuth]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/courses?status=all&product_type=tuition&limit=100');
      setClasses(res.data || []);
    } catch (e) {
      toast.error('Failed to load tuition classes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users/teachers');
      setTeachers(res.data || []);
    } catch {
      // Background failure silently caught to avoid user pain
    }
  };

  // refresh a single class cleanly when in subject view
  const refreshSelectedClass = async (classId: string) => {
    try {
      const res = await api.get('/courses?status=all&product_type=tuition&limit=100');
      setClasses(res.data || []);
      const updatedClass = (res.data || []).find((c: any) => c._id === classId);
      if (updatedClass) setSelectedClass(updatedClass);
    } catch (e) {
      fetchClasses();
    }
  };

  /* ----- CLASS ACTIONS ----- */
  const handleOpenClassModal = (cls: any = null) => {
    if (cls) {
      setSelectedClass(cls);
      setClassForm({
        title: cls.title, slug: cls.slug, description: cls.description || '', short_description: cls.short_description || '',
        language: cls.language || 'English', thumbnail_url: cls.thumbnail_url || '',
        class_level: cls.tuition_meta?.class_level || 10,
        boards_supported: (cls.tuition_meta?.boards_supported || []).join(', '),
        pricing: {
          monthly_enabled: cls.tuition_meta?.pricing?.monthly_enabled || false,
          monthly_price: cls.tuition_meta?.pricing?.monthly_price || 0,
          bundle_enabled: cls.tuition_meta?.pricing?.bundle_enabled || false,
          bundle_price: cls.tuition_meta?.pricing?.bundle_price || 0,
          currency: cls.tuition_meta?.pricing?.currency || 'INR',
        }
      });
    } else {
      setSelectedClass(null);
      setClassForm({
        title: '', slug: '', description: '', short_description: '', language: 'English', thumbnail_url: '',
        class_level: 10, boards_supported: '', pricing: { monthly_enabled: false, monthly_price: 0, bundle_enabled: false, bundle_price: 0, currency: 'INR' }
      });
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading(selectedClass ? 'Updating class...' : 'Creating class...', { id: 'class' });
      const payload = {
        ...classForm,
        class_level: Number(classForm.class_level),
        boards_supported: classForm.boards_supported.split(',').map((s: string) => s.trim()).filter(Boolean),
        tuition_pricing: { ...classForm.pricing, monthly_price: Number(classForm.pricing.monthly_price), bundle_price: Number(classForm.pricing.bundle_price) }
      };
      delete payload.pricing;

      if (selectedClass) {
        await api.put(`/admin/tuition/classes/${selectedClass._id}`, payload);
        toast.success('Class updated', { id: 'class' });
      } else {
        await api.post('/admin/tuition/classes', payload);
        toast.success('Class created', { id: 'class' });
      }
      setIsClassModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save class', { id: 'class' });
    }
  };

  const toggleClassPublish = async (cls: any) => {
    try {
      const newStatus = cls.status === 'published' ? 'draft' : 'published';
      toast.loading('Toggling publish status...', { id: 'pub' });
      await api.post(`/admin/tuition/classes/${cls._id}/publish`, { status: newStatus });
      toast.success(`Class marked ${newStatus}`, { id: 'pub' });
      fetchClasses();
    } catch (e) {
      toast.error('Failed to change publish status', { id: 'pub' });
    }
  };

  const handleDeleteClass = async (clsId: string) => {
    if (!confirm('Are you sure you want to delete this Tuition Class?')) return;
    try {
      toast.loading('Deleting...', { id: 'del' });
      await api.delete(`/admin/tuition/classes/${clsId}`);
      toast.success('Class Deleted', { id: 'del' });
      fetchClasses();
    } catch (e) {
      toast.error('Delete failed', { id: 'del' });
    }
  };

  /* ----- SUBJECT ACTIONS ----- */
  const openSubjectModal = (sub: any = null) => {
    if (sub) {
      setSelectedSubject(sub);
      setSubjectForm({
        name: sub.name, slug: sub.slug || sub.subject_id, short_description: sub.short_description || '',
        pricing: {
          monthly_enabled: sub.pricing?.monthly_enabled || false,
          monthly_price: sub.pricing?.monthly_price || 0,
          bundle_enabled: sub.pricing?.bundle_enabled || false,
          bundle_price: sub.pricing?.bundle_price || 0,
          currency: sub.pricing?.currency || 'INR'
        }
      });
    } else {
      setSelectedSubject(null);
      setSubjectForm({
        name: '', slug: '', short_description: '', pricing: { monthly_enabled: false, monthly_price: 0, bundle_enabled: false, bundle_price: 0, currency: 'INR' }
      });
    }
    setIsSubjectModalOpen(true);
  };

  const saveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      toast.loading('Saving subject...', { id: 'sub' });
      const payload = {
        ...subjectForm,
        pricing: { ...subjectForm.pricing, monthly_price: Number(subjectForm.pricing.monthly_price), bundle_price: Number(subjectForm.pricing.bundle_price) }
      };

      if (selectedSubject) {
        await api.put(`/admin/tuition/classes/${selectedClass._id}/subjects/${selectedSubject.subject_id}`, payload);
      } else {
        await api.post(`/admin/tuition/classes/${selectedClass._id}/subjects`, payload);
      }
      toast.success('Subject saved successfully', { id: 'sub' });
      setIsSubjectModalOpen(false);
      refreshSelectedClass(selectedClass._id); // dynamically update selected scope
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed saving subject', { id: 'sub' });
    }
  };

  const toggleSubjectPublish = async (sub: any) => {
    try {
       const newStatus = sub.status === 'published' ? 'draft' : 'published';
       toast.loading('Updating subject status...', { id: 'subpub' });
       await api.post(`/admin/tuition/classes/${selectedClass._id}/subjects/${sub.subject_id}/publish`, { status: newStatus });
       toast.success('Subject published state changed', { id: 'subpub' });
       refreshSelectedClass(selectedClass._id);
    } catch (e) {
       toast.error('Failed toggling subject status', { id: 'subpub' });
    }
  };

  const removeSubject = async (sub: any) => {
     if (!confirm('Are you sure you want to delete this subject?')) return;
     try {
        toast.loading('Deleting subject...', { id: 'subdel' });
        await api.delete(`/admin/tuition/classes/${selectedClass._id}/subjects/${sub.subject_id}`);
        toast.success('Subject deleted', { id: 'subdel' });
        refreshSelectedClass(selectedClass._id);
     } catch (e) {
        toast.error('Failed deleting subject', { id: 'subdel' });
     }
  };

  /* ----- INSTRUCTOR ACTIONS ----- */
  const handleAssignInstructor = async () => {
     if (!selectedSubject || !instructorForm.instructor_id) return;
     try {
       toast.loading('Assigning instructor...', { id: 'inst' });
       await api.post(`/admin/tuition/classes/${selectedClass._id}/subjects/${selectedSubject.subject_id}/assign-instructor`, instructorForm);
       toast.success('Instructor successfully assigned', { id: 'inst' });
       setIsInstructorModalOpen(false);
       refreshSelectedClass(selectedClass._id);
     } catch (e: any) {
       toast.error(e.response?.data?.message || 'Assignment failed', { id: 'inst' });
     }
  };

  const handleUnassignInstructor = async (sub: any, instructorId: string) => {
     if (!confirm('Remove this instructor?')) return;
     try {
       toast.loading('Removing instructor...', { id: 'uninst' });
       await api.delete(`/admin/tuition/classes/${selectedClass._id}/subjects/${sub.subject_id}/instructors/${instructorId}`);
       toast.success('Instructor removed', { id: 'uninst' });
       refreshSelectedClass(selectedClass._id);
     } catch (e) {
       toast.error('Removal failed', { id: 'uninst' });
     }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Mapping Tuition Directories</p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 pb-24 relative">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8 pt-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield size={14} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Local Academics Engine</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tuition</span>
          </h1>
        </div>
        
        {view === 'list' && (
          <button 
            onClick={() => handleOpenClassModal()}
            className="flex items-center gap-4 px-8 py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl"
          >
             <Plus size={18} /> New Tuition Class
          </button>
        )}

        {view === 'subjects' && (
          <button 
            onClick={() => { setView('list'); setSelectedClass(null); fetchClasses(); }}
            className="flex items-center gap-4 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
             <ArrowLeft size={16} /> Return to Classes
          </button>
        )}
      </div>

      {/* VIEW: MAIN LIST */}
      {view === 'list' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Class Block</th>
                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing Triggers</th>
                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment Status</th>
                   <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Operation Tools</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {classes.map((cls) => (
                    <tr key={cls._id} className="hover:bg-slate-50/30 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-sm relative bg-slate-100 flex items-center justify-center">
                              {cls.thumbnail_url ? <Image src={cls.thumbnail_url} className="object-cover" fill alt="T" /> : <BookOpen size={20} className="text-slate-300" />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{cls.title}</p>
                              <div className="flex items-center gap-3">
                                 <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">Class {cls.tuition_meta?.class_level}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cls.tuition_meta?.subjects?.length || 0} Subjects</span>
                              </div>
                            </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                           <div className="flex flex-col gap-1">
                             <div className="text-[10px] font-black tracking-widest text-slate-500 flex gap-2">
                               <span className={cls.tuition_meta?.pricing?.monthly_enabled ? 'text-green-600' : 'text-slate-300 opacity-50'}>MO: ₹{cls.tuition_meta?.pricing?.monthly_price || 0}</span>
                             </div>
                             <div className="text-[10px] font-black tracking-widest text-slate-500 flex gap-2">
                               <span className={cls.tuition_meta?.pricing?.bundle_enabled ? 'text-blue-600' : 'text-slate-300 opacity-50'}>BU: ₹{cls.tuition_meta?.pricing?.bundle_price || 0}</span>
                             </div>
                           </div>
                       </td>
                       <td className="px-8 py-6">
                          <button 
                            onClick={() => toggleClassPublish(cls)}
                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 ${
                              cls.status === 'published' 
                              ? 'bg-green-50 text-green-600 border border-green-100' 
                              : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                            }`}
                          >
                            {cls.status === 'published' ? <Globe size={10} /> : <Lock size={10} />}
                            {cls.status === 'published' ? 'Live' : 'Draft'}
                          </button>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => { setSelectedClass(cls); setView('subjects'); }}
                              className="p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                            >
                              <BookOpen size={16} /> Manage Subjects
                            </button>
                            <button 
                              onClick={() => handleOpenClassModal(cls)}
                              className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-white hover:text-blue-600 transition-all border border-transparent hover:border-slate-100"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClass(cls._id)}
                              className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {classes.length === 0 && (
                   <tr>
                     <td colSpan={4} className="py-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">No tuition classes generated.</td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SUBJECTS MANAGER */}
      {view === 'subjects' && selectedClass && (
         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Class {selectedClass.tuition_meta.class_level} Subjects</h2>
                  <p className="text-slate-500 font-bold text-sm tracking-tight">{selectedClass.title}</p>
               </div>
               <button 
                  onClick={() => openSubjectModal()}
                  className="px-6 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
               >
                 <Plus size={14} /> Add Subject
               </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
               {(selectedClass.tuition_meta?.subjects || []).map((sub: any) => (
                  <div key={sub.subject_id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                     {/* Header */}
                     <div className="flex items-start justify-between mb-6">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                               <MonitorPlay size={18} />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{sub.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.slug || sub.subject_id}</p>
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => toggleSubjectPublish(sub)} className={`p-2 rounded-lg text-xs font-bold uppercase ${sub.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                             {sub.status === 'published' ? 'PUB' : 'DRF'}
                           </button>
                           <button onClick={() => openSubjectModal(sub)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                           <button onClick={() => removeSubject(sub)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                     </div>

                     {/* Pricing Summary */}
                     <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 mb-6">
                        <div className="flex-1 flex flex-col">
                           <span className="text-[9px] uppercase font-black text-slate-400">Monthly Tier</span>
                           {sub.pricing?.monthly_enabled ? <span className="font-black text-slate-800">₹{sub.pricing?.monthly_price}</span> : <span className="text-slate-300">Disabled</span>}
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex-1 flex flex-col">
                           <span className="text-[9px] uppercase font-black text-slate-400">Bundle Tier</span>
                           {sub.pricing?.bundle_enabled ? <span className="font-black text-slate-800">₹{sub.pricing?.bundle_price}</span> : <span className="text-slate-300">Disabled</span>}
                        </div>
                     </div>

                     {/* Personnel */}
                     <div>
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject Instructors</span>
                           <button onClick={() => { setSelectedSubject(sub); setIsInstructorModalOpen(true); }} className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-1">
                             <UserPlus size={12} /> Assign User
                           </button>
                        </div>
                        {(!sub.assigned_instructor_ids || sub.assigned_instructor_ids.length === 0) ? (
                           <div className="px-4 py-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 text-center">Unassigned</div>
                        ) : (
                           <div className="space-y-2">
                             {sub.assigned_instructor_ids.map((teacherId: string) => {
                               const teacherObj = teachers.find(t => t.id === teacherId);
                               const isLead = sub.lead_instructor_id === teacherId;
                               return (
                                 <div key={teacherId} className="flex items-center justify-between px-4 py-3 border border-slate-100 rounded-xl bg-white hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black ${isLead ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                                          {teacherObj?.name?.charAt(0) || 'U'}
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-slate-800 tracking-tight">{teacherObj?.name || teacherId}</p>
                                          {isLead && <p className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Lead Instructor</p>}
                                       </div>
                                    </div>
                                    <button onClick={() => handleUnassignInstructor(sub, teacherId)} className="text-slate-300 hover:text-red-500 p-2"><X size={14} /></button>
                                 </div>
                               );
                             })}
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* --- CLASS MODAL --- */}
      <AnimatePresence>
        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-6 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsClassModalOpen(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[3rem] w-full max-w-4xl relative z-10 shadow-2xl flex flex-col my-auto max-h-[90vh]">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Class Meta Configuration</h2>
                  <button onClick={() => setIsClassModalOpen(false)} className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900"><X size={16} /></button>
               </div>
               <div className="overflow-y-auto p-8 custom-scrollbar">
                  <form id="classForm" onSubmit={handleSaveClass} className="space-y-8">
                     <div className="grid md:grid-cols-2 gap-8">
                        {/* Basic Meta */}
                        <div className="space-y-6">
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Title</label>
                             <input required value={classForm.title} onChange={(e) => setClassForm({ ...classForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-blue-300" />
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Slug</label>
                             <input required value={classForm.slug} onChange={(e) => setClassForm({ ...classForm, slug: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-blue-300" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade Level</label>
                                 <input type="number" required min="5" max="12" value={classForm.class_level} onChange={(e) => setClassForm({ ...classForm, class_level: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-blue-300" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Boards Supported</label>
                                 <input required placeholder="CBSE, ICSE" value={classForm.boards_supported} onChange={(e) => setClassForm({ ...classForm, boards_supported: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-blue-300" />
                              </div>
                           </div>
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-6">
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thumbnail URL</label>
                             <input value={classForm.thumbnail_url} onChange={(e) => setClassForm({ ...classForm, thumbnail_url: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-blue-300" />
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Short Description</label>
                             <input required value={classForm.short_description} onChange={(e) => setClassForm({ ...classForm, short_description: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-blue-300" />
                           </div>
                           <div>
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Description</label>
                             <textarea required value={classForm.description} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm h-32 resize-none outline-none focus:border-blue-300" />
                           </div>
                        </div>
                     </div>

                     {/* Global Class Pricing */}
                     <div className="border border-blue-100 rounded-[2rem] p-8 bg-blue-50/50">
                        <h4 className="text-sm font-black text-blue-950 uppercase tracking-tighter mb-6 flex items-center gap-2"><Globe size={16} className="text-blue-600" /> Tier Enablers</h4>
                        <div className="grid md:grid-cols-2 gap-8">
                           {/* Monthly */}
                           <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                                 <input type="checkbox" checked={classForm.pricing.monthly_enabled} onChange={(e) => setClassForm({ ...classForm, pricing: { ...classForm.pricing, monthly_enabled: e.target.checked } })} />
                                 <span className="text-xs font-black uppercase text-slate-700 tracking-widest">Global Monthly Access</span>
                              </label>
                              <div className="relative">
                                 <input type="number" required={classForm.pricing.monthly_enabled} disabled={!classForm.pricing.monthly_enabled} value={classForm.pricing.monthly_price} onChange={(e) => setClassForm({ ...classForm, pricing: { ...classForm.pricing, monthly_price: e.target.value } })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 pl-10 font-bold text-sm outline-none focus:border-blue-300 disabled:opacity-50" />
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                              </div>
                           </div>
                           {/* Bundle */}
                           <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                                 <input type="checkbox" checked={classForm.pricing.bundle_enabled} onChange={(e) => setClassForm({ ...classForm, pricing: { ...classForm.pricing, bundle_enabled: e.target.checked } })} />
                                 <span className="text-xs font-black uppercase text-slate-700 tracking-widest">Global Annual Bundle</span>
                              </label>
                              <div className="relative">
                                 <input type="number" required={classForm.pricing.bundle_enabled} disabled={!classForm.pricing.bundle_enabled} value={classForm.pricing.bundle_price} onChange={(e) => setClassForm({ ...classForm, pricing: { ...classForm.pricing, bundle_price: e.target.value } })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 pl-10 font-bold text-sm outline-none focus:border-blue-300 disabled:opacity-50" />
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </form>
               </div>
               <div className="p-8 border-t border-slate-100 shrink-0 flex justify-end">
                  <button type="submit" form="classForm" className="px-10 py-4 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all">Submit Configuration</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SUBJECT MODAL --- */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsSubjectModalOpen(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[3rem] w-full max-w-3xl relative z-10 shadow-2xl flex flex-col">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Subject Architecture</h2>
                  <button onClick={() => setIsSubjectModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl text-slate-500 hover:text-slate-900 flex items-center justify-center"><X size={16} /></button>
               </div>
               <div className="p-8 custom-scrollbar max-h-[70vh] overflow-y-auto">
                 <form id="subForm" onSubmit={saveSubject} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Name</label>
                         <input required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-cyan-300" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Slug</label>
                         <input required value={subjectForm.slug} onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-cyan-300" />
                       </div>
                       <div className="col-span-2">
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Short Description</label>
                         <textarea required value={subjectForm.short_description} onChange={(e) => setSubjectForm({ ...subjectForm, short_description: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-sm outline-none focus:border-cyan-300 min-h-24 resize-none" />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 border border-slate-100 p-6 rounded-[2rem] bg-slate-50/50 mt-4">
                       <div>
                          <label className="flex items-center gap-3 mb-4 cursor-pointer">
                             <input type="checkbox" checked={subjectForm.pricing.monthly_enabled} onChange={(e) => setSubjectForm({ ...subjectForm, pricing: { ...subjectForm.pricing, monthly_enabled: e.target.checked } })} />
                             <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Discrete Subject Monthly</span>
                          </label>
                          <input type="number" disabled={!subjectForm.pricing.monthly_enabled} required={subjectForm.pricing.monthly_enabled} value={subjectForm.pricing.monthly_price} onChange={(e) => setSubjectForm({ ...subjectForm, pricing: { ...subjectForm.pricing, monthly_price: e.target.value } })} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none disabled:opacity-50" />
                       </div>
                       <div>
                          <label className="flex items-center gap-3 mb-4 cursor-pointer">
                             <input type="checkbox" checked={subjectForm.pricing.bundle_enabled} onChange={(e) => setSubjectForm({ ...subjectForm, pricing: { ...subjectForm.pricing, bundle_enabled: e.target.checked } })} />
                             <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Discrete Subject Bundle</span>
                          </label>
                          <input type="number" disabled={!subjectForm.pricing.bundle_enabled} required={subjectForm.pricing.bundle_enabled} value={subjectForm.pricing.bundle_price} onChange={(e) => setSubjectForm({ ...subjectForm, pricing: { ...subjectForm.pricing, bundle_price: e.target.value } })} className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none disabled:opacity-50" />
                       </div>
                    </div>
                 </form>
               </div>
               <div className="p-8 border-t border-slate-100 text-right">
                  <button type="submit" form="subForm" className="px-8 py-4 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-cyan-700 active:scale-95 transition-all">Store Subject Segment</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- INSTRUCTOR ASSIGN MODAL --- */}
      <AnimatePresence>
        {isInstructorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsInstructorModalOpen(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl p-8">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-6">Authorize Personnel</h3>
               
               <select value={instructorForm.instructor_id} onChange={(e) => setInstructorForm({ ...instructorForm, instructor_id: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm mb-4">
                 <option value="">Select Instructor...</option>
                 {teachers.map(t => (
                   <option key={t.id} value={t.id}>{t.name || t.email}</option>
                 ))}
               </select>

               <label className="flex items-center gap-3 mb-8 cursor-pointer pl-1">
                 <input type="checkbox" checked={instructorForm.is_lead} onChange={(e) => setInstructorForm({ ...instructorForm, is_lead: e.target.checked })} />
                 <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assign as Lead Authority</span>
               </label>
               
               <button onClick={handleAssignInstructor} disabled={!instructorForm.instructor_id} className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Assign Instructor</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
