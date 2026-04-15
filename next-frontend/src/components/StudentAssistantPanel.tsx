"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  X, 
  Minus, 
  Maximize2, 
  Bot, 
  User, 
  Loader2, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { aiService, AiAssistantResponse } from '@/services/ai.service';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  actions?: { label: string; href: string }[];
}

interface StudentAssistantPanelProps {
  courseIdOrSlug?: string;
  lessonId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const StudentAssistantPanel: React.FC<StudentAssistantPanelProps> = ({ 
  courseIdOrSlug, 
  lessonId, 
  isOpen, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.getStudentAssistantReply({
        message: userMessage,
        courseIdOrSlug,
        lessonId
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.reply,
        actions: response.suggested_actions 
      }]);
    } catch (err: any) {
      console.error('AI Error:', err);
      setError('The Nexvera AI Node is currently unreachable or unconfigured.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col z-[9999] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-950 p-6 flex items-center justify-between text-white">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                   <Sparkles size={20} className="text-white" />
                </div>
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest leading-none mb-1">Nexvera AI</h3>
                   <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">Active Learning Assistant</span>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={18} />
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {messages.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Bot size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-tight mb-2">How can I help your journey today?</p>
                  <p className="text-[10px] font-medium max-w-[200px]">Ask about your current lesson, course structure, or next steps.</p>
               </div>
             )}

             {messages.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                       {msg.content}
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                         {msg.actions.map((action, j) => (
                           <Link 
                             key={j}
                             href={action.href}
                             className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-1"
                           >
                              {action.label} <ExternalLink size={10} />
                           </Link>
                         ))}
                      </div>
                    )}
                  </div>
               </div>
             ))}

             {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-slate-50 p-4 rounded-[1.5rem] rounded-tl-none border border-slate-100">
                     <Loader2 size={16} className="animate-spin text-blue-600" />
                  </div>
               </div>
             )}

             {error && (
               <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold leading-relaxed">{error}</p>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-slate-50">
             <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Nexvera AI..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-6 pr-14 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all active:scale-95"
                >
                   <Send size={16} />
                </button>
             </div>
             <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-[0.2em] mt-4">
                Powered by Nexvera Grounding Logic
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StudentAssistantPanel;
