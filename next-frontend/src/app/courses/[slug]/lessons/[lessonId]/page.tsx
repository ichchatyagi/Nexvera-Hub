"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Simple throttle implementation to avoid lodash dependency
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const LessonPlayer = () => {
  const { slug, lessonId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const router = useRouter();

  const fetchFullData = async () => {
    try {
      setIsLoading(true);
      // 1. Get Course to get MongoDB course_id
      const courseRes: any = await api.get(`/courses/${slug}`);
      const courseId = courseRes?._id || courseRes?.id;
      
      if (!courseId) throw new Error("Course not found");

      // 2. Get Curriculum to find lesson info
      const curriculumRes: any = await api.get(`/courses/${courseId}/curriculum`);
      const sections = curriculumRes || [];
      setCurriculum(sections);
      
      const allLessons = sections.flatMap((s: any) => s.lessons);
      const lesson = allLessons.find((l: any) => (l.lesson_id || l.id) === lessonId);
      
      if (!lesson) {
        toast.error('Lesson not found in this course');
        return;
      }

      // 3. Get Enrollment / Progress
      const enrollmentRes: any = await api.get(`/enrollments/course/${courseId}/progress`);
      setEnrollment(enrollmentRes);

      // 4. Get Video Playback if applicable
      const videoId = lesson.content?.video_id;
      if (videoId) {
        const playbackRes: any = await api.get(`/videos/${videoId}/playback`);
        setPlaybackData({ 
          ...lesson, 
          ...playbackRes, 
          course_id: courseId, 
          video_id: videoId,
          total_lessons: allLessons.length
        });
      } else {
        setPlaybackData({ 
          ...lesson, 
          course_id: courseId,
          total_lessons: allLessons.length
        });
      }
    } catch (error) {
      toast.error('Failed to load lesson content');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId && slug) fetchFullData();
  }, [lessonId, slug]);

  const updateProgress = useCallback(
    throttle(async (data: { lastPositionSeconds?: number; completed?: boolean }) => {
      if (!playbackData?.course_id) return;
      
      try {
        const completedLessons = [...(enrollment?.progress?.completed_lessons || [])];
        if (data.completed && !completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
        }

        const percentage = Math.round((completedLessons.length / (playbackData.total_lessons || 1)) * 100);

        await api.put(`/enrollments/course/${playbackData.course_id}/progress`, {
          currentLessonId: lessonId,
          percentage,
          completedLessons,
          lastPositionSeconds: data.lastPositionSeconds,
          videoId: playbackData.video_id
        });
      } catch (err) {
        console.error('Failed to sync progress', err);
      }
    }, 5000), 
    [playbackData, lessonId, enrollment]
  );

  const handleMarkComplete = async () => {
    if (isMarkingComplete) return;
    try {
      setIsMarkingComplete(true);
      await updateProgress({ completed: true });
      toast.success('Module marked as complete!');
      setEnrollment((prev: any) => {
        const completed = [...(prev?.progress?.completed_lessons || [])];
        if (!completed.includes(lessonId)) completed.push(lessonId);
        return { ...prev, progress: { ...prev?.progress, completed_lessons: completed } };
      });
    } catch (err) {
      toast.error('Failed to update progress');
    } finally {
      setIsMarkingComplete(false);
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
          const historyItem = enrollment?.watch_history?.find((h: any) => h.lesson_id === lessonId);
          if (historyItem?.last_position_seconds) {
            video.currentTime = historyItem.last_position_seconds;
          }
          video.play().catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackData.manifest_url;
        video.onloadedmetadata = () => {
          const historyItem = enrollment?.watch_history?.find((h: any) => h.lesson_id === lessonId);
          if (historyItem?.last_position_seconds) {
            video.currentTime = historyItem.last_position_seconds;
          }
          video.play().catch(() => {});
        };
      }

      const onTimeUpdate = () => {
        updateProgress({ lastPositionSeconds: video.currentTime });
      };

      const onEnded = () => {
        updateProgress({ completed: true, lastPositionSeconds: video.currentTime });
      };

      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('ended', onEnded);

      return () => {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('ended', onEnded);
      };
    }
  }, [playbackData, enrollment, lessonId, updateProgress]);

  const isLessonCompleted = (id: string) => {
    return enrollment?.progress?.completed_lessons?.includes(id);
  };

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
            onClick={() => router.push(`/courses/${slug}`)}
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
        <div className="flex-1 relative flex flex-col bg-black overflow-y-auto">
          <div className="flex-1 flex items-center justify-center relative group bg-[#000]">
             {playbackData?.video_id ? (
               <video 
                 ref={videoRef} 
                 className="w-full h-full object-contain"
                 controls 
                 playsInline
               />
             ) : (
               <div className="text-center p-20 max-w-2xl bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl m-8">
                  <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                     <BookOpen size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Text-Based Learning</h2>
                  <p className="text-white/60 text-lg leading-relaxed mb-10 font-medium">
                     {playbackData?.content || "This lesson contains study materials and notes for your review. No video playback is available for this specific module."}
                  </p>
                  <button 
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete || isLessonCompleted(lessonId as string)}
                    className={`px-12 py-5 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 shadow-2xl shadow-blue-500/10 ${
                      isLessonCompleted(lessonId as string) 
                      ? 'bg-green-600/10 text-green-500 border border-green-600/20' 
                      : 'bg-white text-slate-950 hover:bg-blue-50'
                    }`}
                  >
                     {isMarkingComplete ? 'Updating...' : isLessonCompleted(lessonId as string) ? 'Completed' : 'Mark Module Complete'}
                  </button>
               </div>
             )}
          </div>
          
          <div className="p-10 text-white border-t border-white/5 bg-slate-950">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                 <h1 className="text-3xl font-black uppercase tracking-tighter">{playbackData?.title}</h1>
                 {isLessonCompleted(lessonId as string) && (
                   <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600/10 border border-green-600/20 font-bold text-xs uppercase tracking-widest transition-all text-green-500">
                      <CheckCircle2 size={16} />
                      Completed
                   </div>
                 )}
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
               Course Curriculum
            </h3>
            
            <div className="space-y-4">
              {curriculum.map((section: any) => (
                <div key={section.section_id || section.title} className="space-y-2">
                   <h4 className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/80 uppercase tracking-[0.2em] border border-white/10">
                      {section.title}
                   </h4>
                   <div className="space-y-1">
                      {section.lessons.map((lesson: any) => {
                        const lId = lesson.lesson_id || lesson.id;
                        const active = lId === lessonId;
                        const completed = isLessonCompleted(lId);
                        
                        return (
                          <button
                            key={lId}
                            onClick={() => router.push(`/courses/${slug}/lessons/${lId}`)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group overflow-hidden relative ${
                              active 
                              ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                              : 'text-white/40 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                               active ? 'bg-white/20' : completed ? 'bg-green-600/20 text-green-500' : 'bg-white/5 text-white/20'
                             }`}>
                                {active ? <Play size={12} fill="currentColor" /> : completed ? <CheckCircle2 size={12} /> : <Play size={12} />}
                             </div>
                             <div className="flex flex-col items-start truncate overflow-hidden">
                                <span className="text-[11px] font-bold uppercase tracking-tight truncate w-full text-left">
                                  {lesson.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                                    active ? 'text-white/60' : 'text-white/20'
                                  }`}>
                                    {lesson.duration_minutes || lesson.duration || 0}m
                                  </span>
                                  {completed && !active && (
                                    <span className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-green-500/60">
                                      • Finished
                                    </span>
                                  )}
                                </div>
                             </div>
                          </button>
                        );
                      })}
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
