"use client";

import React, { useState, useRef, useEffect } from "react";
import { VideoOverlay } from "./VideoOverlay";
import { LayoutState } from "@/hooks/useLiveClassLayout";
import type { ILocalVideoTrack, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";
import dynamic from "next/dynamic";
import { WhiteboardPanel } from "./WhiteboardPanel";

const AgoraWhiteboardPanel = dynamic(
  () =>
    import("./AgoraWhiteboardPanel").then((mod) => mod.AgoraWhiteboardPanel),
  { ssr: false },
);

type RemoteStream = { 
  uid: string; 
  videoTrack?: IRemoteVideoTrack | null; 
  audioTrack?: IRemoteAudioTrack | null;
};

interface ClassroomStageProps {
  liveClassId: string;
  isTeacher: boolean;
  localVideoTrack: ILocalVideoTrack | null;
  remoteStreams: RemoteStream[];
  layoutState: LayoutState | null;
  useAgoraWhiteboard: boolean;
  whiteboardEnabled: boolean;
  userId?: string;
  onLayoutUpdate: (next: { x: number; y: number; w: number; h: number }) => void;
  onLayoutPreview?: (next: {
    x: number;
    y: number;
    w: number;
    h: number;
  }) => void;
}

export function ClassroomStage({
  liveClassId,
  isTeacher,
  localVideoTrack,
  remoteStreams,
  layoutState,
  useAgoraWhiteboard,
  whiteboardEnabled,
  userId,
  onLayoutUpdate,
  onLayoutPreview,
}: ClassroomStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // Default rect if no layout state yet
  const defaultRect = {
    x: 0.7,
    y: 0.68,
    w: 0.28,
    h: (0.28 * 9) / 16,
  };

  const currentRect = layoutState?.video || defaultRect;

  const TOP_SAFE = 72;
  const BOTTOM_SAFE = 120;
  const SIDE_SAFE = 16;

  const clampToSafeZones = (raw: {
    x: number;
    y: number;
    w: number;
    h: number;
  }) => {
    if (!isTeacher || stageSize.width === 0 || stageSize.height === 0)
      return raw;

    const clamp = (n: number, min: number, max: number) =>
      Math.min(Math.max(n, min), max);

    // 1) Compute usable pixel area
    const usableW = Math.max(1, stageSize.width - 2 * SIDE_SAFE);
    const usableH = Math.max(1, stageSize.height - TOP_SAFE - BOTTOM_SAFE);

    // 2) Convert raw normalized to px, clamp to usable size
    const pxW = Math.min(raw.w * stageSize.width, usableW);
    const pxH = Math.min(raw.h * stageSize.height, usableH);

    // 3) Position clamping (in px) using the (potentially shrunk) pxW/pxH
    const minX = SIDE_SAFE;
    const maxX = Math.max(minX, stageSize.width - SIDE_SAFE - pxW);
    const minY = TOP_SAFE;
    const maxY = Math.max(minY, stageSize.height - BOTTOM_SAFE - pxH);

    const clampedXpx = clamp(raw.x * stageSize.width, minX, maxX);
    const clampedYpx = clamp(raw.y * stageSize.height, minY, maxY);

    // 4) Return normalized results
    return {
      x: clampedXpx / stageSize.width,
      y: clampedYpx / stageSize.height,
      w: pxW / stageSize.width,
      h: pxH / stageSize.height,
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observe = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setStageSize({ width, height });
      }
    });

    observe.observe(containerRef.current);
    
    // Initial size
    const rect = containerRef.current.getBoundingClientRect();
    setStageSize({ width: rect.width, height: rect.height });

    return () => observe.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden"
    >
      {/* Base Layer: Whiteboard (Full Bleed) */}
      <div className="absolute inset-0 z-0">
        {!whiteboardEnabled ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/20">
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Whiteboard Disabled</p>
             <p className="text-[9px] mt-2 opacity-50">Feature not enabled for this session</p>
          </div>
        ) : useAgoraWhiteboard ? (
          <AgoraWhiteboardPanel
            liveClassId={liveClassId}
            isTeacher={isTeacher}
            variant="stage"
            userId={userId}
          />
        ) : (
          <WhiteboardPanel
            liveClassId={liveClassId}
            isTeacher={isTeacher}
            variant="stage"
          />
        )}
      </div>

      {/* Overlay Layer: Video (Floating) */}
      {stageSize.width > 0 && stageSize.height > 0 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <VideoOverlay
            isTeacher={isTeacher}
            localVideoTrack={localVideoTrack}
            remoteStreams={remoteStreams}
            stageWidth={stageSize.width}
            stageHeight={stageSize.height}
            rect={currentRect}
            onRectCommit={(next) => onLayoutUpdate(clampToSafeZones(next))}
            onRectPreview={(next) => onLayoutPreview?.(clampToSafeZones(next))}
          />
        </div>
      )}
    </div>
  );
}
