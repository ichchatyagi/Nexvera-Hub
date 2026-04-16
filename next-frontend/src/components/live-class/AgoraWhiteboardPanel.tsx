'use client';

import 'regenerator-runtime/runtime';
import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2, Pencil, Eraser, MousePointer2,
  Trash2, Download, Minus, Plus, Circle,
} from 'lucide-react';
import { useAgoraWhiteboard } from '@/hooks/useAgoraWhiteboard';
import { WhiteWebSdk } from 'white-web-sdk';
import { WhiteboardPanel } from '@/components/live-class/WhiteboardPanel';

interface AgoraWhiteboardPanelProps {
  liveClassId: string;
  isTeacher: boolean;
  userId?: string;
  variant?: 'panel' | 'stage';
}

// white-web-sdk appliance names (v2.x ApplianceNames enum values)
type Appliance = 'pencil' | 'eraser' | 'selector' | 'rectangle' | 'ellipse' | 'straight' | 'text';

const COLORS = [
  { label: 'White',  hex: '#FFFFFF' },
  { label: 'Black',  hex: '#1E1E1E' },
  { label: 'Blue',   hex: '#2563EB' },
  { label: 'Cyan',   hex: '#06B6D4' },
  { label: 'Red',    hex: '#EF4444' },
  { label: 'Orange', hex: '#F97316' },
  { label: 'Yellow', hex: '#EAB308' },
  { label: 'Green',  hex: '#22C55E' },
];

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export const AgoraWhiteboardPanel: React.FC<AgoraWhiteboardPanelProps> = ({
  liveClassId,
  isTeacher,
  userId,
  variant = 'panel',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep a ref to the live room so toolbar handlers always have the latest value
  // without stale-closure problems.
  const roomRef = useRef<any>(null);

  const { config, isLoading, errorCode } = useAgoraWhiteboard(liveClassId);

  // ── Toolbar UI state ─────────────────────────────────────────────────────
  const [tool,    setTool]    = useState<Appliance>('pencil');
  const [color,   setColor]   = useState<string>('#1E1E1E');
  const [strokeW, setStrokeW] = useState<number>(4);
  const [saving,  setSaving]  = useState(false);

  // Mirror toolbar state into refs so handlers read fresh values at call time
  // without needing to be stable callbacks.
  const toolRef    = useRef<Appliance>('pencil');
  const colorRef   = useRef<string>('#1E1E1E');
  const strokeWRef = useRef<number>(4);
  const roomInstanceIdRef = useRef(0);

  // ── Direct setMemberState helper (reads from refs, never stale) ───────────
  // Calling this with only the changed fields; white-web-sdk merges state.
  function applyMemberState(patch: {
    appliance?: Appliance;
    color?: string;
    strokeWidth?: number;
  }) {
    const room = roomRef.current;
    if (!room) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Whiteboard] applyMemberState: room not ready (instanceId: ${roomInstanceIdRef.current})`);
      }
      return;
    }
    const state: Record<string, unknown> = {};
    if (patch.appliance !== undefined) {
      state.currentApplianceName = patch.appliance;
    }
    if (patch.color !== undefined) {
      state.strokeColor = hexToRgb(patch.color);
    }
    if (patch.strokeWidth !== undefined) {
      state.strokeWidth = patch.strokeWidth;
    }
    const next = room.setMemberState(state);
    if (process.env.NODE_ENV === 'development') {
      // Helpful when diagnosing "tool UI != actual appliance" issues.
      console.log(`[Whiteboard] applyMemberState (instanceId: ${roomInstanceIdRef.current})`, state, '=>', next?.currentApplianceName);
    }
  }

  // ── Toolbar handlers (onPointerDown for immediate effect) ──
  function handleToolChange(e: React.PointerEvent | React.MouseEvent, t: Appliance) {
    e.stopPropagation();
    e.preventDefault();
    toolRef.current = t;
    setTool(t);
    applyMemberState({ appliance: t });
  }

  function handleColorChange(e: React.PointerEvent | React.MouseEvent | React.ChangeEvent, hex: string) {
    e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    colorRef.current = hex;
    setColor(hex);
    applyMemberState({ color: hex });
  }

  function handleSizeChange(e: React.PointerEvent | React.MouseEvent, delta: number) {
    e.stopPropagation();
    e.preventDefault();
    const next = Math.min(32, Math.max(1, strokeWRef.current + delta));
    strokeWRef.current = next;
    setStrokeW(next);
    applyMemberState({ strokeWidth: next });
  }

  function handleClearBoard(e: React.MouseEvent) {
    e.stopPropagation();
    if (roomRef.current) {
      roomRef.current.cleanCurrentScene();
    }
  }

  async function handleScreenshot(e: React.MouseEvent) {
    e.stopPropagation();
    if (!roomRef.current || saving) return;
    setSaving(true);
    try {
      const scenePath = roomRef.current.state?.sceneState?.scenePath ?? '/';
      const dataUrl: string = await roomRef.current.generateScreenshot(scenePath, 1280, 720);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `whiteboard-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error('[Whiteboard] Screenshot failed:', err);
    } finally {
      setSaving(false);
    }
  }

  // ── Whiteboard init / teardown ────────────────────────────────────────────
  useEffect(() => {
    if (!config || !containerRef.current) return;

    roomInstanceIdRef.current += 1;
    const currentInitId = roomInstanceIdRef.current;
    let isCancelled = false;
    let room: any = null;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Whiteboard] init start (id: ${currentInitId})`, {
        room_uuid: config.room_uuid,
        isTeacher,
      });
    }

    const sdk = new WhiteWebSdk({
      appIdentifier: config.app_id,
      region: config.region as any,
    });

    async function initWhiteboard() {
      try {
        const joinedRoom = await sdk.joinRoom({
          uuid:                config.room_uuid,
          roomToken:           config.room_token,
          uid:                 userId || String(Math.floor(Math.random() * 1_000_000)),
          isWritable:          isTeacher,
          disableDeviceInputs: !isTeacher,
        });

        if (isCancelled || currentInitId !== roomInstanceIdRef.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Whiteboard] join resolved but stale/cancelled (id: ${currentInitId}), cleaning up...`);
          }
          joinedRoom.bindHtmlElement(null);
          joinedRoom.disconnect();
          return;
        }

        room = joinedRoom;
        roomRef.current = room;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Whiteboard] join resolved (id: ${currentInitId}, uuid: ${room.uuid})`);
        }

        if (containerRef.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Whiteboard] bindHtmlElement (id: ${currentInitId})`);
          }
          room.bindHtmlElement(containerRef.current);

          // Set the initial tool / color / size immediately after binding
          if (isTeacher) {
            room.setMemberState({
              currentApplianceName: toolRef.current,
              strokeColor:          hexToRgb(colorRef.current),
              strokeWidth:          strokeWRef.current,
            });
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(`[Whiteboard] Failed to initialize Agora whiteboard (id: ${currentInitId})`, err);
        }
      }
    }

    initWhiteboard();

    return () => {
      isCancelled = true;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Whiteboard] cleanup (id: ${currentInitId})`);
      }
      if (room) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Whiteboard] disconnect (id: ${currentInitId}, uuid: ${room.uuid})`);
        }
        room.bindHtmlElement(null);
        room.disconnect();
      }
      if (roomRef.current === room) {
        roomRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isTeacher, userId]);

  // Ensure the SDK sees the *latest* selected tool at gesture start.
  // Some versions/inputs can begin a stroke at pointer-down before UI events
  // (or remote state) have fully settled; enforcing on canvas-down fixes that.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isTeacher) return;

    const enforceToolAtGestureStart = () => {
      const room = roomRef.current;
      if (!room) return;
      const desired = toolRef.current;
      const current = room.state?.memberState?.currentApplianceName;
      if (current !== desired) {
        const next = room.setMemberState({ currentApplianceName: desired });
        if (process.env.NODE_ENV === 'development') {
          console.log('[Whiteboard] enforce tool at down', { current, desired, next: next?.currentApplianceName });
        }
      }
    };

    // Capture-phase so it runs before the SDK's bubble listeners on the bound element.
    el.addEventListener('pointerdown', enforceToolAtGestureStart, true);
    el.addEventListener('mousedown', enforceToolAtGestureStart, true);

    return () => {
      el.removeEventListener('pointerdown', enforceToolAtGestureStart, true);
      el.removeEventListener('mousedown', enforceToolAtGestureStart, true);
    };
  }, [isTeacher]);

  if (isLoading) {
    return (
      <div
        className={
          variant === 'stage'
            ? 'flex items-center justify-center h-full bg-white transition-colors duration-500'
            : 'flex items-center justify-center h-full bg-slate-900 rounded-[2.5rem] border border-white/5 transition-colors duration-500'
        }
      >
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (errorCode || !config) {
    if (
      errorCode === 'AGORA_DISABLED' ||
      errorCode === 'AGORA_NOT_CONFIGURED' ||
      errorCode === 'WHITEBOARD_UNAVAILABLE'
    ) {
      return (
        <div
          className={
            variant === 'stage'
              ? 'h-full flex flex-col'
              : 'h-full flex flex-col rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl'
          }
        >
          {variant !== 'stage' && (
            <div className="px-6 py-3 bg-slate-900 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Agora whiteboard unavailable — using fallback
              </p>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <WhiteboardPanel
              liveClassId={liveClassId}
              isTeacher={isTeacher}
              variant={variant}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={
          variant === 'stage'
            ? 'flex items-center justify-center h-full bg-white'
            : 'flex items-center justify-center h-full bg-slate-900 rounded-[2.5rem] border border-white/5'
        }
      >
        <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">
          Whiteboard unavailable
        </p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      className={
        variant === 'stage'
          ? 'flex-1 w-full h-full flex flex-col bg-white overflow-hidden'
          : 'flex-1 w-full h-full flex flex-col rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-white'
      }
    >

      {/* Teacher toolbar — rendered OUTSIDE and above the canvas div */}
      {isTeacher && (
        <div
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-white/5 shrink-0 flex-wrap z-10"
          // Stop ALL pointer and mouse events from reaching the whiteboard canvas below
          onPointerDown={e => e.stopPropagation()}
          onPointerMove={e => e.stopPropagation()}
          onPointerUp={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onMouseMove={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
        >
          {/* ── Tools ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {([
              { id: 'selector'  as Appliance, icon: <MousePointer2 size={15} />, label: 'Select'    },
              { id: 'pencil'    as Appliance, icon: <Pencil          size={15} />, label: 'Pen'       },
              { id: 'text'      as Appliance, icon: <span className="font-serif font-bold text-sm">T</span>, label: 'Text' },
              { id: 'eraser'    as Appliance, icon: <Eraser          size={15} />, label: 'Eraser'    },
            ] as const).map(({ id, icon, label }) => (
              <button
                key={id}
                title={label}
                type="button"
                onPointerDownCapture={e => handleToolChange(e, id)}
                onClick={e => handleToolChange(e, id)}
                className={`p-2 rounded-lg transition-all select-none ${
                  tool === id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* ── Shapes ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {([
              { id: 'rectangle' as Appliance, icon: <div className="w-3.5 h-3 border-2 border-current rounded-sm" />, label: 'Rectangle' },
              { id: 'ellipse'   as Appliance, icon: <div className="w-3.5 h-3.5 border-2 border-current rounded-full" />, label: 'Circle'    },
              { id: 'straight'  as Appliance, icon: <div className="w-3.5 h-0.5 bg-current rotate-45" />, label: 'Line'      },
            ] as const).map(({ id, icon, label }) => (
              <button
                key={id}
                title={label}
                type="button"
                onPointerDownCapture={e => handleToolChange(e, id)}
                onClick={e => handleToolChange(e, id)}
                className={`p-2 rounded-lg transition-all select-none ${
                  tool === id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* ── Stroke size ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1">
            <button
              type="button"
              title="Decrease size"
              onPointerDownCapture={e => handleSizeChange(e, -1)}
              onClick={e => handleSizeChange(e, -1)}
              className="p-1 text-white/50 hover:text-white transition-colors select-none"
            >
              <Minus size={12} />
            </button>
            <span className="text-[11px] font-black text-white/70 min-w-[18px] text-center select-none">
              {strokeW}
            </span>
            <button
              type="button"
              title="Increase size"
              onPointerDownCapture={e => handleSizeChange(e, +1)}
              onClick={e => handleSizeChange(e, +1)}
              className="p-1 text-white/50 hover:text-white transition-colors select-none"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="w-px h-6 bg-white/10" />

          {/* ── Color palette ────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLORS.map(({ label, hex }) => (
              <button
                key={hex}
                type="button"
                title={label}
                onPointerDownCapture={e => handleColorChange(e, hex)}
                onClick={e => handleColorChange(e, hex)}
                style={{ backgroundColor: hex }}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 select-none ${
                  color === hex ? 'border-blue-400 scale-110' : 'border-white/20'
                }`}
              />
            ))}

            {/* Custom color picker */}
            <label
              title="Custom color"
              className="relative cursor-pointer"
              onPointerDown={e => e.stopPropagation()}
            >
              <Circle size={20} className="text-white/30 hover:text-white/60 transition-colors" strokeWidth={2} />
              <input
                type="color"
                value={color}
                onPointerDown={e => e.stopPropagation()}
                onChange={(e) => handleColorChange(e, e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>

          <div className="flex-1" />

          {/* ── Clear board ─────────────────────────────────────────────── */}
          <button
            type="button"
            title="Clear board"
            onMouseDown={e => e.stopPropagation()}
            onClick={handleClearBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-[10px] font-black uppercase tracking-widest select-none"
          >
            <Trash2 size={13} />
            Clear
          </button>

          {/* ── Save screenshot ─────────────────────────────────────────── */}
          <button
            type="button"
            title="Save screenshot"
            onMouseDown={e => e.stopPropagation()}
            onClick={handleScreenshot}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-40 select-none"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {/* Whiteboard canvas — white-web-sdk mounts here */}
      <div
        ref={containerRef}
        className="flex-1 w-full min-h-0 bg-white"
      />
    </div>
  );
};
