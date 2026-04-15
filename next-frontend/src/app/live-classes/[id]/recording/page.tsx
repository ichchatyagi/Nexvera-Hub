'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { Loader2, ChevronLeft } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const LiveClassRecordingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayback = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/live-classes/${id}/recording`);
        // Success case is usually unwrapped by `src/lib/api.ts` into plain playback data.
        // Error case may come through as { success: false, error: {...} } without unwrapping.
        const payload: any = res.data;

        if (payload?.manifest_url) {
          setPlaybackData(payload);
          return;
        }

        if (payload?.success === true && payload?.data?.manifest_url) {
          setPlaybackData(payload.data);
          return;
        }

        if (payload?.success === false && payload?.error) {
          setErrorMessage(payload.error?.message || 'Recording not available yet.');
          return;
        }

        setErrorMessage('Recording not available yet.');
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load recording');
        setErrorMessage('Failed to load recording');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPlayback();
  }, [id]);

  useEffect(() => {
    if (playbackData?.manifest_url && videoRef.current) {
      const video = videoRef.current;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(playbackData.manifest_url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playbackData.manifest_url;
      }
    }
  }, [playbackData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
        <p className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">
          Preparing class recording...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <p className="text-white/60 text-lg font-medium text-center max-w-md">
          {errorMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pt-20">
      <div className="h-16 shrink-0 px-8 border-b border-white/5 flex items-center justify-between text-white/50 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              Class Recording
            </span>
            <h2 className="text-xs font-bold text-white uppercase tracking-tight">
              On-Demand Playback
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-5xl aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
        </div>
      </div>
    </div>
  );
};

export default LiveClassRecordingPage;
