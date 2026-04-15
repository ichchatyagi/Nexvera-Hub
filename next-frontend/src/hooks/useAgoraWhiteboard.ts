'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';

interface AgoraWhiteboardConfig {
  app_id: string;
  room_uuid: string;
  room_token: string;
  region: string;
  role: 'student' | 'teacher' | 'admin';
}

export const useAgoraWhiteboard = (liveClassId: string | null) => {
  const [config, setConfig] = useState<AgoraWhiteboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!liveClassId) return;

    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/live-classes/${liveClassId}/whiteboard`);

        // `api` unwraps `{ success, data, meta }` responses into `res.data = data`
        // and attaches the original success flag onto the axios response object.
        const envelopeSuccess = (res as any).success;
        if (envelopeSuccess === true) {
          setConfig(res.data as AgoraWhiteboardConfig);
          setErrorCode(null);
          return;
        }

        // Some endpoints return `{ success: false, error }` without a `data` field.
        if (res.data && typeof res.data === 'object' && (res.data as any).success === false) {
          setErrorCode((res.data as any)?.error?.code || 'WHITEBOARD_UNAVAILABLE');
          setConfig(null);
          return;
        }

        // If this ever comes back as a raw config object (no envelope), accept it.
        if (res.data && typeof res.data === 'object' && 'room_uuid' in (res.data as any)) {
          setConfig(res.data as AgoraWhiteboardConfig);
          setErrorCode(null);
          return;
        }

        setErrorCode('WHITEBOARD_UNAVAILABLE');
        setConfig(null);
      } catch (err) {
        console.error('Failed to load whiteboard config', err);

        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const message = err.response?.data?.message;

          if (
            status === 400 &&
            typeof message === 'string' &&
            message.toLowerCase().includes('agora whiteboard is currently disabled')
          ) {
            setErrorCode('AGORA_DISABLED');
          } else if (status === 403) {
            setErrorCode('FORBIDDEN');
          } else if (status === 404) {
            setErrorCode('NOT_FOUND');
          } else {
            setErrorCode('WHITEBOARD_UNAVAILABLE');
          }
        } else {
          setErrorCode('WHITEBOARD_UNAVAILABLE');
        }

        setConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [liveClassId]);

  // Placeholder for Agora whiteboard SDK initialization.
  // Another AI can use `config` to mount Agora's whiteboard inside a container.

  return {
    config,
    isLoading,
    errorCode,
  };
};
