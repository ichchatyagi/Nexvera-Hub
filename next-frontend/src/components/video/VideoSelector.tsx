"use client";

import React, { useState, useEffect } from 'react';
import { Video, Search, Loader2, Check, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface VideoAsset {
  _id: string;
  title?: string;
  original: {
    key: string;
    filename?: string;
  };
  processed: {
    status: string;
  };
  created_at: string;
}

interface VideoSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({ value, onChange }) => {
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/videos/my');
      setVideos(response.data || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => 
    (v.title || v.original.key).toLowerCase().includes(search.toLowerCase())
  );

  const selectedVideo = videos.find(v => v._id === value);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-200 font-bold text-sm flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Video size={16} className="text-slate-400" />
          {selectedVideo ? (
            <span className="text-slate-950 font-black uppercase tracking-tight truncate max-w-[200px]">
              {selectedVideo.title || selectedVideo.original.key.split('/').pop()}
            </span>
          ) : (
            <span className="text-slate-400">Select Primary Asset (Video)...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedVideo && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
              selectedVideo.processed.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
            }`}>
              {selectedVideo.processed.status}
            </span>
          )}
          <Search size={14} className="text-slate-300" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-slate-50">
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-200 text-xs font-bold"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
            {isLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-blue-600" size={20} />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Indexing Assets</span>
              </div>
            ) : filteredVideos.length > 0 ? (
              filteredVideos.map(video => (
                <div 
                  key={video._id}
                  onClick={() => {
                    onChange(video._id);
                    setIsOpen(false);
                  }}
                  className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    value === video._id ? 'bg-blue-50/50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      value === video._id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Video size={14} />
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${
                        value === video._id ? 'text-blue-900' : 'text-slate-700'
                      }`}>
                        {video.title || video.original.key.split('/').pop()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Uploaded {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        video.processed.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {video.processed.status}
                      </span>
                      {value === video._id && <Check size={14} className="text-blue-600" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No assets discovered</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/50">
             <button 
               onClick={() => window.open('/teacher/videos', '_blank')}
               className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors"
             >
                <ExternalLink size={10} /> Video Manager
             </button>
             <button 
               onClick={() => setIsOpen(false)}
               className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
             >
                Close
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSelector;
