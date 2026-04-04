"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users,
  UserPlus, 
  BookOpen, 
  Loader2,
  CheckCircle,
  Clock,
  X,
  User,
  Shield,
  ArrowRight,
  ChevronRight,
  Globe,
  Lock,
  Tag,
  IndianRupee,
  Layers
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CourseForm {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  price: number;
  level: string;
  thumbnail_url: string;
}

const AdminCoursesDashboard = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    category: '',
    price: 0,
    level: 'Beginner',
    thumbnail_url: ''
  });
  
  // Instructor management state
  const [newInstructorId, setNewInstructorId] = useState('');
  const [isLeadInstructor, setIsLeadInstructor] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && user?.role === 'admin') {
      fetchCourses();
    }
  }, [user, isLoadingAuth]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get('/courses');
      setCourses(response.data || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCourseModal = (course: any = null) => {
    if (course) {
      setSelectedCourse(course);
      setCourseForm({
        id: course.id,
        title: course.title,
        slug: course.slug,
        short_description: course.short_description || '',
        description: course.description || '',
        category: course.category,
        price: course.price,
        level: course.level,
        thumbnail_url: course.thumbnail_url || ''
      });
    } else {
      setSelectedCourse(null);
      setCourseForm({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        category: '',
        price: 0,
        level: 'Beginner',
        thumbnail_url: ''
      });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading(selectedCourse ? 'Updating course...' : 'Creating course...', { id: 'course-save' });
      
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse.id}`, courseForm);
        toast.success('Course updated successfully', { id: 'course-save' });
      } else {
        await api.post('/courses', courseForm);
        toast.success('Course created successfully', { id: 'course-save' });
      }
      
      setIsCourseModalOpen(false);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed', { id: 'course-save' });
    }
  };

  const togglePublish = async (course: any) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      const loadingToast = toast.loading(`${newStatus === 'published' ? 'Publishing' : 'Unpublishing'} course...`);
      await api.post(`/courses/${course.id}/publish`, { status: newStatus });
      toast.success(`Course ${newStatus}`, { id: loadingToast });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Toggle status failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Nexvera course? This action is irreversible.')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course removed from catalog');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleOpenInstructorModal = async (course: any) => {
    setSelectedCourse(course);
    setIsInstructorModalOpen(true);
    setNewInstructorId('');
    setIsLeadInstructor(false);
  };

  const handleAssignInstructor = async () => {
    if (!newInstructorId) return;
    try {
      toast.loading('Assigning instructor...', { id: 'assign' });
      await api.post(`/courses/${selectedCourse.id}/assign-instructor`, {
        instructor_id: newInstructorId,
        is_lead: isLeadInstructor
      });
      toast.success('Instructor assigned', { id: 'assign' });
      setNewInstructorId('');
      
      // Refresh current course details in state
      const updatedRes: any = await api.get(`/courses/${selectedCourse.slug}`);
      setSelectedCourse(updatedRes.data);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Assignment failed', { id: 'assign' });
    }
  };

  const handleUnassignInstructor = async (instructorId: string) => {
    try {
      toast.loading('Removing instructor...', { id: 'remove' });
      await api.delete(`/courses/${selectedCourse.id}/instructors/${instructorId}`);
      toast.success('Instructor removed', { id: 'remove' });
      
      // Refresh current course details in state
      const updatedRes: any = await api.get(`/courses/${selectedCourse.slug}`);
      setSelectedCourse(updatedRes.data);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Removal failed', { id: 'remove' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Retrieving Catalog Data</p>
      </div>
    );
  }

  return (
    <div className="px-12 pb-24">
      <div className="container mx-auto">
        {/* Header - toned down as layout has main console title */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Global Catalog Ops</span>
            </div>
            <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Assets</span>
            </h1>
          </div>
          
          <button 
            onClick={() => handleOpenCourseModal()}
            className="flex items-center gap-4 px-8 py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group"
          >
             <Plus size={18} className="group-hover:rotate-90 transition-transform" />
             Launch New Course
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {[
             { label: 'Total Assets', value: courses.length, icon: <Layers size={18} /> },
             { label: 'Live Courses', value: courses.filter(c => c.status === 'published').length, icon: <Globe size={18} className="text-green-500" /> },
             { label: 'In Production', value: courses.filter(c => c.status !== 'published').length, icon: <Clock size={18} className="text-orange-500" /> },
             { label: 'Revenue Pool', value: `₹${courses.reduce((acc, c) => acc + c.price, 0).toLocaleString()}`, icon: <Tag size={18} className="text-blue-500" /> },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">{stat.icon}</div>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Status</span>
                </div>
                <p className="text-2xl font-black text-slate-950 tracking-tighter mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all focus-within:border-blue-200">
            <Search className="text-slate-400 mr-4" size={18} />
            <input 
              type="text" 
              placeholder="Query catalog database..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 bg-transparent outline-none text-sm font-bold placeholder:text-slate-300"
            />
          </div>
          <button className="px-8 py-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-blue-200 hover:text-blue-600 transition-all">
             <Filter size={16} /> Advanced Query
          </button>
        </div>

        {/* Course List Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Identity</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Faculty</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Valuation</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                          {course.thumbnail_url ? (
                             <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={20} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{course.title}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{course.category}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{course.level}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => togglePublish(course)}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 ${
                          course.status === 'published' 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                        }`}
                      >
                        {course.status === 'published' ? <Globe size={10} /> : <Lock size={10} />}
                        {course.status === 'published' ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {/* For now just showing a placeholder if lead instructor exists */}
                           {course.teacher_name ? (
                             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm ring-1 ring-slate-100">
                               {course.teacher_name.charAt(0)}
                             </div>
                           ) : (
                             <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center border border-dashed border-slate-200">
                               <User size={12} />
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => handleOpenInstructorModal(course)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                          <UserPlus size={10} /> Manage
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-950 tracking-tighter">₹{course.price.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/admin/enrollments/course/${course.id}`)}
                          className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-white hover:text-cyan-600 hover:shadow-xl hover:shadow-cyan-500/10 transition-all border border-transparent hover:border-slate-100"
                          title="View Enrollments"
                        >
                          <Users size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenCourseModal(course)}
                          className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all border border-transparent hover:border-slate-100"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {courses.length === 0 && (
            <div className="py-32 text-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200"
               >
                  <BookOpen size={40} />
               </motion.div>
               <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">Registry Empty</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No assets detected in the current catalog database.</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Editor Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">
                     {selectedCourse ? 'Update' : 'Launch'} <span className="text-blue-600">Asset</span>
                   </h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Entry: {selectedCourse?.id || 'New Record'}</p>
                </div>
                <button 
                  onClick={() => setIsCourseModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="p-10 overflow-y-auto custom-scrollbar">
                <div className="grid lg:grid-cols-2 gap-10">
                   {/* Primary Data */}
                   <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Title</label>
                        <input 
                          required
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                          placeholder="Introduction to Algorithmic Trading..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Slug (Unique Identifier)</label>
                        <div className="relative">
                          <input 
                            required
                            value={courseForm.slug}
                            onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                            placeholder="algo-trading-basics"
                          />
                          <Globe size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                          <input 
                            required
                            value={courseForm.category}
                            onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                            placeholder="Trading"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Difficulty Level</label>
                          <select 
                            value={courseForm.level}
                            onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm appearance-none"
                          >
                             <option value="Beginner">Beginner</option>
                             <option value="Intermediate">Intermediate</option>
                             <option value="Advanced">Advanced</option>
                             <option value="Expert">Expert</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Valuation (INR)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            required
                            value={courseForm.price}
                            onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) })}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm pl-12"
                          />
                          <IndianRupee size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                        </div>
                      </div>
                   </div>

                   {/* Secondary Data */}
                   <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Short Description (Marketing)</label>
                        <textarea 
                          required
                          value={courseForm.short_description}
                          onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm min-h-[100px] resize-none"
                          placeholder="Concise overview for catalog displays..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detailed Curriculum Description</label>
                        <textarea 
                          required
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm min-h-[160px] resize-none"
                          placeholder="Comprehensive course breakdown..."
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Thumbnail URL</label>
                        <input 
                          value={courseForm.thumbnail_url}
                          onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                          placeholder="https://images.nexvera.com/..."
                        />
                      </div>
                   </div>
                </div>

                <div className="mt-12 flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
                   <button 
                     type="button"
                     onClick={() => setIsCourseModalOpen(false)}
                     className="px-10 py-5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                   >
                     Cancel Operation
                   </button>
                   <button 
                     type="submit"
                     className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                   >
                     {selectedCourse ? 'Update Registry' : 'Confirm Launch'}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Instructor Management Modal */}
      <AnimatePresence>
        {isInstructorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInstructorModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">
                     Manage <span className="text-cyan-500">Faculty</span>
                   </h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asset: {selectedCourse?.title}</p>
                </div>
                <button 
                  onClick={() => setIsInstructorModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10">
                 {/* Assignment Form */}
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                       <UserPlus size={14} className="text-blue-600" /> New Assignment
                    </h4>
                    <div className="flex flex-col gap-6">
                       <div className="relative">
                          <input 
                            value={newInstructorId}
                            onChange={(e) => setNewInstructorId(e.target.value)}
                            className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                            placeholder="Instructor ID (UUID)"
                          />
                          <Search size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       </div>
                       <div className="flex items-center justify-between px-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div 
                               onClick={() => setIsLeadInstructor(!isLeadInstructor)}
                               className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                 isLeadInstructor ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                               }`}
                             >
                                {isLeadInstructor && <CheckCircle size={14} className="text-white" />}
                             </div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Assign as Lead Instructor</span>
                          </label>
                          <button 
                            onClick={handleAssignInstructor}
                            disabled={!newInstructorId}
                            className="px-8 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-30"
                          >
                            Execute
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Current Instructors List */}
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 px-2">
                       <User size={14} className="text-cyan-500" /> Active Personnel
                    </h4>
                    <div className="space-y-4">
                       {/* The current implementation only shows the teacher_name from the course details 
                           This is a limitation of the current GET /courses return format. 
                           In a real app, we'd iterate over an array of instructors if returned. 
                           For now, we display based on course.teacher_name for visualization. */}
                       {selectedCourse?.teacher_name ? (
                          <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl group hover:border-slate-200 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                   {selectedCourse.teacher_name.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedCourse.teacher_name}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-black text-blue-600 border border-blue-100 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest">Lead Instructor</span>
                                   </div>
                                </div>
                             </div>
                             {/* Note: we don't have the instructor_id in the basic course list, 
                                 so unassign is disabled in this mockup unless we fetch it from elsewhere */}
                             <button 
                               onClick={() => toast.error('Instructor ID required for removal')}
                               className="p-3 rounded-xl bg-slate-50 text-slate-300 hover:text-red-600 transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       ) : (
                          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No faculty assigned to this asset</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoursesDashboard;
