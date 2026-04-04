"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Construction, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LiveClassDetailStub({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="px-12 pb-24 h-full flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-sm max-w-2xl text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-blue-600">
           <Construction size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-4">
           Session Node <span className="text-blue-600">Under Construction</span>
        </h1>
        
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
           Live Class Identity: {params.id}
        </p>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-12">
           The detailed telemetry and management interface for individual live classes is scheduled for Phase 5 implementation. Currently, the system supports global monitoring only.
        </p>
        
        <button 
           onClick={() => router.back()}
           className="px-12 py-5 bg-slate-950 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-4 mx-auto shadow-2xl shadow-slate-900/20 active:scale-95"
        >
           <ChevronLeft size={16} />
           Return to Command Center
        </button>
      </div>
    </div>
  );
}
