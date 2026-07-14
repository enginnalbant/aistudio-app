import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Activity,
  Lightbulb,
  ArrowRight,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIFinanceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips
  const suggestedPrompts = [
    { text: 'Finansal sağlığımı özetler misin?', icon: <Activity size={12} className="text-focus-neon" /> },
    { text: 'Tasarruf oranımı nasıl artırabilirim?', icon: <TrendingUp size={12} className="text-emerald-400" /> },
    { text: 'En kritik harcamalarım hangileri?', icon: <AlertTriangle size={12} className="text-crit-vivid" /> },
    { text: 'Yatırım önerileri ve ipuçları ver.', icon: <Lightbulb size={12} className="text-nrg-sun" /> }
  ];

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Insert welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: 'Merhaba! Ben Apex AI Finans ve Stok Danışmanıyım. Bütçe verilerinizi, gelir/gider akışınızı ve stok durumunuzu analiz ederek size akıllı kararlar almanızda yardımcı olabilirim. Nasıl yardımcı olabilirim?',
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [messages]);

  // Compile context from localStorage to send to Gemini
  const compileContext = (): string => {
    try {
      const incomes = JSON.parse(localStorage.getItem('finance_incomes') || '[]');
      const expenses = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
      const investments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
      const debts = JSON.parse(localStorage.getItem('finance_debts') || '[]');
      const subscriptions = JSON.parse(localStorage.getItem('finance_subscriptions') || '[]');
      const savings = JSON.parse(localStorage.getItem('finance_savings') || '[]');

      let contextStr = 'KULLANICI BÜTÇE BİLGİLERİ:\n';
      contextStr += `- Toplam Gelir Kalemleri Sayısı: ${incomes.length}\n`;
      if (incomes.length > 0) {
        contextStr += `  Gelirler: ${incomes.map((i: any) => `${i.title} (₺${i.amount})`).join(', ')}\n`;
      }
      contextStr += `- Toplam Gider Kalemleri Sayısı: ${expenses.length}\n`;
      if (expenses.length > 0) {
        contextStr += `  Giderler: ${expenses.map((e: any) => `${e.title} (₺${e.amount} - ${e.category})`).join(', ')}\n`;
      }
      contextStr += `- Toplam Yatırımlar Değeri: ₺${investments.reduce((sum: number, i: any) => sum + Number(i.currentAmount || i.initialAmount || 0), 0)}\n`;
      contextStr += `- Toplam Borçlar Değeri: ₺${debts.reduce((sum: number, d: any) => sum + Number(d.remainingAmount || d.totalAmount || 0), 0)}\n`;
      contextStr += `- Aktif Abonelik Giderleri: ₺${subscriptions.reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0)}/aylık\n`;
      contextStr += `- Birikim Hedefleri: ${savings.map((s: any) => `${s.title} (${s.currentAmount}/${s.targetAmount})`).join(', ')}\n`;

      return contextStr;
    } catch (err) {
      return 'Kullanıcı bütçe verileri alınamadı.';
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          chatHistory: messages.slice(-10), // Send last 10 messages as history context
          context: compileContext()
        })
      });

      const data = await response.json();
      if (data.reply) {
        const botMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Yanıt alınamadı.');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: 'Üzgünüm, şu an sunucuya erişemiyorum. Lütfen internet bağlantınızı veya Gemini API anahtarınızı kontrol edin.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Sparkles Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-22 right-6 lg:bottom-6 lg:right-6 z-[1000] bg-gradient-to-r from-focus-main to-focus-neon text-white p-4 rounded-2xl shadow-[0_10px_40px_rgba(30,144,255,0.4)] border border-white/20 flex items-center gap-2 cursor-pointer"
      >
        <Sparkles className="animate-pulse" size={20} />
        <span className="text-xs font-display font-black tracking-widest uppercase hidden md:inline">APEX AI</span>
      </motion.button>

      {/* Slide-out Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: 'blur(0px)',
              height: isMinimized ? '60px' : '520px',
              width: '380px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 lg:bottom-22 lg:right-6 z-[1001] bg-neutral-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="p-4 bg-white/[0.04] border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-focus-main/20 border border-focus-main/40 flex items-center justify-center text-focus-neon">
                  <Bot size={16} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">APEX AI</h3>
                  <span className="text-[9px] font-mono text-focus-neon/80 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Çevrimiçi Danışman
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-text-secondary hover:text-white transition-colors cursor-pointer"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content Body (Visible only when not minimized) */}
            {!isMinimized && (
              <>
                {/* Message list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                        msg.sender === 'user' ? 'bg-focus-neon' : 'bg-white/5 border border-white/10'
                      }`}>
                        {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                      </div>
                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'bg-focus-main text-white rounded-tr-none'
                            : 'bg-white/[0.03] border border-white/5 text-white/95 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[8px] font-mono text-text-secondary opacity-60 block ${msg.sender === 'user' ? 'text-right' : ''}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex gap-2.5 max-w-[85%]">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                        <Bot size={12} />
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-focus-neon animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-focus-neon animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-focus-neon animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested prompts */}
                {messages.length === 1 && (
                  <div className="px-4 py-2 flex flex-wrap gap-2 bg-black/20 shrink-0">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 text-[10px] text-text-secondary hover:text-white transition-all cursor-pointer"
                      >
                        {prompt.icon}
                        <span>{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Input form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }}
                  className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2 shrink-0 items-center"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 bg-neutral-900/80 border border-white/5 focus:border-focus-neon focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-text-secondary/40"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="size-9 bg-focus-main hover:bg-focus-neon text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
