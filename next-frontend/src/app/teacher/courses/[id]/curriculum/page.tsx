"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Play, 
  FileText, 
  HelpCircle,
  Clock,
  Eye,
  Lock,
  Loader2,
  X,
  BookOpen,
  Layout,
  Layers,
  ArrowLeft,
  Shield,
  Video
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz';
  duration: number;
  is_preview: boolean;
  content?: string;
  video_id?: string;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

const CurriculumEditor = () => {
  const { id } = useParams();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  // Forms state
  const [sectionForm, setSectionForm] = useState({ title: '', order: 0 });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video' as 'video' | 'article' | 'quiz',
    duration: 0,
    is_preview: false,
    content: '',
    video_id: ''
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'teacher' && user.role !== 'admin') {
        toast.error('Unauthorized access');
        router.push('/dashboard');
      } else {
        fetchCourseAndCurriculum();
      }
    }
  }, [id, user, isLoadingAuth]);

  const fetchCourseAndCurriculum = async () => {
    try {
      setIsLoading(true);
      const response: any = await api.get(`/teacher/courses/${id}`);
      setCourse(response.data);
      setCurriculum(response.data.curriculum || []);
      if (response.data.curriculum?.length > 0 && !activeSectionId) {
        setActiveSectionId(response.data.curriculum[0].id);
      }
    } catch (error) {
      toast.error('Failed to load curriculum');
    } finally {
      setIsLoading(false);
    }
  };

  // Section Handlers
  const handleOpenSectionModal = (section: any = null) => {
    if (section) {
      setSelectedSection(section);
      setSectionForm({ title: section.title, order: section.order });
    } else {
      setSelectedSection(null);
      setSectionForm({ title: '', order: curriculum.length + 1 });
    }
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading('Synchronizing registry...', { id: 'section' });
      if (selectedSection) {
        await api.put(`/teacher/courses/${id}/sections/${selectedSection.id}`, sectionForm);
        toast.success('Section updated', { id: 'section' });
      } else {
        await api.post(`/teacher/courses/${id}/sections`, sectionForm);
        toast.success('Section created', { id: 'section' });
      }
      setIsSectionModalOpen(false);
      fetchCourseAndCurriculum();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Sync failed', { id: 'section' });
    }
  };

  // Lesson Handlers
  const handleOpenLessonModal = (sectionId: string, lesson: any = null) => {
    setSelectedSection({ id: sectionId }); // Store which section this lesson belongs to
    if (lesson) {
      setSelectedLesson(lesson);
      setLessonForm({
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        is_preview: lesson.is_preview,
        content: lesson.content || '',
        video_id: lesson.video_id || ''
      });
    } else {
      setSelectedLesson(null);
      setLessonForm({
        title: '',
        type: 'video',
        duration: 0,
        is_preview: false,
        content: '',
        video_id: ''
      });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading('Processing content...', { id: 'lesson' });
      if (selectedLesson) {
        await api.put(`/teacher/courses/${id}/sections/${selectedSection.id}/lessons/${selectedLesson.id}`, lessonForm);
        toast.success('Lesson updated', { id: 'lesson' });
      } else {
        await api.post(`/teacher/courses/${id}/sections/${selectedSection.id}/lessons`, lessonForm);
        toast.success('Lesson created', { id: 'lesson' });
      }
      setIsLessonModalOpen(false);
      fetchCourseAndCurriculum();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Processing failed', { id: 'lesson' });
    }
  };

  if (isLoading || isLoadingAuth) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Pedagogy Engine</p>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header Navigation */}
        <div className="mb-16 flex items-center justify-between">
           <Link 
             href="/teacher/courses" 
             className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors group"
           >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                 <ArrowLeft size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Dash Overview</span>
           </Link>

           <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                course?.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
                {course?.status}
              </span>
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Nexvera Authority Certified</span>
                 <div className="flex items-center gap-2 text-blue-600">
                    <Shield size={12} />
                    <span className="text-xs font-black uppercase tracking-tight">Faculty Faculty</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Course Identity */}
        <div className="mb-20">
          <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase tracking-tighter mb-4 leading-none">
            Curriculum <span className="text-blue-600">Forge</span>
          </h1>
          <div className="flex items-center gap-4">
             <div className="h-0.5 w-12 bg-blue-600" />
             <p className="text-xl text-slate-400 font-medium uppercase tracking-tight">{course?.title}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Workspace */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-0 flex items-center gap-3">
                  <Layout size={14} className="text-blue-600" /> Content Registry
               </h3>
               <button 
                 onClick={() => handleOpenSectionModal()}
                 className="flex items-center gap-3 px-6 py-3 bg-slate-950 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-2xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group"
               >
                  <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                  Define Section
               </button>
            </div>

            <div className="space-y-6">
               {curriculum.map((section, idx) => (
                 <div key={section.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm group">
                    <div 
                      className="p-8 flex items-center justify-between cursor-pointer group-hover:bg-slate-50/50 transition-colors"
                      onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100/50 shadow-inner">
                             {idx + 1}
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-slate-950 uppercase tracking-tighter">{section.title}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {section.lessons.length} Learning Assets • {section.lessons.reduce((acc, l) => acc + l.duration, 0)} Min
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenSectionModal(section); }}
                            className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Edit size={14} />
                          </button>
                          <ChevronDown size={20} className={`text-slate-300 transition-transform ${activeSectionId === section.id ? 'rotate-180' : ''}`} />
                       </div>
                    </div>

                    <AnimatePresence>
                       {activeSectionId === section.id && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="border-t border-slate-50"
                         >
                            <div className="p-4 space-y-2">
                               {section.lessons.map((lesson, lIdx) => (
                                 <div key={lesson.id} className="bg-slate-50/50 rounded-2xl p-6 flex items-center justify-between border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all group/lesson">
                                    <div className="flex items-center gap-5">
                                       <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                                          {lesson.type === 'video' ? <Video size={14} /> : lesson.type === 'quiz' ? <HelpCircle size={14} /> : <FileText size={14} />}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{lesson.title}</p>
                                          <div className="flex items-center gap-3 mt-1">
                                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={10} /> {lesson.duration}m
                                             </span>
                                             {lesson.is_preview && (
                                               <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-green-100">Public Preview</span>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <button 
                                         onClick={() => handleOpenLessonModal(section.id, lesson)}
                                         className="p-2.5 rounded-xl bg-white text-slate-300 hover:text-blue-600 shadow-sm opacity-0 group-hover/lesson:opacity-100 transition-all border border-slate-100"
                                       >
                                          <Edit size={14} />
                                       </button>
                                       <button className="p-2.5 rounded-xl bg-white text-slate-300 hover:text-red-600 shadow-sm opacity-0 group-hover/lesson:opacity-100 transition-all border border-slate-100">
                                          <Trash2 size={14} />
                                       </button>
                                    </div>
                                 </div>
                               ))}

                               <button 
                                 onClick={() => handleOpenLessonModal(section.id)}
                                 className="w-full py-5 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all flex items-center justify-center gap-3 mt-4"
                               >
                                  <Plus size={14} /> Create Learning Asset
                               </button>
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
               ))}

               {curriculum.length === 0 && (
                  <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white">
                     <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-200"
                     >
                        <Layers size={40} />
                     </motion.div>
                     <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-2">No Content Identified</h3>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Start by defining your first course section.</p>
                  </div>
               )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4">
             <div className="space-y-8 sticky top-24">
                <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl pointer-events-none" />
                   <BookOpen size={24} className="text-blue-500 mb-8" />
                   <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-none">Nexvera Hub <br/><span className="text-blue-600 text-3xl">Pedagody</span></h4>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                     You are managing curriculum for a Nexvera-certified asset. All content must adhere to academic standards of excellence.
                   </p>
                   <ul className="space-y-4">
                      {[
                        { label: 'Learners can see previews', icon: <Eye size={12} className="text-green-500" /> },
                        { label: 'Video assets must be hosted', icon: <Video size={12} className="text-blue-500" /> },
                        { label: 'Quiz modules coming soon', icon: <Lock size={12} className="text-slate-600" /> },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-200">
                           {item.icon} {item.label}
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-50 pb-4">Asset Statistics</h5>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enrollments</span>
                         <span className="text-sm font-black text-slate-950 tracking-tighter">842 Academics</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completion</span>
                         <span className="text-sm font-black text-slate-950 tracking-tighter">24.8% Rate</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Modified</span>
                         <span className="text-sm font-black text-slate-950 tracking-tighter">2 Hours Ago</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Section Modal */}
      <AnimatePresence>
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsSectionModalOpen(false)}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">
                     {selectedSection ? 'Update' : 'Define'} <span className="text-blue-600">Section</span>
                   </h2>
                   <button onClick={() => setIsSectionModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveSection} className="p-10 space-y-8">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Section Identity (Title)</label>
                      <input 
                        required
                        value={sectionForm.title}
                        onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                        placeholder="Core Foundations of Trading..."
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sequence Order</label>
                      <input 
                        type="number"
                        required
                        value={sectionForm.order}
                        onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                      />
                   </div>
                   <div className="flex justify-end gap-6 pt-10 border-t border-slate-50">
                      <button type="button" onClick={() => setIsSectionModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Abort</button>
                      <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Execute</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 lg:px-12">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsLessonModalOpen(false)}
               className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">
                     {selectedLesson ? 'Edit' : 'Forge'} <span className="text-blue-600">Learning Asset</span>
                   </h2>
                   <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveLesson} className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                   <div className="grid lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Title</label>
                            <input 
                              required
                              value={lessonForm.title}
                              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                              placeholder="Session Overview: Strategy Execution..."
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resource Type</label>
                               <select 
                                 value={lessonForm.type}
                                 onChange={(e: any) => setLessonForm({ ...lessonForm, type: e.target.value })}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm appearance-none"
                               >
                                  <option value="video">Video Session</option>
                                  <option value="article">Academic Article</option>
                                  <option value="quiz">Intergrative Quiz</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Time Allocation (Min)</label>
                               <input 
                                 type="number"
                                 required
                                 value={lessonForm.duration}
                                 onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                               />
                            </div>
                         </div>
                         <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <label className="flex items-center gap-3 cursor-pointer group">
                               <div 
                                 onClick={() => setLessonForm({ ...lessonForm, is_preview: !lessonForm.is_preview })}
                                 className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                   lessonForm.is_preview ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                 }`}
                               >
                                  {lessonForm.is_preview && <Eye size={12} className="text-white" />}
                               </div>
                               <div>
                                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block">Available as Preview</span>
                                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Students can see this without purchase</span>
                               </div>
                            </label>
                         </div>
                      </div>

                      <div className="space-y-8">
                         {lessonForm.type === 'video' ? (
                            <div>
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transmission ID (Video ID/URL)</label>
                               <input 
                                 value={lessonForm.video_id}
                                 onChange={(e) => setLessonForm({ ...lessonForm, video_id: e.target.value })}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                                 placeholder="Vimeo / YouTube ID or direct URL..."
                               />
                            </div>
                         ) : null}
                         <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Content / Description</label>
                            <textarea 
                              value={lessonForm.content}
                              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm min-h-[200px] resize-none"
                              placeholder="Detailed pedagogy material..."
                            />
                         </div>
                      </div>
                   </div>

                   <div className="flex justify-end gap-6 pt-10 border-t border-slate-100 sticky bottom-0 bg-white">
                      <button type="button" onClick={() => setIsLessonModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Dismiss</button>
                      <button type="submit" className="px-12 py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95">Finalize Asset</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurriculumEditor;
