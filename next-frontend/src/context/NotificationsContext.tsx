"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/utils/socket';
import { useAuth } from './AuthContext';
import { notificationsService, Notification } from '@/services/notifications.service';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const loadIdRef = useRef(0);

  const open = () => setIsOpen(true);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = () => setIsOpen(prev => !prev);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    const currentLoadId = ++loadIdRef.current;
    
    try {
      const [resMy, count] = await Promise.all([
        notificationsService.listMy({ limit: 10, page: 1 }),
        notificationsService.getUnreadCount()
      ]);
      
      if (currentLoadId === loadIdRef.current) {
        setNotifications(resMy.data || []);
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Failed to refresh notifications', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    refresh();

    const token = getCookie('access_token') || localStorage.getItem('access_token');

    // Do not connect socket without a valid token — avoids auth errors on the WS handshake.
    if (!token) return;

    const apiUrl = getSocketUrl('/ws/notifications');
    
    const socket = io(apiUrl, {
      query: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => {
        const newArr = [notification, ...prev];
        return newArr.slice(0, 20);
      });
      if (notification.read_at == null) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, refresh]);

  const markRead = async (id: string) => {
    // Read current state synchronously before the updater so the check is deterministic.
    const wasUnread = notifications.some(n => n._id === id && n.read_at == null);

    setNotifications(prev =>
      prev.map(n =>
        n._id === id && n.read_at === null
          ? { ...n, read_at: new Date().toISOString() }
          : n
      )
    );

    // Decrement by exactly 1 — preserves server-truth for counts beyond the local slice.
    if (wasUnread) {
      setUnreadCount(c => Math.max(0, c - 1));
    }

    try {
      await notificationsService.markRead(id);
    } catch (err) {
      console.error('Failed to mark read', err);
      // Re-sync with server truth instead of trying to undo local state.
      try {
        const serverCount = await notificationsService.getUnreadCount();
        setUnreadCount(serverCount);
      } catch {
        // best-effort; leave the optimistic value in place
      }
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await notificationsService.markAllRead();
    } catch (err) {
      console.error('Failed to mark all read', err);
      // Re-sync with server truth on failure.
      try {
        const serverCount = await notificationsService.getUnreadCount();
        setUnreadCount(serverCount);
      } catch {
        // best-effort
      }
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, isOpen, open, close, toggle, refresh, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
