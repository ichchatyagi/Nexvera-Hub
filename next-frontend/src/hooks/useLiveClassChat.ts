import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

export const useLiveClassChat = (liveClassId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!liveClassId) return;

    const token = getCookie('access_token') || localStorage.getItem('access_token');
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/ws/live-classes`;

    // Initialize socket
    const socket = io(apiUrl, {
      query: { token, liveClassId },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Classroom chat connected');
      setIsConnected(true);
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
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [liveClassId]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:message', { message: content });
    }
  }, [isConnected]);

  return {
    messages,
    isConnected,
    sendMessage,
  };
};
