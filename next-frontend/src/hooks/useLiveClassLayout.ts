import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/utils/socket';
import { getCookie } from 'cookies-next';

export type LayoutMode = 'WHITEBOARD_FOCUS' | 'VIDEO_FOCUS' | 'SPLIT' | 'CUSTOM';

export interface NormalizedRect {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
}

export interface LayoutState {
  liveClassId: string;
  version: number;
  mode: LayoutMode;
  video: NormalizedRect;
  updated_at: string;
}

export function useLiveClassLayout(params: {
  liveClassId: string;
  enabled?: boolean; // default true
  isTeacher: boolean;
}): {
  state: LayoutState | null;
  isConnected: boolean;
  errorCode: string | null;

  setMode: (mode: LayoutMode) => void; // teacher only
  setVideo: (rect: Partial<NormalizedRect>) => void; // teacher only
} {
  const { liveClassId, enabled = true, isTeacher } = params;
  const [state, setState] = useState<LayoutState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!liveClassId || !enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token =
      getCookie('access_token') ||
      (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    const apiUrl = getSocketUrl('/ws/live-classes');

    const socket = io(apiUrl, {
      query: { token, liveClassId },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setErrorCode(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (err: any) => {
      if (typeof err === 'string') {
        setErrorCode(err);
      } else if (err && typeof err.message === 'string') {
        setErrorCode(err.message);
      }
    });

    socket.on('layout:state', (payload: LayoutState) => {
      setState(payload);
    });

    socket.on('layout:update', (payload: LayoutState) => {
      setState((current) => {
        if (!current || payload.version >= current.version) {
          return payload;
        }
        return current;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [liveClassId, enabled]);

  const createDefaultState = useCallback(
    (): LayoutState => ({
      liveClassId,
      version: 0,
      mode: "WHITEBOARD_FOCUS",
      video: { x: 0.7, y: 0.68, w: 0.28, h: (0.28 * 9) / 16 },
      updated_at: new Date().toISOString(),
    }),
    [liveClassId],
  );

  const setMode = useCallback(
    (mode: LayoutMode) => {
      if (!isTeacher) return;

      // Optimistic local update
      setState((prev) => {
        const base = prev || createDefaultState();
        return {
          ...base,
          mode,
          version: base.version + 1,
          updated_at: new Date().toISOString(),
        };
      });

      if (isConnected && !errorCode && socketRef.current) {
        socketRef.current.emit("layout:update", { mode });
      }
    },
    [isTeacher, isConnected, errorCode, createDefaultState],
  );

  const setVideo = useCallback(
    (rect: Partial<NormalizedRect>) => {
      if (!isTeacher) return;

      // Optimistic local update
      setState((prev) => {
        const base = prev || createDefaultState();
        return {
          ...base,
          video: { ...base.video, ...rect },
          version: base.version + 1,
          updated_at: new Date().toISOString(),
        };
      });

      if (isConnected && !errorCode && socketRef.current) {
        socketRef.current.emit("layout:update", { video: rect });
      }
    },
    [isTeacher, isConnected, errorCode, createDefaultState],
  );

  return {
    state,
    isConnected,
    errorCode,
    setMode,
    setVideo,
  };
}
