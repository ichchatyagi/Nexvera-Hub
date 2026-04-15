"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  MicOff, 
  CameraOff, 
  PhoneOff, 
  Settings, 
  Users, 
  MessageSquare,
  MessageSquareOff,
  Loader2,
  Lock,
  ExternalLink,
  ChevronLeft,
  Monitor,
  Edit3,
  Maximize2,
  Minimize2,
  X as XIcon
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useAgoraClassroom } from '@/hooks/useAgoraClassroom';
import toast from 'react-hot-toast';
import { ChatPanel } from '@/components/live-class/ChatPanel';
import { WhiteboardPanel } from '@/components/live-class/WhiteboardPanel';
import dynamic from 'next/dynamic';
const AgoraWhiteboardPanel = dynamic(
  () =>
    import('@/components/live-class/AgoraWhiteboardPanel').then(
      (mod) => mod.AgoraWhiteboardPanel,
    ),
  { ssr: false },
);
import { io } from 'socket.io-client';
import { getCookie } from 'cookies-next';
import { ConfirmationModal } from '@/components/ConfirmationModal';

const USE_AGORA_WHITEBOARD = process.env.NEXT_PUBLIC_USE_AGORA_WHITEBOARD === 'true';

const JoinLiveClass = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [classStatus, setClassStatus] = useState<string>('');
  const [isClassOwner, setIsClassOwner] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Map backend role to Agora role string
  const getAgoraRole = (role: number): 'host' | 'audience' => {
    return role === 1 ? 'host' : 'audience';
  };

  const agoraOptions =
    tokenData && user
      ? {
          appId: tokenData.agora_app_id,
          channelName: tokenData.channel_name,
          token: tokenData.rtc_token,
          uid: user.id,
          role: getAgoraRole(tokenData.role),
        }
      : null;

  const {
    joined,
    remoteStreams,
    join,
    leave,
    toggleMic,
    toggleCamera,
    localVideoTrack,
  } = useAgoraClassroom(agoraOptions);

  useEffect(() => {
    if (isAuthenticated && id && id !== 'undefined') {
      fetchToken();

      // Lifecycle Socket
      const token = getCookie('access_token');
      const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/ws/live-classes`, {
        query: { token, liveClassId: id },
        withCredentials: true,
      });

      socket.on('class:ended', () => {
        setClassStatus('ended');
        if (!isClassOwner) {
          toast.success('Session ended. You can watch the recording if available.');
        }
      });

      socket.on('class:started', () => {
        if (!isClassOwner) {
          setClassStatus('live');
          toast.success('Broadcast has started! Click Enter Live Hub to join.');
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [id, isAuthenticated, isClassOwner]);

  // Auto-join effect for students
  useEffect(() => {
    if (!joined && !isClassOwner && classStatus === 'live') {
      (async () => {
        try {
          await join();
        } catch (err) {
          console.error('Auto-join failed', err);
        }
      })();
    }
  }, [joined, isClassOwner, classStatus, join]);

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/live-classes/${id}/join`);
      setTokenData(response.data);
      setClassStatus(response.data.status);
      
      // Check if current user is the owner/teacher using role (1 = PUBLISHER)
      if (user && response.data.role === 1) {
        setIsClassOwner(true);
      }
    } catch (error) {
      toast.error('Failed to obtain real-time token');
      console.error(error);
      router.push('/live-classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await join();
      toast.success('Securely connected to faculty stream');
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect to session');
    }
  };

  const handleStartClass = async () => {
    try {
      toast.loading('Initializing broadcast signal...', { id: 'class-action' });
      await api.post(`/live-classes/${id}/start`);
      setClassStatus('live');
      await join();
      toast.success('Broadcast is now LIVE', { id: 'class-action' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate broadcast', { id: 'class-action' });
    }
  };

  const handleEndClass = async () => {
    try {
      toast.loading('Terminating signal...', { id: 'class-action' });
      await api.post(`/live-classes/${id}/end`);
      await leave();
      setClassStatus('ended');
      toast.success('Session finalized', { id: 'class-action' });
      router.push('/teacher/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to terminate session', { id: 'class-action' });
    }
  };

  const handleLeaveClass = async () => {
    try {
      await leave();
      router.push('/live-classes');
    } catch (error) {
      router.push('/live-classes');
    }
  };

  const handleToggleMic = async () => {
    const next = await toggleMic();
    if (next !== undefined) setIsMicOn(next);
  };

  const handleToggleCam = async () => {
    const next = await toggleCamera();
    if (next !== undefined) setIsCamOn(next);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
        <p className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">Awaiting RTC Token Authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pt-20">
      <div className="h-16 shrink-0 px-8 border-b border-white/5 flex items-center justify-between text-white/50 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.push('/live-classes')}
             className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all hover:text-white"
           >
             <ChevronLeft size={24} />
           </button>
           <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Interactive Portal</span>
             <h2 className="text-xs font-bold text-white uppercase tracking-tight">Nexvera Classroom Session</h2>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button
             onClick={() => setIsSidebarOpen((prev) => !prev)}
             className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all mr-2"
             aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
           >
             {isSidebarOpen ? <XIcon size={16} /> : <MessageSquare size={16} />}
           </button>

           <button
             onClick={async () => {
               try {
                 if (!document.fullscreenElement && videoContainerRef.current) {
                   await videoContainerRef.current.requestFullscreen();
                   setIsVideoFullscreen(true);
                 } else if (document.fullscreenElement) {
                   await document.exitFullscreen();
                   setIsVideoFullscreen(false);
                 }
               } catch (err) {
                 console.error('Fullscreen toggle failed', err);
               }
             }}
             className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all mr-4"
           >
             {isVideoFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
           </button>
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50">
              <Lock size={12} className="text-blue-500" />
              Secure Gateway
           </div>
           {isClassOwner && classStatus === 'live' && (
              <button 
                onClick={() => setIsEndModalOpen(true)}
                className="px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 ml-2"
              >
                Terminate Session
              </button>
           )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex flex-col p-10 bg-black">
          <div className="flex-1 flex items-center justify-center relative rounded-[4rem] overflow-hidden border border-white/5 bg-slate-900 group shadow-2xl shadow-blue-500/5">
             {!joined || classStatus === 'ended' ? (
               <div className="text-center p-20 max-w-xl">
                  <div className="w-40 h-40 bg-white/5 rounded-[4rem] flex items-center justify-center mx-auto mb-10 border border-white/10 group-hover:bg-white/10 transition-all">
                     <Camera size={64} className={`text-white/40 ${classStatus === 'ended' ? 'text-blue-500' : ''}`} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                    {classStatus === 'ended' ? "Session Finalized" : (!isClassOwner && classStatus === 'scheduled' ? "Awaiting Instructor" : "Awaiting Mentorship")}
                  </h2>
                  <p className="text-white/40 text-lg leading-relaxed mb-10 font-medium max-w-sm mx-auto">
                    {classStatus === 'ended' 
                      ? "This session has concluded. You can now access the recording if it has finished processing."
                      : (!isClassOwner && classStatus === 'scheduled' 
                          ? "Waiting for instructor to start the class. Once live, you'll be connected automatically."
                          : "Your session is authorized. Activate your media devices to proceed.")}
                  </p>
                  
                  {classStatus === 'ended' && !isClassOwner ? (
                    <div className="flex flex-col items-center gap-4">
                       <button 
                         onClick={() => router.push(`/live-classes/${id}/recording`)}
                         className="px-14 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black uppercase tracking-widest text-xs rounded-[2.5rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95"
                       >
                         Watch Recording
                       </button>
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                         If it's still processing, try again in a few minutes.
                       </p>
                    </div>
                  ) : isClassOwner && classStatus === 'scheduled' ? (
                    <button 
                      onClick={handleStartClass}
                      className="px-14 py-6 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-[2.5rem] shadow-2xl shadow-red-500/20 hover:scale-105 transition-all active:scale-95 animate-pulse"
                    >
                      Initialize Live Broadcast
                    </button>
                  ) : (
                    <button 
                      onClick={handleJoin}
                      disabled={classStatus === 'scheduled' && !isClassOwner}
                      className={`px-14 py-6 font-black uppercase tracking-widest text-xs rounded-[2.5rem] shadow-2xl transition-all active:scale-95 ${
                        classStatus === 'scheduled' && !isClassOwner
                          ? 'bg-slate-800 text-white/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20 hover:scale-105'
                      }`}
                    >
                      {classStatus === 'scheduled' ? 'Waiting for Instructor...' : 'Enter Live Hub'}
                    </button>
                  )}
               </div>
             ) : (
                <div className="w-full h-full relative p-10">
                    <div className="flex flex-col gap-6 h-full">
                      {/* Unified Layout: Whiteboard + Video */}
                      {tokenData?.features?.whiteboard_enabled && (
                         <div className="flex-1 min-h-[40%]">
                            {USE_AGORA_WHITEBOARD ? (
                              <AgoraWhiteboardPanel liveClassId={id as string} isTeacher={isClassOwner} userId={user?.id} />
                            ) : (
                              <WhiteboardPanel liveClassId={id as string} isTeacher={isClassOwner} />
                            )}
                         </div>
                      )}

                      <div 
                        ref={videoContainerRef}
                        className="flex-1 min-h-[40%] relative"
                      >
                         {remoteStreams.length === 0 && !localVideoTrack ? (
                           <div className="relative rounded-[3rem] bg-slate-800 border-2 border-white/5 overflow-hidden group shadow-2xl shadow-black/40 h-full">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/10">
                                 <Users size={120} />
                                 <p className="mt-8 font-black uppercase tracking-[0.4em] text-sm">Instructor Channel Active</p>
                              </div>
                           </div>
                         ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                             {isClassOwner && localVideoTrack && (
                               <div 
                                 className="relative rounded-[3rem] bg-black border-2 border-white/5 overflow-hidden shadow-2xl shadow-black/40"
                                 ref={(el) => {
                                   if (el) localVideoTrack.play(el as HTMLElement);
                                 }}
                               />
                             )}
                             {remoteStreams.map((stream) => (
                               <div
                                 key={stream.uid}
                                 className="relative rounded-[3rem] bg-black border-2 border-white/5 overflow-hidden shadow-2xl shadow-black/40"
                                 ref={(el) => {
                                   if (el && stream.videoTrack) {
                                     stream.videoTrack.play(el as HTMLElement);
                                   }
                                 }}
                               />
                             ))}
                           </div>
                         )}
                      </div>

                      {!isClassOwner && (
                        <p className="mt-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">
                          Live stream &middot; Watch-only
                        </p>
                      )}
                    </div>

                   <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                      {isClassOwner && (
                        <>
                          <button onClick={handleToggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
                            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                          </button>
                          <button onClick={handleToggleCam} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
                            {isCamOn ? <Camera size={24} /> : <CameraOff size={24} />}
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => setIsLeaveModalOpen(true)} 
                        className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110 shadow-xl shadow-red-500/20"
                      >
                        <PhoneOff size={24} />
                      </button>
                   </div>
               </div>
             )}
              
              <ConfirmationModal 
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleLeaveClass}
                title={isClassOwner ? "Exit Classroom?" : "Leave Session?"}
                message={isClassOwner 
                  ? "You are leaving while the broadcast is still live. This will NOT end the class for students. Use 'Terminate' to end the session." 
                  : "Are you sure you want to disconnect from this live interactive session?"}
                confirmLabel="Leave Anyway"
                variant={isClassOwner ? "warning" : "info"}
              />
              <ConfirmationModal 
                isOpen={isEndModalOpen}
                onClose={() => setIsEndModalOpen(false)}
                onConfirm={handleEndClass}
                title="Terminate Live Session?"
                message="This will immediately disconnect all students and end the broadcast. This action cannot be undone."
                confirmLabel="End Session Now"
                variant="danger"
              />
          </div>
        </div>

         {isSidebarOpen && (
           <div className="w-[400px] shrink-0 bg-slate-900 border-l border-white/5 flex flex-col overflow-hidden">
              {tokenData?.features?.chat_enabled && classStatus !== 'ended' ? (
                <ChatPanel liveClassId={id as string} />
              ) : (
                <div className="p-8 flex flex-col h-full">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6">Channel Configuration</h3>
                  <div className="space-y-4">
                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Channel ID</p>
                        <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{tokenData?.channel_name || 'NEX-HUB-ALPHA'}</p>
                     </div>
                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Session Role</p>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{isClassOwner ? 'Moderator / Instructor' : 'Attendee'}</p>
                     </div>
                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className={`w-2 h-2 rounded-full ${classStatus === 'live' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                           <p className="text-xs font-bold text-white uppercase tracking-tight">{classStatus || 'Ready'}</p>
                        </div>
                     </div>
                     
                     {!tokenData?.features?.chat_enabled && classStatus !== 'ended' && (
                       <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 mt-20">
                         <MessageSquareOff size={48} className="mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Chat Disabled for this session</p>
                       </div>
                     )}
                  </div>
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

export default JoinLiveClass;
