"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { getSocketUrl } from '@/utils/socket';
import { getCookie } from 'cookies-next';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useLiveClassLayout } from '@/hooks/useLiveClassLayout';
import { ClassroomStage } from '@/components/live-class/ClassroomStage';

const USE_AGORA_WHITEBOARD = process.env.NEXT_PUBLIC_USE_AGORA_WHITEBOARD === 'true';

const JoinLiveClass = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [classStatus, setClassStatus] = useState<string>('');
  const [isClassOwner, setIsClassOwner] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [socket, setSocket] = useState<any>(null);
  const socketRef = useRef<any>(null);
  const isClassOwnerRef = useRef(isClassOwner);

  useEffect(() => {
    isClassOwnerRef.current = isClassOwner;
  }, [isClassOwner]);

  // PROMPT 3/4: Tuition Speaking State
  const [speakStatus, setSpeakStatus] = useState<'idle' | 'requested' | 'approved'>('idle');
  const [isAudioInitializing, setIsAudioInitializing] = useState(false);
  const [shouldEnableStudentAudio, setShouldEnableStudentAudio] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Array<{ userId: string; userName: string; requestedAt: string }>>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({});
  const isTuition = tokenData?.product_type === 'tuition';

  // Map backend role to Agora role string
  const getAgoraRole = (role: number): 'host' | 'audience' => {
    return role === 1 ? 'host' : 'audience';
  };

  const presetRect = (mode: 'WHITEBOARD_FOCUS' | 'VIDEO_FOCUS' | 'SPLIT') => {
    switch (mode) {
      case 'WHITEBOARD_FOCUS':
        return { x: 0.7, y: 0.68, w: 0.28, h: (0.28 * 9) / 16 };
      case 'VIDEO_FOCUS':
        return { x: 0.15, y: 0.12, w: 0.7, h: (0.7 * 9) / 16 };
      case 'SPLIT':
        return { x: 0.6, y: 0.04, w: 0.38, h: 0.92 };
    }
  };

  const agoraOptions = useMemo(() => {
    if (!tokenData || !user) return null;
    return {
      appId: tokenData.agora_app_id,
      channelName: tokenData.channel_name,
      token: tokenData.rtc_token,
      uid: tokenData.agora_uid,
      role: getAgoraRole(tokenData.role),
    };
  }, [tokenData, user]);

  const {
    joined,
    remoteStreams,
    join,
    leave,
    toggleMic,
    toggleCamera,
    renewToken,
    enableLocalAudio,
    disableLocalAudio,
    localVideoTrack,
    localAudioTrack,
    localAudioRef,
  } = useAgoraClassroom(agoraOptions);

  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/live-classes/${id}/join`);

      // Fail fast if backend is out of sync with new Agora numeric UID protocol
      if (response.data.agora_uid === undefined || response.data.agora_uid === null) {
        throw new Error('Server assigned an invalid numeric UID (protocol mismatch)');
      }

      setTokenData(response.data);
      setClassStatus(response.data.status);

      // Check if current user is the owner/teacher using role (1 = PUBLISHER)
      if (user && response.data.role === 1) {
        setIsClassOwner(true);
        setIsMicOn(true); // Teachers start with mic on
        setIsCamOn(true);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to obtain real-time token';
      toast.error(msg);
      console.error(error);
      router.push('/live-classes');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, router]);

  const layout = useLiveClassLayout({
    liveClassId: id as string,
    enabled: joined && classStatus !== 'ended',
    isTeacher: isClassOwner,
  });

  useEffect(() => {
    if (isAuthenticated && id && id !== 'undefined') {
      fetchToken();
    }
  }, [id, isAuthenticated, fetchToken]);

  useEffect(() => {
    if (isAuthenticated && id && id !== 'undefined' && tokenData) {
      // Lifecycle Socket
      const token = getCookie('access_token') || localStorage.getItem('access_token');
      const apiUrl = getSocketUrl('/ws/live-classes');
      const newSocket = io(apiUrl, {
        query: { token, liveClassId: id },
        withCredentials: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    }
  }, [id, isAuthenticated, tokenData]);

  // Stable Listeners Registration
  useEffect(() => {
    if (socket) {
      socket.on('class:ended', () => {
        setClassStatus('ended');
        setPendingRequests([]);
        setActiveSpeakers([]);
        if (!isClassOwnerRef.current) {
          const msg = isTuition
            ? 'Session ended.'
            : 'Session ended. You can watch the recording if available.';
          toast.success(msg);
        }
      });

      socket.on('error', (err) => {
        console.error('Socket lifecycle error:', err);
        toast.error(`Socket error: ${err}`);
      });

      socket.on('class:started', () => {
        if (!isClassOwnerRef.current) {
          setClassStatus('live');
          toast.success('Broadcast has started! Click Enter Live Hub to join.');
        }
      });

      // PROMPT 4/6: Audio Speaking Listeners
      socket.on('audio:request', (payload: { userId: string; userName: string; requestedAt: string }) => {
        console.log('Received audio:request event', payload, 'isClassOwner:', isClassOwnerRef.current);
        if (isClassOwnerRef.current) {
          setSpeakerNames(prev => ({ ...prev, [payload.userId]: payload.userName }));
          setPendingRequests(prev => {
            const exists = prev.find(r => r.userId === payload.userId);
            if (exists) return prev;
            return [...prev, payload];
          });
          toast(`${payload.userName} requested to speak`, { icon: '🎙️' });
        }
      });

      socket.on('audio:request:ack', () => {
        setSpeakStatus('requested');
        toast.success('Request sent to instructor');
      });

      socket.on('audio:speakers', (payload: { speakers: string[] }) => {
        setActiveSpeakers(payload.speakers);
        if (isClassOwner) {
          setPendingRequests(prev => prev.filter(req => !payload.speakers.includes(req.userId)));
        }
      });

      socket.on('audio:approved', async (payload: { userId: string; rtc_token: string }) => {
        if (payload.userId === user?.id) {
          setSpeakStatus('approved');
          setIsMicOn(false);
          setShouldEnableStudentAudio(true);
          // Update tokenData to sync the new publisher token with the Agora hook options
          // This will trigger a hook re-initialization with the correct Host permissions
          setTokenData(prev => prev ? { ...prev, rtc_token: payload.rtc_token } : null);
          toast.success('Instructor approved your audio request. Preparing microphone...', { duration: 5000 });
        }
      });

      socket.on('audio:revoked', async (payload: { userId: string; rtc_token: string }) => {
        if (payload.userId === user?.id) {
          try {
            await renewToken(payload.rtc_token);
            await disableLocalAudio();
          } catch (err) {
            console.error('Audio revoke cleanup failed:', err);
          }
          setSpeakStatus('idle');
          setIsMicOn(false);
          setShouldEnableStudentAudio(false);
          toast.error('Your speaking permission has been revoked');
        }
      });

      return () => {
        socket.off('class:ended');
        socket.off('error');
        socket.off('class:started');
        socket.off('audio:request');
        socket.off('audio:request:ack');
        socket.off('audio:speakers');
        socket.off('audio:approved');
        socket.off('audio:revoked');
      };
    }
  }, [socket, id, user?.id, isClassOwner, isTuition, renewToken, join, joined, enableLocalAudio, disableLocalAudio]);

  // Retry effect for student audio publish
  useEffect(() => {
    if (shouldEnableStudentAudio && speakStatus === 'approved' && joined && !localAudioTrack && !isAudioInitializing) {
      (async () => {
        try {
          setIsAudioInitializing(true);
          await enableLocalAudio();
        } catch (err) {
          console.error('Retry enable audio failed', err);
        } finally {
          setIsAudioInitializing(false);
        }
      })();
    }
  }, [shouldEnableStudentAudio, speakStatus, joined, localAudioTrack, enableLocalAudio, isAudioInitializing]);



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
    if (isAudioInitializing) {
      toast.error('Microphone is initializing, please wait...');
      return;
    }

    const currentTrack = localAudioRef.current;

    if (!currentTrack && speakStatus === 'approved') {
      toast.error('Microphone not ready. Re-initializing...');
      setIsAudioInitializing(true);
      try {
        await enableLocalAudio();
      } catch (err) {
        toast.error('Initialization failed');
      } finally {
        setIsAudioInitializing(false);
      }
      return;
    }

    if (!currentTrack && !isClassOwner) {
      toast.error('Microphone not available');
      return;
    }

    try {
      const next = await toggleMic();
      if (next !== undefined) {
        setIsMicOn(next);
        // Sync with server list
        if (next) {
          socketRef.current?.emit('audio:speaking:start');
        } else {
          socketRef.current?.emit('audio:speaking:stop');
        }
      }
    } catch (err) {
      toast.error('Failed to toggle microphone');
    }
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

          {isClassOwner && joined && classStatus === 'live' && (
            <div className="flex items-center gap-2 mr-2">
              {!layout.isConnected && (
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] animate-pulse">Syncing...</span>
              )}
              <div className={`flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 transition-opacity ${!layout.isConnected ? 'opacity-50' : ''}`}>
                {(
                  ['WHITEBOARD_FOCUS', 'VIDEO_FOCUS', 'SPLIT'] as const
                ).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      const rect = presetRect(m);
                      layout.setMode(m);
                      layout.setVideo(rect);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${(layout.state?.mode || 'WHITEBOARD_FOCUS') === m
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {m === 'WHITEBOARD_FOCUS'
                      ? 'Board'
                      : m === 'VIDEO_FOCUS'
                        ? 'Video'
                        : 'Split'}
                  </button>
                ))}
              </div>
            </div>
          )}

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
          <div className="flex-1 flex relative rounded-[4rem] overflow-hidden border border-white/5 bg-slate-900 group shadow-2xl shadow-blue-500/5">
            {!joined || classStatus === 'ended' ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-20 max-w-xl">
                  <div className="w-40 h-40 bg-white/5 rounded-[4rem] flex items-center justify-center mx-auto mb-10 border border-white/10 group-hover:bg-white/10 transition-all">
                    <Camera size={64} className={`text-white/40 ${classStatus === 'ended' ? 'text-blue-500' : ''}`} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                    {classStatus === 'ended' ? "Session Finalized" : (!isClassOwner && classStatus === 'scheduled' ? "Awaiting Instructor" : "Awaiting Mentorship")}
                  </h2>
                  <p className="text-white/40 text-lg leading-relaxed mb-10 font-medium max-w-sm mx-auto">
                    {classStatus === 'ended'
                      ? (isTuition
                        ? "This session has concluded."
                        : "This session has concluded. You can now access the recording if it has finished processing.")
                      : (!isClassOwner && classStatus === 'scheduled'
                        ? "Waiting for instructor to start the class. Once live, you'll be connected automatically."
                        : "Your session is authorized. Activate your media devices to proceed.")}
                  </p>

                  {classStatus === 'ended' && !isClassOwner && !isTuition ? (
                    <div className="flex flex-col items-center gap-4">
                      <button
                        onClick={() => router.push(`/live-classes/${id}/recording`)}
                        className="px-14 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black uppercase tracking-widest text-xs rounded-[2.5rem] shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all active:scale-95"
                      >
                        Watch Recording
                      </button>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        If it&apos;s still processing, try again in a few minutes.
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
                      className={`px-14 py-6 font-black uppercase tracking-widest text-xs rounded-[2.5rem] shadow-2xl transition-all active:scale-95 ${classStatus === 'scheduled' && !isClassOwner
                          ? 'bg-slate-800 text-white/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20 hover:scale-105'
                        }`}
                    >
                      {classStatus === 'scheduled' ? 'Waiting for Instructor...' : 'Enter Live Hub'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div ref={videoContainerRef} className="w-full h-full relative">
                <ClassroomStage
                  liveClassId={id as string}
                  isTeacher={isClassOwner}
                  localVideoTrack={localVideoTrack}
                  remoteStreams={remoteStreams}
                  layoutState={layout.state}
                  useAgoraWhiteboard={USE_AGORA_WHITEBOARD}
                  whiteboardEnabled={!!tokenData?.features?.whiteboard_enabled}
                  userId={user?.id}
                  onLayoutPreview={(nextRect) => {
                    if (isClassOwner) layout.setVideo(nextRect);
                  }}
                  onLayoutUpdate={(nextRect) => {
                    layout.setVideo(nextRect);
                    if (isClassOwner) layout.setMode('CUSTOM');
                  }}
                />

                {/* Controls Layer */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl z-[100]">
                  {/* PROMPT 4: Student Request to Speak Button */}
                  {!isClassOwner && isTuition && joined && classStatus === 'live' && (
                    <button
                      disabled={speakStatus !== 'idle'}
                      onClick={() => {
                        console.log('Emitting audio:request');
                        socketRef.current?.emit('audio:request');
                      }}
                      className={`px-6 py-4 rounded-2xl flex items-center gap-3 transition-all ${speakStatus === 'idle'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20'
                          : speakStatus === 'requested'
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-green-600 text-white cursor-not-allowed'
                        }`}
                    >
                      <Mic size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {speakStatus === 'idle' ? 'Request to Speak' : speakStatus === 'requested' ? 'Request Sent' : 'Speaking Approved'}
                      </span>
                    </button>
                  )}

                  {(isClassOwner || speakStatus === 'approved') && (
                    <button
                      onClick={handleToggleMic}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}
                    >
                      {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                  )}

                  {isClassOwner && (
                    <button
                      onClick={handleToggleCam}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}
                    >
                      {isCamOn ? <Camera size={24} /> : <CameraOff size={24} />}
                    </button>
                  )}

                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110 shadow-xl shadow-red-500/20"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>

                {!isClassOwner && (
                  <div className="absolute top-6 right-8 flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-full z-[100]">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      Live stream &middot; {
                        !isTuition
                          ? 'Watch-only'
                          : speakStatus === 'approved'
                            ? 'Approved to speak'
                            : speakStatus === 'requested'
                              ? 'Request sent'
                              : 'Listening'
                      }
                    </span>
                  </div>
                )}
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
            {/* PROMPT 4: Teacher Speaking Controls */}
            {isClassOwner && isTuition && classStatus === 'live' && (
              <div className="p-6 border-b border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Speaker Management</h3>
                  {activeSpeakers.length > 0 && (
                    <button
                      onClick={() => socketRef.current?.emit('audio:mute_all')}
                      className="text-[9px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Mute All
                    </button>
                  )}
                </div>

                {pendingRequests.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3">Pending Hand-raises ({pendingRequests.length})</p>
                    <div className="space-y-2">
                      {pendingRequests.map(req => (
                        <div key={req.userId} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                          <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[150px]">{req.userName}</span>
                          <button
                            onClick={() => {
                              socketRef.current?.emit('audio:approve', { userId: req.userId });
                              setPendingRequests(prev => prev.filter(r => r.userId !== req.userId));
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3">Active Speakers ({activeSpeakers.length}/4)</p>
                  {activeSpeakers.length === 0 ? (
                    <p className="text-[10px] font-medium text-white/10 uppercase tracking-widest italic py-2">No active student speakers</p>
                  ) : (
                    <div className="space-y-2">
                      {activeSpeakers.map(uid => (
                        <div key={uid} className="flex items-center justify-between p-3 bg-white/5 border border-blue-500/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-tight">
                              {speakerNames[uid] || `User ${uid.slice(-4)}`}
                            </span>
                          </div>
                          <button
                            onClick={() => socketRef.current?.emit('audio:revoke', { userId: uid })}
                            className="px-3 py-1.5 bg-red-600/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tokenData?.features?.chat_enabled && classStatus !== 'ended' ? (
              <ChatPanel liveClassId={id as string} socket={socket} />
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
