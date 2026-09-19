import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Trash2, X, Bot, User as UserIcon, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import api from '../../api/client.js';
import { ChatMessage } from '../../types.js';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What is my attendance?",
    "When is my next DBMS class?",
    "What assignments are due this week?",
    "Show my latest notices.",
    "How many classes can I miss while maintaining 75% attendance?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      if (res.data.success && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        // Initial welcome message
        setMessages([
          {
            _id: 'welcome',
            userId: user?._id || '',
            role: 'model',
            message: `Hello **${user?.name}**! 👋 I'm your **CampusConnect AI Assistant**.\n\nI have secure access to your academic profile and timetable. You can ask me questions about your **attendance**, **upcoming classes**, **assignments**, **grades**, or **notices**!`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const query = text || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      _id: `u_${Date.now()}`,
      userId: user?._id || '',
      role: 'user',
      message: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query.trim() });
      if (res.data.success) {
        const modelMsg: ChatMessage = {
          _id: `m_${Date.now()}`,
          userId: user?._id || '',
          role: 'model',
          message: res.data.message,
          timestamp: res.data.timestamp || new Date().toISOString()
        };
        setMessages(prev => [...prev, modelMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        _id: `err_${Date.now()}`,
        userId: user?._id || '',
        role: 'model',
        message: err.response?.data?.message || "Sorry, I couldn't reach the campus AI service. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete('/ai/history');
      setMessages([
        {
          _id: 'cleared',
          userId: user?._id || '',
          role: 'model',
          message: 'Chat history cleared. How can I help you today?',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 md:p-6 pointer-events-none">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      <div className="pointer-events-auto relative w-full max-w-lg h-[92vh] sm:h-[86vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-5 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">CampusConnect AI</h3>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-white/80">
                Grounding with your real-time academic records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isModel = m.role === 'model';
            return (
              <div
                key={m._id}
                className={`flex items-start gap-2.5 ${isModel ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    isModel
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isModel ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isModel
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                      : 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {m.message}
                  </div>
                  <span
                    className={`block text-[9px] mt-1.5 ${
                      isModel ? 'text-slate-400' : 'text-indigo-200 text-right'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Checking your academic records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips */}
        {messages.length < 4 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq)}
                  disabled={loading}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left"
                >
                  <span>{sq}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about attendance, timetable, assignments..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            CampusConnect AI answers using verified university records.
          </p>
        </div>
      </div>
    </div>
  );
};
