import { useEffect, useRef, useState } from 'react';
import type {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

export type AgoraRole = 'host' | 'audience';

// Singleton-like promise to ensure we only load and use one instance of the SDK
let agoraLoader: Promise<any> | null = null;
const getAgoraRTC = async () => {
  if (!agoraLoader) {
    agoraLoader = import('agora-rtc-sdk-ng').then(m => m.default || m);
  }
  return agoraLoader;
};

interface UseAgoraClassroomOptions {
  appId: string;
  channelName: string;
  token: string;
  uid: string;            // use user.id from AuthContext
  role: AgoraRole;        // 'host' for teacher, 'audience' for students
}

interface RemoteStream {
  uid: string;
  videoTrack?: IRemoteVideoTrack | null;
  audioTrack?: IRemoteAudioTrack | null;
}

export function useAgoraClassroom(options: UseAgoraClassroomOptions | null) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const localAudioRef = useRef<ILocalAudioTrack | null>(null);
  const localVideoRef = useRef<ILocalVideoTrack | null>(null);
  const isJoiningRef = useRef(false);

  // Initialize client when options change
  useEffect(() => {
    if (!options || typeof window === 'undefined') return;

    let client: IAgoraRTCClient;
    let agoraModule: any;

    const initAgora = async () => {
      try {
        const AgoraRTC = await getAgoraRTC();
        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          await client.subscribe(user, mediaType);
          setRemoteStreams((prev) => {
            const existing = prev.find((s) => s.uid === String(user.uid));
            const next: RemoteStream = {
              uid: String(user.uid),
              videoTrack: existing?.videoTrack ?? null,
              audioTrack: existing?.audioTrack ?? null,
            };
            if (mediaType === 'video') next.videoTrack = user.videoTrack || null;
            if (mediaType === 'audio') next.audioTrack = user.audioTrack || null;
            return [next, ...prev.filter((s) => s.uid !== next.uid)];
          });
          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.play();
          }
        };

        const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          setRemoteStreams((prev) =>
            prev.map((s) =>
              s.uid === String(user.uid)
                ? {
                    ...s,
                    videoTrack: mediaType === 'video' ? null : s.videoTrack,
                    audioTrack: mediaType === 'audio' ? null : s.audioTrack,
                  }
                : s,
            ),
          );
        };

        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
      } catch (err) {
        console.error('Failed to initialize Agora RTC:', err);
      }
    };

    initAgora();

    return () => {
      if (client) {
        client.leave(); 
      }
    };
  }, [options?.appId, options?.channelName, options?.token, options?.uid, options?.role]);

  const join = async () => {
    if (!options || !clientRef.current || joined || isJoiningRef.current) return;
    
    const client = clientRef.current;
    
    // Safety check for Agora connection state
    if (client.connectionState !== 'DISCONNECTED') {
      console.warn('[Agora] Join aborted: Client state is', client.connectionState);
      return;
    }

    isJoiningRef.current = true;

    try {
      await client.join(
        options.appId,
        options.channelName,
        options.token,
        options.uid || null,
      );

      if (options.role === 'host') {
        try {
          const AgoraRTC = await getAgoraRTC();
          const [audioTrack, videoTrack] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack(),
          ]);
          localAudioRef.current = audioTrack;
          localVideoRef.current = videoTrack;
          
          if (audioTrack && videoTrack) {
            await client.publish([audioTrack, videoTrack]);
          }
        } catch (err) {
          console.error('Failed to create or publish local tracks:', err);
          // Don't re-throw here so setJoined(true) can still happen for remote streams
        }
      }

      setJoined(true);
    } catch (err: any) {
      if (err.code === 'INVALID_OPERATION') {
        console.warn('[Agora] Already connected/connecting, ignoring.');
      } else {
        console.error('[Agora] Join failed:', err);
        throw err;
      }
    } finally {
      isJoiningRef.current = false;
    }
  };

  const leave = async () => {
    if (!clientRef.current) return;
    isJoiningRef.current = false; 
    localAudioRef.current?.close();
    localVideoRef.current?.close();
    localAudioRef.current = null;
    localVideoRef.current = null;
    await clientRef.current.leave();
    setRemoteStreams([]);
    setJoined(false);
  };

  const toggleMic = async () => {
    if (!localAudioRef.current) return;
    const enabled = localAudioRef.current.enabled;
    await localAudioRef.current.setEnabled(!enabled);
    return !enabled;
  };

  const toggleCamera = async () => {
    if (!localVideoRef.current) return;
    const enabled = localVideoRef.current.enabled;
    await localVideoRef.current.setEnabled(!enabled);
    return !enabled;
  };

  return {
    joined,
    remoteStreams,
    join,
    leave,
    toggleMic,
    toggleCamera,
    localVideoTrack: localVideoRef.current,
  };
}
