import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Bot, User, Sparkles, Brain, Bell, FileText, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelType, setModelType] = useState<'gemini' | 'perplexity' | 'local'>('local');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          conversationId: conversationId || 'default-chat',
          userId: 'default-user',
          modelType
        })
      });

      const data = await response.json();
      
      if (data.error) {
        let displayError = data.error;
        if (data.error.includes('Gemini API key is missing')) {
          displayError = "Gemini API anahtarı bulunamadı. Lütfen 'Secrets' panelinden GEMINI_API_KEY değerini ayarlayın ve 'Apply changes' butonuna basın.";
        } else if (data.error.includes('Perplexity API anahtarı eksik')) {
          displayError = "Perplexity API anahtarı bulunamadı. Lütfen 'Secrets' panelinden PERPLEXITY_API_KEY değerini ayarlayın.";
        } else if (data.error.includes('Unauthorized') || data.error.includes('Yetkilendirme Hatası')) {
          displayError = "API anahtarı geçersiz (Unauthorized). Lütfen anahtarınızı kontrol edin ve doğru olduğundan emin olun.";
        }

        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: `⚠️ ${displayError}`,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      } else {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "⚠️ Bağlantı hatası: AI servisine ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-bottom border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nexus AI</h3>
                    <p className="text-xs text-cyan-400/70 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Çevrimiçi • {modelType === 'local' ? 'Otonom Yerel AI' : modelType === 'perplexity' ? 'Arama Odaklı' : 'Gemini Pro'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Brain size={18} /></button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Bell size={18} /></button>
                </div>
              </div>
              
              {/* Model Selector */}
              <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setModelType('local')}
                  className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${modelType === 'local' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  LOCAL AI
                </button>
                <button 
                  onClick={() => setModelType('gemini')}
                  className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${modelType === 'gemini' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  GEMINI
                </button>
                <button 
                  onClick={() => setModelType('perplexity')}
                  className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${modelType === 'perplexity' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  PERPLEXITY
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Merhaba! Ben Nexus AI</h4>
                    <p className="text-sm text-slate-400 mt-1">
                      Sisteminiz hakkında sorular sorabilir, rapor isteyebilir veya işlem yapmamı söyleyebilirsiniz.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <button onClick={() => setMessage('Stok durumunu özetle')} className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 text-left border border-white/5">"Stok durumunu özetle"</button>
                    <button onClick={() => setMessage('Kritik seviyedeki ürünler neler?')} className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 text-left border border-white/5">"Kritik seviyedeki ürünler neler?"</button>
                    <button onClick={() => setMessage('Bugünkü randevularımı hatırlat')} className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 text-left border border-white/5">"Bugünkü randevularımı hatırlat"</button>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-cyan-400'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-900/50">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bir şeyler sorun..."
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <div className="flex gap-2">
                  <button type="button" className="text-slate-500 hover:text-slate-400"><FileText size={14} /></button>
                  <button type="button" className="text-slate-500 hover:text-slate-400"><Sparkles size={14} /></button>
                </div>
                <span className="text-[10px] text-slate-600">Nexus AI v2.5 • {modelType.toUpperCase()} MODE</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
