"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  Sparkles
} from 'lucide-react';
import StudentAssistantPanel from '@/components/StudentAssistantPanel';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { lessonsService } from '@/services/lessons.service';
import { videosService } from '@/services/videos.service';
import { coursesService } from '@/services/courses.service';
import { enrollmentsService } from '@/services/enrollments.service';


const LessonPlayer = () => {
  const { slug, lessonId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (lessonId) fetchLessonData();
    if (slug) fetchCurriculumAndProgress();
  }, [lessonId, slug]);

  useEffect(() => {
    if (enrollment && lessonId) {
      enrollmentsService.updateProgress(enrollment.course_id, {
        current_lesson: lessonId as string
      }).catch(err => console.error("Failed to update current lesson", err));
    }
  }, [enrollment, lessonId]);

  const fetchLessonData = async () => {
    try {
      setIsLoading(true);
      const lesson = await lessonsService.getLesson(lessonId as string);

      if (lesson.content?.video_id) {
        const playbackResponse = await videosService.getPlaybackData(lesson.content.video_id);
        
        if (playbackResponse.success) {
          // Both are plain objects now
          setPlaybackData({ ...lesson, ...playbackResponse.data });
        } else if (playbackResponse.error?.code === 'VIDEO_NOT_READY') {
          setPlaybackData({ ...lesson, videoStatus: playbackResponse.error.status || 'processing' });
          toast('This video is still processing and will be available shortly.', { icon: '⏳' });
        } else {
          setPlaybackData(lesson);
          toast.error(playbackResponse.error?.message || 'Failed to initialize video playback');
        }
      } else {
        setPlaybackData(lesson);
      }
    } catch (error: any) {
      console.error("Failed to load lesson content", error);
      const isForbidden = error.response?.status === 403 || error.response?.status === 401;
      toast.error(isForbidden ? 'Enrollment required for this lesson' : 'Failed to load lesson content');
      if (isForbidden) {
        router.push(`/courses/${slug}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurriculumAndProgress = async () => {
    try {
      const curriculumData = await coursesService.getCurriculum(slug as string);
      setCurriculum(curriculumData || []);

      const course = await coursesService.getCourse(slug as string);
      
      // Only fetch progress if authenticated and possibly enrolled
      try {
        const enr = await enrollmentsService.getProgress(course._id || course.id);
        setEnrollment(enr);
        setCompletedLessons(enr.progress?.completed_lessons || []);
      } catch (e) {
        // Not enrolled or not logged in, ignore progress silently
        setEnrollment(null);
        setCompletedLessons([]);
      }
    } catch (error) {
      console.error('Failed to fetch curriculum', error);
    }
  };

  const findNextLesson = () => {
    if (!curriculum.length) return null;
    
    let currentLessonFound = false;
    for (const section of curriculum) {
      for (const lesson of section.lessons) {
        if (currentLessonFound) return lesson;
        if (lesson.lesson_id === lessonId) currentLessonFound = true;
      }
    }
    return null;
  };

  const handleMarkComplete = async () => {
    if (!enrollment) return;
    
    try {
      const isAlreadyComplete = completedLessons.includes(lessonId as string);
      const newCompleted = isAlreadyComplete 
        ? completedLessons 
        : [...completedLessons, lessonId as string];
      
      // Calculate new percentage
      const totalLessons = curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
      const percentage = Math.round((newCompleted.length / totalLessons) * 100);

      const nextLesson = findNextLesson();

      await enrollmentsService.updateProgress(enrollment.course_id, {
        completed_lessons: [lessonId as string], // Backend merges them
        percentage: percentage,
        current_lesson: nextLesson?.lesson_id || lessonId as string
      });

      setCompletedLessons(newCompleted);
      toast.success('Progress saved!');

      if (nextLesson) {
        router.push(`/courses/${slug}/lessons/${nextLesson.lesson_id}`);
      }
    } catch (error) {
      toast.error('Failed to save progress');
      console.error(error);
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
           {enrollment && (
             <div className="flex items-center gap-2 text-xs font-bold">
               <History size={16} />
               <span>Progress Saved</span>
             </div>
           )}
           
           <button 
             onClick={() => setIsAiOpen(true)}
             className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl border border-blue-600/20 hover:bg-blue-600/30 transition-all group"
           >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ask AI</span>
           </button>

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
               playbackData.videoStatus ? (
                <div className="flex flex-col items-center justify-center text-center p-20 bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/10">
                  <div className="relative mb-8">
                    <Loader2 className="animate-spin text-blue-500" size={64} />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Play size={20} className="text-white/20 translate-x-0.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Processing Module</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] max-w-[300px] leading-relaxed">
                    Our servers are currently optimizing this content for your playback device. Status: {playbackData.videoStatus}
                  </p>
                </div>
               ) : (
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-contain"
                  controls 
                  playsInline
                />
               )
             ) : (
               <div className="text-center p-20 max-w-2xl bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl">
                  <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                     <BookOpen size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Text-Based Learning</h2>
                  <p className="text-white/60 text-lg leading-relaxed mb-10 font-medium">
                     {playbackData?.content || "This lesson contains study materials and notes for your review. No video playback is available for this specific module."}
                  </p>
                  <button 
                    onClick={handleMarkComplete}
                    disabled={!enrollment}
                    className={`px-12 py-5 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 shadow-2xl shadow-blue-500/10 ${
                      !enrollment ? 'bg-slate-800 text-white/20 cursor-not-allowed' : 'bg-white text-slate-950 hover:bg-blue-50'
                    }`}
                  >
                     {!enrollment ? 'Enroll to track progress' : (completedLessons.includes(lessonId as string) ? 'Module Completed' : 'Mark Module Complete')}
                  </button>
               </div>
             )}
          </div>
          
          <div className="p-10 text-white border-t border-white/5 bg-slate-950">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                 <h1 className="text-3xl font-black uppercase tracking-tighter">{playbackData?.title}</h1>
                  <button 
                    onClick={handleMarkComplete}
                    disabled={!enrollment}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 font-bold text-xs uppercase tracking-widest transition-all ${
                      !enrollment 
                      ? 'bg-white/5 text-white/10 cursor-not-allowed'
                      : (completedLessons.includes(lessonId as string) 
                         ? 'bg-blue-600/20 text-blue-400' 
                         : 'bg-white/5 hover:bg-white/10 text-white/60')
                    }`}
                  >
                     <CheckCircle2 size={16} className={completedLessons.includes(lessonId as string) ? "text-blue-400" : "text-white/20"} />
                     {completedLessons.includes(lessonId as string) ? 'Completed' : 'Mark Complete'}
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
                <div key={section.section_id} className="space-y-2">
                   <h4 className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/80 uppercase tracking-[0.2em] border border-white/10">
                      {section.title}
                   </h4>
                   <div className="space-y-1">
                      {section.lessons.map((lesson: any) => {
                         const isCompleted = completedLessons.includes(lesson.lesson_id);
                         const isActive = lesson.lesson_id === lessonId;

                         return (
                           <button
                             key={lesson.lesson_id}
                             onClick={() => router.push(`/courses/${slug}/lessons/${lesson.lesson_id}`)}
                             className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group overflow-hidden relative ${
                               isActive 
                               ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                               : 'text-white/40 hover:bg-white/5 hover:text-white'
                             }`}
                           >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive ? 'bg-white/20' : (isCompleted ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/20')
                              }`}>
                                 {isActive ? <Play size={12} fill="currentColor" /> : (isCompleted ? <CheckCircle2 size={12} /> : <Play size={12} />)}
                              </div>
                              <div className="flex flex-col items-start truncate overflow-hidden">
                                 <span className={`text-[11px] font-bold uppercase tracking-tight truncate w-full text-left ${isActive ? 'text-white' : (isCompleted ? 'text-white/80' : 'text-white/40')}`}>
                                   {lesson.title}
                                 </span>
                                 <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                                   isActive ? 'text-white/60' : 'text-white/20'
                                 }`}>
                                   {lesson.duration_minutes}m
                                 </span>
                              </div>
                              {isCompleted && !isActive && (
                                <div className="absolute right-4">
                                   <CheckCircle2 size={12} className="text-blue-500" />
                                </div>
                              )}
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

      <StudentAssistantPanel 
        courseIdOrSlug={slug as string}
        lessonId={lessonId as string}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </div>
  );
};

export default LessonPlayer;
