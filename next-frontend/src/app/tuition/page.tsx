"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Star, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function TuitionClasses() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/tuition/classes');
      setClasses(res.data || []);
    } catch (err) {
      console.error('Failed to load tuition classes', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Section */}
      <section className="bg-slate-950 text-white pt-28 pb-32">
        <div className="container mx-auto px-6 lg:px-12 text-center max-w-4xl relative z-10">
          <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter uppercase">Academic Excellence</h1>
          <p className="text-lg text-white/60 mb-8 font-medium">Comprehensive tuition classes integrating robust curriculum mapped cleanly for Classes 5-12 securing fundamental academic strength.</p>
        </div>
      </section>

      {/* Grid View */}
      <section className="container mx-auto px-6 lg:px-12 -mt-16 relative z-20">
        {classes.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-lg">
             <h2 className="text-2xl font-black text-slate-800 uppercase">No Classes Found</h2>
             <p className="text-slate-500 mt-2">Check back later for newly published tuitions.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls: any) => (
               <Link href={`/tuition/${cls.slug}`} key={cls._id} className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 hover:-translate-y-2 transition-all block group border border-slate-100 flex flex-col h-full">
                  <div className="h-48 rounded-2xl bg-slate-100 mb-6 relative overflow-hidden flex items-center justify-center shrink-0">
                     {cls.thumbnail_url ? (
                       <Image src={cls.thumbnail_url} alt={cls.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                       <BookOpen className="text-slate-300" size={48} />
                     )}
                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
                       {cls.tuition_meta?.subjects?.length || 0} Subjects
                     </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Class {cls.tuition_meta?.class_level}</span>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Star fill="currentColor" size={14} />
                        <span className="text-xs font-black text-slate-700">{cls.stats?.average_rating || '5.0'}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight line-clamp-2">{cls.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-2 flex-1">{cls.short_description}</p>
                    
                    <div className="flex flex-col gap-2 mb-6">
                      {(cls.tuition_meta?.boards_supported || []).slice(0,2).map((board: string, i: number) => (
                         <div key={i} className="flex items-center gap-2 text-slate-600 text-[11px] font-bold uppercase tracking-widest">
                           <CheckCircle2 size={14} className="text-green-500" /> {board}
                         </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Pricing</span>
                        <div className="flex items-end gap-1">
                          <span className="text-lg font-black text-slate-900">
                            ₹{cls.tuition_meta?.pricing?.monthly_price?.toLocaleString() || cls.tuition_meta?.pricing?.bundle_price?.toLocaleString() || 0}
                          </span>
                          <span className="text-xs font-bold text-slate-400 pb-1">{cls.tuition_meta?.pricing?.monthly_enabled ? '/ mo' : ''}</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
                        <ArrowRight size={18} className="text-blue-600 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
               </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
