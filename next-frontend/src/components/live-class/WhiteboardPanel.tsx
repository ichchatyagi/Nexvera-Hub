"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';
import { 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Download, 
  Undo,
  Trash2,
  Brush,
  Palette
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Point {
  x: number;
  y: number;
}

interface DrawEvent {
  points: Point[];
  color: string;
  width: number;
}

interface WhiteboardPanelProps {
  liveClassId: string;
  isTeacher?: boolean;
}

export const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({ liveClassId, isTeacher = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6'); // Blue
  const [brushSize, setBrushSize] = useState(4);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  
  const colors = [
    '#000000', // Black
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f59e0b', // Orange
    '#a855f7', // Purple
  ];

  const drawPath = useCallback((path: DrawEvent, ctx: CanvasRenderingContext2D) => {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
  }, []);

  useEffect(() => {
    const token = getCookie('access_token');
    const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/ws/live-classes`, {
      query: { token, liveClassId },
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('whiteboard:draw', (data: DrawEvent) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) drawPath(data, ctx);
    });

    socket.on('whiteboard:history', (history: DrawEvent[]) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        history.forEach(path => drawPath(path, ctx));
      }
    });

    socket.on('whiteboard:clear', () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    socket.on('error', (err) => {
      console.error('Whiteboard Socket error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [liveClassId, drawPath]);

  // Handle Resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const { width, height } = container.getBoundingClientRect();
        // Preserve drawing on resize requires a temp canvas
        const tempImage = canvas.toDataURL();
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = tempImage;
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTeacher) return;
    e.preventDefault();
    const point = getCoordinates(e);
    if (!point) return;
    
    setIsDrawing(true);
    setCurrentPoints([point]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const point = getCoordinates(e);
    if (!point) return;

    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);

    // Dynamic rendering of current path
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && newPoints.length > 1) {
      drawPath({ points: newPoints.slice(-2), color, width: brushSize }, ctx);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length > 1) {
      const event: DrawEvent = {
        points: currentPoints,
        color,
        width: brushSize
      };
      socketRef.current?.emit('whiteboard:draw', event);
    }
    setCurrentPoints([]);
  };

  const clearBoard = () => {
    if (!isTeacher) return;
    if (confirm('Clear entire whiteboard?')) {
      socketRef.current?.emit('whiteboard:clear');
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `whiteboard-${liveClassId}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Whiteboard exported as PNG');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl">
      {/* Toolbar */}
      {isTeacher && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-2 bg-black/60 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center gap-3 z-20 shadow-2xl">
        <div className="flex items-center gap-1.5 px-3 border-r border-white/10">
          {colors.map(c => (
            <button 
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent shadow-inner'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-4 px-3 border-r border-white/10">
           <Brush size={16} className="text-white/40" />
           <input 
             type="range" 
             min="1" 
             max="20" 
             value={brushSize} 
             onChange={(e) => setBrushSize(parseInt(e.target.value))}
             className="w-20 accent-blue-600"
           />
        </div>

        <div className="flex items-center gap-1 pr-2">
          <button onClick={clearBoard} className="p-2 text-white/40 hover:text-red-500 transition-colors" title="Clear All">
             <Trash2 size={20} />
          </button>
          <button onClick={downloadCanvas} className="p-2 text-white/40 hover:text-blue-500 transition-colors" title="Download">
             <Download size={20} />
          </button>
        </div>
      </div>
    )}

      {/* Status Overlay */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full z-20">
         <div className={`w-2 h-2 rounded-full ${isTeacher ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
           {isTeacher ? 'Collaborative Node Active' : 'Watching Instructor\'s Whiteboard'}
         </span>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className={`flex-1 relative bg-white ${isTeacher ? 'cursor-crosshair' : 'cursor-default'}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={isTeacher ? startDrawing : undefined}
          onMouseMove={isTeacher ? draw : undefined}
          onMouseUp={isTeacher ? stopDrawing : undefined}
          onMouseOut={isTeacher ? stopDrawing : undefined}
          onTouchStart={isTeacher ? startDrawing : undefined}
          onTouchMove={isTeacher ? draw : undefined}
          onTouchEnd={isTeacher ? stopDrawing : undefined}
          className="absolute inset-0 block w-full h-full"
        />
      </div>
    </div>
  );
};
