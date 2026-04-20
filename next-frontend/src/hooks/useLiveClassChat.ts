import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/utils/socket';
import { getCookie } from 'cookies-next';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

export const useLiveClassChat = (liveClassId: string, externalSocket?: Socket | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(externalSocket?.connected || false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!liveClassId) return;

    const token = getCookie('access_token') || localStorage.getItem('access_token');
    const apiUrl = getSocketUrl('/ws/live-classes');

    // Initialize socket or use external
    const socket = externalSocket || io(apiUrl, {
      query: { token, liveClassId },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Classroom chat connected');
      setIsConnected(true);
      setErrorCode(null);
    });

    socket.on('disconnect', () => {
      console.log('Classroom chat disconnected');
      setIsConnected(false);
    });

    socket.on('chat:history', (history: any[]) => {
      // Map backend message structure to frontend ChatMessage
      const mapped = history.map(msg => ({
        id: msg.id || msg._id,
        sender_id: msg.user_id,
        sender_name: msg.user_name || 'Anonymous',
        content: msg.text,
        timestamp: msg.created_at
      }));
      setMessages(mapped);
    });

    socket.on('chat:message', (msg: any) => {
      const mapped: ChatMessage = {
        id: msg.id || msg._id,
        sender_id: msg.user_id,
        sender_name: msg.user_name || 'Anonymous',
        content: msg.text,
        timestamp: msg.created_at
      };
      setMessages((prev) => [...prev, mapped]);
    });

    socket.on('error', (err) => {
      console.error('Chat Socket error:', err);
      if (typeof err === 'string') {
        setErrorCode(err);
      } else if (err && typeof err.message === 'string') {
        setErrorCode(err.message);
      }
    });

    return () => {
      // Only disconnect if we created it
      if (!externalSocket) {
        socket.disconnect();
      } else {
        // Clean up listeners only
        socket.off('connect');
        socket.off('disconnect');
        socket.off('chat:history');
        socket.off('chat:message');
        socket.off('error');
      }
      socketRef.current = null;
    };
  }, [liveClassId, externalSocket]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:message', { message: content });
    }
  }, [isConnected]);

  return {
    messages,
    isConnected,
    errorCode,
    sendMessage,
  };
};
