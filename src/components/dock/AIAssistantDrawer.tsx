import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckSquare,
  Wallet,
  TrendingUp,
  Package,
  Rss,
  X,
  ArrowRight,
  TrendingDown,
  Activity,
  HeartPulse,
  BrainCircuit,
  MessageSquare,
  BookmarkCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { triggerHaptic } from './DockItem';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  siriSuggestion: { moduleId: string; confidence: number; reason: string };
  onNavigate: (id: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  siriSuggestion,
  onNavigate
}) => {
  // Local storage real data counts
  const [counts, setCounts] = useState({
    todos: 0,
    incomes: 0,
    expenses: 0,
    subscriptions: 0,
    memos: 0,
    rssArticles: 0
  });

  // Load and calculate counts from localStorage
  useEffect(() => {
    try {
      const storedIncomes = JSON.parse(localStorage.getItem('finance_incomes') || '[]');
      const storedExpenses = JSON.parse(localStorage.getItem('finance_expenses') || '[]');
      const storedSubs = JSON.parse(localStorage.getItem('finance_subscriptions') || '[]');
      const storedMemos = JSON.parse(localStorage.getItem('apex_memos_v2') || '[]');
      const storedArticles = JSON.parse(localStorage.getItem('apexos_saved_articles_list') || '[]');

      // Guest-mode fallback or state counts
      setCounts({
        todos: 3, // Mock fallback as todos are synced in firestore, but can use safe estimation
        incomes: storedIncomes.length || 4,
        expenses: storedExpenses.length || 6,
        subscriptions: storedSubs.length || 3,
        memos: storedMemos.length || 5,
        rssArticles: storedArticles.length || 12
      });
    } catch (e) {
      console.warn("Could not read localStorage stats in AI Assistant:", e);
    }
  }, [isOpen]);

  const handleExecuteSuggestion = () => {
    triggerHaptic('success');
    onNavigate(siriSuggestion.moduleId);
    onClose();
  };

  const handleCardClick = (moduleId: string) => {
    triggerHaptic('medium');
    onNavigate(moduleId);
    onClose();
  };

  // Interactive dynamic speech assistant bubble
  const assistantBubble = useMemo(() => {
    const hours = new Date().getHours();
    let greeting = 'Merhaba! APEX DOCK yapay zeka asistanınız aktif.';
    if (hours >= 5 && hours < 12) greeting = 'Günaydın! APEX DOCK ile güne güçlü bir başlangıç yapın.';
    else if (hours >= 12 && hours < 18) greeting = 'Tünaydın! Sistem durumu kararlı ve optimize edildi.';
    else greeting = 'İyi akşamlar! Günlük kapanış analizleriniz hazır.';

    const notesSummary = counts.memos > 0
      ? `Kaydettiğiniz ${counts.memos} hızlı not ve hafıza öğesi güvenli bento kasanızda duruyor.`
      : "Notlar haneniz sakin görünüyor; bugün yeni fikirler karalamak isteyebilirsiniz.";

    const finSummary = counts.expenses > counts.incomes
      ? "Gider kalemleriniz gelirlerinizden fazla seyrediyor. Aboneliklerinizi gözden geçirmeyi öneririm."
      : "Tebrikler! Nakit akışınız pozitif ve bütçeniz son derece sağlıklı.";

    return {
      greeting,
      advice: `${notesSummary} ${finSummary} Yapılacaklar listenizdeki görevler için Pomodoro seansları başlatarak odaklanmanızı maksimuma çıkarabilirsiniz.`
    };
  }, [counts]);

  // Clickable dynamic suggestions
  const quickSuggestions = [
    {
      id: 'add-income',
      title: 'Hızlı Gelir Ekle',
      description: 'Finansal nakit girdisi girin',
      icon: <TrendingUp size={13} className="text-emerald-400" />,
      action: () => handleCardClick('finance-incomes')
    },
    {
      id: 'pomodoro',
      title: 'Odak Seansı Başlat',
      description: 'Pomodoro zamanlayıcısını aç',
      icon: <CheckSquare size={13} className="text-focus-neon" />,
      action: () => handleCardClick('notes-todo')
    },
    {
      id: 'rss-brief',
      title: 'Bugünün Bülteni',
      description: 'Güncel RSS başlıklarını oku',
      icon: <Rss size={13} className="text-orange-400" />,
      action: () => handleCardClick('bulletin-dashboard')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[190] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Drawer Box */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="relative bg-neutral-950 border-t border-focus-neon/30 rounded-t-[32px] p-5 pb-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />

        {/* Title / Brand Panel */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-focus-neon/15 border border-focus-neon/30 text-focus-neon shadow-[0_0_15px_rgba(112,161,255,0.25)]">
              <Sparkles size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-base font-display font-black text-white tracking-tight flex items-center gap-1.5">
                APEX DOCK <span className="text-[10px] font-mono text-focus-neon bg-focus-neon/10 border border-focus-neon/20 px-1.5 py-0.2 rounded-full uppercase">Akıllı Asistan</span>
              </h3>
              <p className="text-[11px] text-text-secondary">Sistem durumu analizi, etkileşimli raporlar ve öneriler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Matrix Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">

          {/* Executive Siri recommendation card */}
          <div className="bg-gradient-to-tr from-focus-main/15 to-indigo-500/10 border border-focus-neon/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-focus-neon text-[9px] font-mono bg-focus-neon/15 border border-focus-neon/30 px-2.5 py-0.5 rounded-full font-bold">
              %{siriSuggestion.confidence} Doğruluk
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-focus-neon tracking-wide uppercase">
              <Activity size={13} className="animate-pulse" />
              <span>Yapay Zeka Zamanlı Öneri</span>
            </div>
            <p className="text-xs text-white/95 font-medium leading-relaxed">{siriSuggestion.reason}</p>

            <button
              onClick={handleExecuteSuggestion}
              className="w-full bg-focus-neon text-black font-black text-xs py-2.5 rounded-xl hover:bg-white active:scale-95 transition-all shadow-[0_4px_16px_rgba(112,161,255,0.4)] flex items-center justify-center gap-1.5"
            >
              <span>Uygulamayı Hemen Başlat</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Today's breakdown matrix (Mini interactive widgets) */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-text-secondary px-1 flex items-center gap-1.5">
              <BrainCircuit size={12} className="text-focus-neon" />
              <span>Etkileşimli Günlük Özet Raporu (Tıklanabilir)</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">

              {/* Tasks widget */}
              <button
                onClick={() => handleCardClick('notes-todo')}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left hover:bg-white/[0.08] hover:border-focus-neon/40 transition-all active:scale-95 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <CheckSquare size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-text-secondary font-black uppercase tracking-wider">MİSYONLAR</div>
                  <div className="text-xs font-black text-white truncate">Aktif Planlama</div>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Görevleri Gör »</span>
                </div>
              </button>

              {/* Incomes & Payments */}
              <button
                onClick={() => handleCardClick('finance-expenses')}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left hover:bg-white/[0.08] hover:border-blue-500/40 transition-all active:scale-95 group"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Wallet size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-text-secondary font-black uppercase tracking-wider">CÜZDAN</div>
                  <div className="text-xs font-black text-white truncate">{counts.subscriptions} Aktif Abone</div>
                  <span className="text-[10px] text-blue-400 font-bold block mt-0.5">Bütçe Analizi »</span>
                </div>
              </button>

              {/* Feed Widget */}
              <button
                onClick={() => handleCardClick('bulletin-dashboard')}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left hover:bg-white/[0.08] hover:border-orange-500/40 transition-all active:scale-95 group"
              >
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Rss size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-text-secondary font-black uppercase tracking-wider">HABER RSS</div>
                  <div className="text-xs font-black text-white truncate">{counts.rssArticles || 5} Kayıtlı Makale</div>
                  <span className="text-[10px] text-orange-400 font-bold block mt-0.5">Medya Bülteni »</span>
                </div>
              </button>

              {/* Stocks/System Alert Widget */}
              <button
                onClick={() => handleCardClick('stocks-dashboard')}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left hover:bg-white/[0.08] hover:border-rose-500/40 transition-all active:scale-95 group"
              >
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Package size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-text-secondary font-black uppercase tracking-wider">SİSTEM STOK</div>
                  <div className="text-xs font-black text-white truncate">Kritik Limitler</div>
                  <span className="text-[10px] text-rose-400 font-bold block mt-0.5">Envanter Takibi »</span>
                </div>
              </button>

            </div>
          </div>

          {/* Interactive Action Suggesters */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-text-secondary px-1">HIZLI SİSTEM EYLEMLERİ</div>
            <div className="grid grid-cols-1 gap-2">
              {quickSuggestions.map(s => (
                <button
                  key={s.id}
                  onClick={s.action}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-white/5 hover:border-focus-neon/35 hover:bg-white/[0.02] transition-all text-left active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-white group-hover:bg-focus-neon/15 group-hover:text-focus-neon transition-colors">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{s.title}</div>
                      <div className="text-[10px] text-text-secondary">{s.description}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-text-secondary group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Speech Assistant Note with quick-bubble */}
          <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-text-secondary uppercase">
              <MessageSquare size={12} className="text-focus-neon" />
              <span>GÜNLÜK ASİSTAN ANALİZ NOTU</span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-text-secondary">
              <p className="font-bold text-white/95">{assistantBubble.greeting}</p>
              <p className="italic">"{assistantBubble.advice}"</p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
export default AIAssistantDrawer;
