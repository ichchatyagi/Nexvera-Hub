"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  ChevronLeft, 
  List, 
  CheckCircle2, 
  Loader2, 
  History,
  Volume2,
  BookOpen
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (lessonId) fetchLessonData();
    if (courseId) fetchCurriculum();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setIsLoading(true);
      const lessonRes = await api.get(`/lessons/${lessonId}`);
      const lesson = lessonRes.data;

      if (lesson.video_id) {
        const playbackRes = await api.get(`/videos/${lesson.video_id}/playback`);
        setPlaybackData({ ...lesson, ...playbackRes.data });
      } else {
        setPlaybackData(lesson);
      }
    } catch (error) {
      toast.error('Failed to load lesson content');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurriculum = async () => {
    try {
      const curriculumRes = await api.get(`/courses/${courseId}/curriculum`);
      setCurriculum(curriculumRes.data || []);
    } catch (error) {
      console.error('Failed to fetch curriculum for sidebar', error);
    }
  };

  useEffect(() => {
    if (playbackData?.manifest_url && videoRef.current) {
      const video = videoRef.current;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(playbackData.manifest_url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackData.manifest_url;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
        };
      }
    }
  }, [playbackData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
        <p className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">Decrypting learning session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pt-20">
      <div className="h-14 shrink-0 px-6 border-b border-white/5 flex items-center justify-between text-white/50 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/courses/${courseId}`)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Currently Streaming</span>
            <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[400px]">
              {playbackData?.title || 'Learning Module'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-xs font-bold">
             <History size={16} />
             <span>Progress Saved</span>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSidebarOpen ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}
           >
             <List size={20} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex flex-col bg-black">
          <div className="flex-1 flex items-center justify-center relative group">
             {playbackData?.video_id ? (
               <video 
                 ref={videoRef} 
                 className="w-full h-full object-contain"
                 controls 
                 playsInline
               />
             ) : (
               <div className="text-center p-20 max-w-2xl bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl">
                  <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                     <BookOpen size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Text-Based Learning</h2>
                  <p className="text-white/60 text-lg leading-relaxed mb-10 font-medium">
                     {playbackData?.content || "This lesson contains study materials and notes for your review. No video playback is available for this specific module."}
                  </p>
                  <button className="px-12 py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-blue-500/10">
                     Mark Module Complete
                  </button>
               </div>
             )}
          </div>
          
          <div className="p-10 text-white border-t border-white/5 bg-slate-950">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                 <h1 className="text-3xl font-black uppercase tracking-tighter">{playbackData?.title}</h1>
                 <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs uppercase tracking-widest transition-all">
                    <CheckCircle2 size={16} className="text-green-400" />
                    Completed
                 </button>
              </div>
              <p className="text-white/60 text-lg font-medium leading-relaxed max-w-3xl">
                {playbackData?.description || "Master these concepts as we dive deeper into our curriculum."}
              </p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={false}
          animate={{ width: isSidebarOpen ? 400 : 0 }}
          className="shrink-0 bg-slate-900 border-l border-white/5 overflow-y-auto"
        >
          <div className="min-w-[400px] p-6">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 border-b border-white/5 pb-4">
               Course Logistics
            </h3>
            
            <div className="space-y-4">
              {curriculum.map((section: any) => (
                <div key={section.id} className="space-y-2">
                   <h4 className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/80 uppercase tracking-[0.2em] border border-white/10">
                      {section.title}
                   </h4>
                   <div className="space-y-1">
                      {section.lessons.map((lesson: any) => (
                         <button
                           key={lesson.id}
                           onClick={() => router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
                           className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group overflow-hidden relative ${
                             lesson.id === lessonId 
                             ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                             : 'text-white/40 hover:bg-white/5 hover:text-white'
                           }`}
                         >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              lesson.id === lessonId ? 'bg-white/20' : 'bg-white/5 text-white/20'
                            }`}>
                               {lesson.id === lessonId ? <Play size={12} fill="currentColor" /> : <Play size={12} />}
                            </div>
                            <div className="flex flex-col items-start truncate overflow-hidden">
                               <span className="text-[11px] font-bold uppercase tracking-tight truncate w-full text-left">
                                 {lesson.title}
                               </span>
                               <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                                 lesson.id === lessonId ? 'text-white/60' : 'text-white/20'
                               }`}>
                                 {lesson.duration}m
                               </span>
                            </div>
                         </button>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LessonPlayer;
