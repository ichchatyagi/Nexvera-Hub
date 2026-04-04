"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus, 
  BookOpen, 
  Loader2,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AdminCoursesDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Unauthorized access');
      router.push('/dashboard');
      return;
    }
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get('/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block">Catalog Management</span>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tighter">
              Nexvera <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Catalog</span>
            </h1>
          </div>
          
          <button 
            onClick={() => toast.success('Course creation wizard coming soon')}
            className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group"
          >
             <Plus size={18} className="group-hover:rotate-90 transition-transform" />
             Create New Course
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center px-6 bg-slate-50 rounded-2xl border border-slate-100">
            <Search className="text-slate-400 mr-4" size={18} />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 bg-transparent outline-none text-sm font-bold placeholder:text-slate-300"
            />
          </div>
          <button className="px-8 py-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-blue-200 hover:text-blue-600 transition-all">
             <Filter size={16} /> Filters
          </button>
        </div>

        {/* Course List Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Course Detail</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Instructor</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-0.5">{course.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.category} • {course.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                        course.status === 'published' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {course.status === 'published' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {course.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {course.teacher_name ? (
                          <>
                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-black">
                               {course.teacher_name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{course.teacher_name}</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">Unassigned</span>
                        )}
                        <button 
                          onClick={() => toast.success('Instructor assignment tool coming soon')}
                          className="ml-2 p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <UserPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-950">₹{course.price.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
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
            <div className="py-24 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <BookOpen size={30} />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No courses in catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesDashboard;
