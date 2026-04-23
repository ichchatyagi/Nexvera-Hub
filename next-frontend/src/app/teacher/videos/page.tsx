"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Plus, 
  Upload, 
  Search, 
  Trash2, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  FileVideo,
  ExternalLink,
  MoreVertical,
  BarChart3,
  Globe
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';

interface VideoAsset {
  _id: string;
  title?: string;
  original: {
    key: string;
    filename?: string;
    size_bytes: number;
    format: string;
  };
  processed: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    manifest_url?: string;
    thumbnail_url?: string;
  };
  created_at: string;
}

const VideoManager = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Selection State
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assetTitle, setAssetTitle] = useState('');

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        router.push('/login');
      } else {
        fetchData();
      }
    }
  }, [user, isLoadingAuth]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [videoRes, coursesRes] = await Promise.all([
        api.get('/videos/my'),
        api.get('/teacher/courses')
      ]);
      setVideos(videoRes.data || []);
      setCourses(coursesRes.data || []);
      if (coursesRes.data && coursesRes.data.length > 0) {
        setSelectedCourseId(coursesRes.data[0]._id || coursesRes.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to synchronize asset registry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Get presigned URL
      const initiateRes = await api.post('/videos/upload-url', {
        title: assetTitle || uploadFile.name,
        course_id: selectedCourseId,
        filename: uploadFile.name,
        mime_type: uploadFile.type,
        size_bytes: uploadFile.size
      });

      const { presigned, video_id } = initiateRes.data;

      // 2. Upload directly to S3
      await axios.put(presigned.upload_url, uploadFile, {
        headers: {
          ...presigned.headers,
          'Content-Type': uploadFile.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || uploadFile.size));
          setUploadProgress(percentCompleted);
        }
      });

      // 3. Trigger processing (optional, backend might do it via S3 trigger in prod,
      // but for dev we might need to call /process or rely on backend simulation)
      try {
        await api.post(`/videos/${video_id}/process`, {});
      } catch (e) {
        // Ignore if already processing
      }

      toast.success('Asset ingested successfully');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setAssetTitle('');
      fetchData();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error('Transmission failure: ' + (error.message || 'Check connection'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Purge this asset from Nexvera CDN?')) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Asset removed');
      setVideos(videos.filter(v => v._id !== id));
    } catch (error) {
      toast.error('Decommissioning failed');
    }
  };

  const filteredVideos = videos.filter(v => 
    (v.title || v.original.key).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Asset Registry</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-12 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Video size={16} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Curriculum Assets</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-950 uppercase tracking-tighter">
                Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Manager</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-xl">
                 Upload and manage high-fidelity curriculum assets. All videos are automatically transcoded for global multi-bitrate delivery.
              </p>
           </div>

           <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="flex items-center gap-4 px-10 py-5 bg-slate-950 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl shadow-slate-900/10 hover:bg-black transition-all active:scale-95 group"
           >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              Ingest New Asset
           </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 flex items-center px-8 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all focus-within:border-blue-200 w-full">
            <Search className="text-slate-400 mr-4" size={18} />
            <input 
              type="text" 
              placeholder="Query asset database..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-5 bg-transparent outline-none text-sm font-bold placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-4 px-6 py-4 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
             <BarChart3 size={16} className="text-blue-600" />
             <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{videos.length} Assets Identified</span>
          </div>
        </div>

        {/* Asset Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVideos.map((video, i) => (
              <motion.div 
                key={video._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all group flex flex-col h-full"
              >
                {/* Thumbnail / Placeholder */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {video.processed.thumbnail_url && video.processed.thumbnail_url.trim() !== "" ? (
                    <img src={video.processed.thumbnail_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <FileVideo size={32} />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">Preview Pending</span>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4">
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${
                        video.processed.status === 'completed' 
                        ? 'bg-green-50/80 text-green-700 border-green-100' 
                        : video.processed.status === 'processing'
                        ? 'bg-blue-50/80 text-blue-700 border-blue-100'
                        : video.processed.status === 'failed'
                        ? 'bg-red-50/80 text-red-700 border-red-100'
                        : 'bg-slate-50/80 text-slate-700 border-slate-100'
                     }`}>
                        {video.processed.status}
                     </span>
                  </div>
                  
                  {/* Hover Controls */}
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={() => window.open(`/videos/${video._id}`, '_blank')}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 hover:scale-110 transition-transform shadow-2xl"
                     >
                        <Play size={20} fill="currentColor" />
                     </button>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight line-clamp-2">
                       {video.title || video.original.key.split('/').pop()}
                    </h3>
                    <button 
                      onClick={() => handleDelete(video._id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                       <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-2"><Clock size={12} /> {new Date(video.created_at).toLocaleDateString()}</span>
                       <span className="flex items-center gap-2"><Globe size={12} /> {(video.original.size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    
                    {video.processed.status === 'completed' && (
                      <button 
                        onClick={() => window.open(video.processed.manifest_url, '_blank')}
                        className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                         <ExternalLink size={12} /> Access Stream
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                <Video size={48} />
             </div>
             <h3 className="text-slate-950 font-black uppercase tracking-widest text-lg mb-2">Registry Offline</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm mx-auto">
                No curriculum assets discovered in the cloud registry. Ingest your first master recording to begin.
             </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-12 text-center">
                 <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600">
                       <Upload size={32} />
                    </div>
                 </div>
                 
                 <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2">Ingest <span className="text-blue-600">Master Asset</span></h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Security Level: High (AES-256)</p>

                 {!isUploading ? (
                   <div className="space-y-6 text-left">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Curriculum</label>
                        <select 
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                        >
                          {courses.map(c => (
                            <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Identity (Title)</label>
                        <input 
                          type="text"
                          placeholder="Introduction to..."
                          value={assetTitle}
                          onChange={(e) => setAssetTitle(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm"
                        />
                      </div>
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="border-2 border-dashed border-slate-100 rounded-[3rem] p-12 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
                     >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept="video/*"
                        />
                        {uploadFile ? (
                          <div className="flex flex-col items-center gap-4">
                             <FileVideo size={40} className="text-blue-600" />
                             <p className="text-sm font-black text-slate-900 truncate max-w-xs">{uploadFile.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB Ready</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                             <Plus size={32} className="text-slate-200 group-hover:text-blue-400 group-hover:rotate-90 transition-all" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify Source File (MP4/MOV)</p>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-col gap-4">
                        <button 
                          onClick={handleUpload}
                          disabled={!uploadFile}
                          className="w-full py-6 bg-slate-950 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-20"
                        >
                           Initialize Transmission
                        </button>
                        <button 
                          onClick={() => setIsUploadModalOpen(false)}
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        >
                           Cancel Operation
                        </button>
                     </div>
                   </div>
                 ) : (
                   <div className="p-8">
                      <div className="relative w-48 h-48 mx-auto mb-12">
                         <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                            <circle 
                              className="text-blue-600 stroke-current transition-all duration-300" 
                              strokeWidth="8" 
                              strokeDasharray={`${uploadProgress * 2.51}, 251.2`} 
                              strokeLinecap="round" 
                              cx="50" cy="50" r="40" fill="transparent"
                              transform="rotate(-90 50 50)"
                            ></circle>
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-950">{uploadProgress}%</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uplift</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing with S3 Registry</p>
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoManager;
