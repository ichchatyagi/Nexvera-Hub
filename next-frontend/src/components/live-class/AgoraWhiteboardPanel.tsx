'use client';

import 'regenerator-runtime/runtime';
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAgoraWhiteboard } from '@/hooks/useAgoraWhiteboard';
import { WhiteWebSdk } from 'white-web-sdk';
import { WhiteboardPanel } from '@/components/live-class/WhiteboardPanel';

interface AgoraWhiteboardPanelProps {
  liveClassId: string;
  isTeacher: boolean;
  userId?: string;
}

export const AgoraWhiteboardPanel: React.FC<AgoraWhiteboardPanelProps> = ({ liveClassId, isTeacher, userId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { config, isLoading, errorCode } = useAgoraWhiteboard(liveClassId);

  useEffect(() => {
    if (!config || !containerRef.current) return;

    let room: any = null;
    const whiteWebSdk = new WhiteWebSdk({
      appIdentifier: config.app_id,
      region: config.region as any,
    });

    const initWhiteboard = async () => {
      try {
        room = await whiteWebSdk.joinRoom({
          uuid: config.room_uuid,
          roomToken: config.room_token,
          uid: userId || Math.floor(Math.random() * 1000000).toString(),
          isWritable: isTeacher,
          disableDeviceInputs: !isTeacher,
        });

        if (containerRef.current) {
          room.bindHtmlElement(containerRef.current);
          if (isTeacher) {
            room.setMemberState({ currentApplianceName: 'pencil' });
          }
        }
      } catch (err) {
        console.error('Failed to initialize Agora whiteboard', err);
      }
    };

    initWhiteboard();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [config, isTeacher, userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-[2.5rem] border border-white/5">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (errorCode || !config) {
    // If Agora whiteboard is disabled/misconfigured, fall back to the built-in Socket.IO whiteboard
    // so classes still have a working collaboration surface.
    if (
      errorCode === 'AGORA_DISABLED' ||
      errorCode === 'AGORA_NOT_CONFIGURED' ||
      errorCode === 'WHITEBOARD_UNAVAILABLE'
    ) {
      return (
        <div className="h-full flex flex-col rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          <div className="px-6 py-3 bg-slate-900 border-b border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Agora whiteboard unavailable, using fallback whiteboard
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <WhiteboardPanel liveClassId={liveClassId} isTeacher={isTeacher} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-[2.5rem] border border-white/5">
        <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">
          Whiteboard unavailable
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-white rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
    >
      {/* Agora whiteboard will mount here */}
    </div>
  );
};
