"use client";

import React, { useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import type { ILocalVideoTrack, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import { User } from "lucide-react";

type RemoteStream = { 
  uid: string; 
  videoTrack?: IRemoteVideoTrack | null; 
  audioTrack?: IRemoteAudioTrack | null;
};

export interface VideoOverlayProps {
  isTeacher: boolean;
  localVideoTrack: ILocalVideoTrack | null;
  remoteStreams: RemoteStream[];

  // stage pixel size (used to convert normalized <-> px)
  stageWidth: number;
  stageHeight: number;

  // normalized rect from layout state (0..1)
  rect: { x: number; y: number; w: number; h: number };

  onRectCommit: (next: { x: number; y: number; w: number; h: number }) => void; // normalized output
  onRectPreview?: (next: { x: number; y: number; w: number; h: number }) => void; // throttled preview
  lockAspect?: boolean;
}

export function VideoOverlay({
  isTeacher,
  localVideoTrack,
  remoteStreams,
  stageWidth,
  stageHeight,
  rect,
  onRectCommit,
  onRectPreview,
  lockAspect = true,
}: VideoOverlayProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = React.useState(false);
  const [localRectPx, setLocalRectPx] = React.useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const lastEmitRef = useRef<number>(0);

  // Determine which track to play
  // If isTeacher, we show our local track.
  // Otherwise, we show the first remote track (assuming it's the instructor).
  const activeTrack = isTeacher
    ? localVideoTrack
    : remoteStreams.length > 0
    ? remoteStreams[0].videoTrack
    : null;

  useEffect(() => {
    if (activeTrack && videoRef.current) {
      activeTrack.play(videoRef.current);
      return () => activeTrack.stop();
    }
  }, [activeTrack]);

  const throttleEmit = (next: {
    x: number;
    y: number;
    w: number;
    h: number;
  }) => {
    const now = Date.now();
    if (now - lastEmitRef.current > 100) {
      onRectPreview?.(next);
      lastEmitRef.current = now;
    }
  };

  // While interacting, we use localRectPx (local pixels).
  // Otherwise, we use rect (normalized props) converted to pixels.
  const position = isInteracting
    ? { x: localRectPx.x, y: localRectPx.y }
    : { x: rect.x * stageWidth, y: rect.y * stageHeight };

  const size = isInteracting
    ? { width: localRectPx.w, height: localRectPx.h }
    : { width: rect.w * stageWidth, height: rect.h * stageHeight };

  return (
    <Rnd
      bounds="parent"
      minWidth={240}
      minHeight={135}
      lockAspectRatio={isTeacher && lockAspect ? 16 / 9 : false}
      position={position}
      size={size}
      enableResizing={isTeacher}
      disableDragging={!isTeacher}
      dragHandleClassName="video-drag-handle"
      onDragStart={() => {
        setIsInteracting(true);
        setLocalRectPx({
          x: rect.x * stageWidth,
          y: rect.y * stageHeight,
          w: rect.w * stageWidth,
          h: rect.h * stageHeight,
        });
      }}
      onDrag={(e, d) => {
        setLocalRectPx((prev) => ({ ...prev, x: d.x, y: d.y }));
        throttleEmit({
          x: d.x / stageWidth,
          y: d.y / stageHeight,
          w: rect.w,
          h: rect.h,
        });
      }}
      onDragStop={(e, d) => {
        setIsInteracting(false);
        const nextX = d.x / stageWidth;
        const nextY = d.y / stageHeight;
        onRectCommit({ ...rect, x: nextX, y: nextY });
      }}
      onResizeStart={() => {
        setIsInteracting(true);
        setLocalRectPx({
          x: rect.x * stageWidth,
          y: rect.y * stageHeight,
          w: rect.w * stageWidth,
          h: rect.h * stageHeight,
        });
      }}
      onResize={(e, direction, ref, delta, pos) => {
        const nextW = ref.offsetWidth;
        const nextH = ref.offsetHeight;
        setLocalRectPx({ x: pos.x, y: pos.y, w: nextW, h: nextH });
        throttleEmit({
          x: pos.x / stageWidth,
          y: pos.y / stageHeight,
          w: nextW / stageWidth,
          h: nextH / stageHeight,
        });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setIsInteracting(false);
        const nextW = ref.offsetWidth / stageWidth;
        const nextH = ref.offsetHeight / stageHeight;
        const nextX = pos.x / stageWidth;
        const nextY = pos.y / stageHeight;
        onRectCommit({ x: nextX, y: nextY, w: nextW, h: nextH });
      }}
      style={{
        zIndex: 50,
        transition: isInteracting
          ? "none"
          : "transform 250ms ease, width 250ms ease, height 250ms ease",
      }}
      className="group pointer-events-auto"
    >
      <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl flex flex-col pointer-events-auto">
        {/* Drag Handle Overlay */}
        {isTeacher && (
          <div className="video-drag-handle absolute top-0 left-0 right-0 h-8 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex items-center px-3 z-10">
            <div className="w-8 h-1 bg-white/30 rounded-full mx-auto" />
          </div>
        )}

        <div className="flex-1 relative">
          <div ref={videoRef} className="w-full h-full" />

          {!activeTrack && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <User className="text-white/20" size={24} />
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                Instructor Channel Active
              </span>
            </div>
          )}

          {/* Role Badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 pointer-events-none">
            <span className="text-[8px] font-black text-white/60 uppercase tracking-tighter">
              {isTeacher ? "Instructor (You)" : "Instructor"}
            </span>
          </div>
        </div>
      </div>
    </Rnd>
  );
}
