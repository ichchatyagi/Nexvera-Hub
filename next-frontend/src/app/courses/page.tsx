"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, Star, Users, ChevronRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  teacher_name: string;
  price: number;
  rating: number;
  review_count: number;
  level: string;
  category: string;
  thumbnail_url: string;
}

const CourseCatalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Data Science'];

  useEffect(() => {
    fetchCourses();
  }, [activeCategory]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchTerm) params.search = searchTerm;
      
      const response: any = await api.get('/courses', { params });
      
      const rawCourses = response || [];
      const mappedCourses = rawCourses.map((c: any) => ({
        id: c._id || c.id,
        slug: c.slug,
        title: c.title,
        description: c.description || '',
        teacher_name: c.teacher_name || 'Expert Instructor',
        price: c.pricing?.price || 0,
        rating: c.stats?.average_rating || 0,
        review_count: c.stats?.total_reviews || 0,
        level: c.level || 'All Levels',
        category: c.category?.main || c.category || 'Development',
        thumbnail_url: c.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
      }));

      setCourses(mappedCourses);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 block"
          >
            Discovery Hub
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter mb-8"
          >
            Master New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Skills</span>
          </motion.h1>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.2 }}
             className="max-w-2xl mx-auto"
          >
             <form onSubmit={handleSearch} className="flex p-2 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 mb-10">
               <div className="flex-1 flex items-center px-6">
                 <Search className="text-slate-400 mr-4" size={20} />
                 <input
                   type="text"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search for courses, teachers, or topics..."
                   className="w-full py-4 bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300"
                 />
               </div>
               <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95">
                 Explore
               </button>
             </form>

             <div className="flex flex-wrap items-center justify-center gap-3">
               {categories.map((cat) => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      activeCategory === cat 
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xl' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </motion.div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Calibrating course data...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {courses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group"
                >
                   <Link href={`/courses/${course.slug}`}>
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white/20">
                           <BookOpen size={64} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-slate-900 text-[9px] font-black uppercase tracking-widest border border-white">
                          {course.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center text-orange-400 gap-0.5">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-black text-slate-900 ml-1">{course.rating || 'New'}</span>
                      </div>
                      <span className="text-slate-300 mx-1">•</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{course.review_count} Reviews</span>
                    </div>

                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 font-medium leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tuition Fee</p>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tighter">
                          ₹{course.price.toLocaleString()}
                        </p>
                      </div>
                      <Link 
                        href={`/courses/${course.slug}`}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all group-hover:translate-x-1"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-[3rem] border border-slate-100">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
               <Search size={32} />
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">No courses found</h3>
             <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
             <button 
               onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
               className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
             >
               Clear all filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
