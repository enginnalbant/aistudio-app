import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  CheckSquare,
  Wallet,
  TrendingUp,
  Package,
  Calendar,
  Rss,
  TrendingDown,
  X,
  RefreshCw
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
  const handleExecuteSuggestion = () => {
    triggerHaptic('success');
    onNavigate(siriSuggestion.moduleId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[190] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Drawer Box */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="relative bg-neutral-950/98 border-t border-focus-neon/30 rounded-t-[32px] p-5 pb-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" onClick={onClose} />

        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-focus-neon/10 text-focus-neon">
              <Sparkles size={18} className="animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-base font-display font-black text-white">APEX DOCK</h3>
              <p className="text-[11px] text-text-secondary">Günlük durum analizi ve akıllı öneriler</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content Matrix */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">

          {/* Executive Siri suggestion widget */}
          <div className="bg-gradient-to-tr from-focus-main/10 to-indigo-500/10 border border-focus-neon/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-focus-neon text-[10px] font-mono bg-focus-neon/15 px-2 py-0.5 rounded-full font-bold">
              %{siriSuggestion.confidence} Güven Oranı
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-focus-neon tracking-wide uppercase">
              <Sparkles size={13} />
              <span>Zaman Duyarlı Öneri</span>
            </div>
            <p className="text-xs text-white/90 font-medium">{siriSuggestion.reason}</p>

            <button
              onClick={handleExecuteSuggestion}
              className="w-full bg-focus-neon text-black font-black text-xs py-2.5 rounded-xl hover:bg-white active:scale-95 transition-all shadow-[0_4px_12px_rgba(112,161,255,0.3)]"
            >
              Uygulamayı Hemen Başlat
            </button>
          </div>

          {/* Today's breakdown matrix (Mini widgets in one screen) */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-text-secondary px-1">GÜNLÜK ÖZET RAPORU</div>

            <div className="grid grid-cols-2 gap-2.5">

              {/* Tasks widget */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">GÖREVLER</div>
                  <div className="text-sm font-black text-white">7 Aktif Görev</div>
                  <span className="text-[9px] text-emerald-400 font-medium">2 Kalan Yapılacak</span>
                </div>
              </div>

              {/* Incomes & Payments */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <Wallet size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">ÖDEMELER</div>
                  <div className="text-sm font-black text-white">2 Bekleyen</div>
                  <span className="text-[9px] text-blue-400 font-medium">Bakiye Güvende</span>
                </div>
              </div>

              {/* Feed Widget */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
                  <Rss size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">BÜLTEN RSS</div>
                  <div className="text-sm font-black text-white">5 Okunmamış</div>
                  <span className="text-[9px] text-orange-400 font-medium">Yeni başlıklar eklendi</span>
                </div>
              </div>

              {/* Stocks Alert Widget */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                  <Package size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary uppercase font-semibold">STOK DURUMU</div>
                  <div className="text-sm font-black text-white">Kritik Seviye</div>
                  <span className="text-[9px] text-rose-400 font-medium">3 üründe stok alarmı</span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Assistant Speech Bubbles */}
          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-3 space-y-2">
            <span className="text-[9px] text-text-secondary font-mono">ASİSTAN NOTU</span>
            <p className="text-xs text-text-secondary/90 leading-relaxed">
              "Bugün finans durumunuz son derece dengeli görünüyor, yapılması gereken ödemeleri finanse edebilecek yeterli cari nakit girdisi mevcuttur. Akşam saatlerinde notlarınızı güncellemeyi unutmayın."
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
