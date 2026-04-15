import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, MessageSquareOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveClassChat, ChatMessage } from '@/hooks/useLiveClassChat';
import { useAuth } from '@/context/AuthContext';

interface ChatPanelProps {
  liveClassId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ liveClassId }) => {
  const { user } = useAuth();
  const { messages, isConnected, errorCode, sendMessage } = useLiveClassChat(liveClassId);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !isConnected || errorCode) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-blue-500" />
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Classroom Discourse</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${errorCode ? 'bg-red-500' : isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
            {errorCode === 'INTERACTIVE_FEATURES_DISABLED'
              ? 'Chat disabled for this session'
              : errorCode === 'CLASS_NOT_ACTIVE'
              ? 'Class is not active'
              : isConnected
              ? 'Real-time'
              : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <MessageSquareOff size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting interaction...</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 ml-1">
                    {msg.sender_name}
                  </span>
                )}
                <div 
                  className={`max-w-[85%] px-5 py-3 rounded-2xl text-xs font-medium leading-relaxed shadow-lg ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[8px] font-bold text-white/20 mt-2 uppercase">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        className="p-6 bg-black/20 border-t border-white/5 shrink-0"
      >
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!isConnected || !!errorCode}
            placeholder={
              errorCode 
                ? "Chat unavailable" 
                : isConnected 
                ? "Project a thought..." 
                : "Synchronizing..."
            }
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all group-hover:border-white/20 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected || !!errorCode}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:text-white/20"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};
