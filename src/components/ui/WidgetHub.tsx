import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layout, Grid, Check, Sparkles, RefreshCw, EyeOff,
  Trash2, Plus, Eye, DollarSign, BookOpen, Newspaper, FileText
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export interface WidgetItem {
  id: string;
  title: string;
  category: 'finance' | 'notes' | 'library' | 'bulletin' | 'utility';
  description: string;
  size: '1x1' | '2x1' | '2x2';
  enabled: boolean;
}

const ALL_WIDGETS_LIBRARY: WidgetItem[] = [
  { id: 'kpi_summary', title: 'Aylık Net Varlık Özet Kartı', category: 'finance', description: 'Aktif varlıklar, borçlar ve tasarruf hızını izleyen mini kart.', size: '1x1', enabled: true },
  { id: 'cashflow_heatmap', title: 'Gelir/Gider Akış Isı Haritası', category: 'finance', description: 'Haftalık/aylık finansal sıcaklık ve nakit akış yoğunluğu.', size: '2x1', enabled: true },
  { id: 'investment_bubble', title: 'Yatırım & Birikim Balon Grafiği', category: 'finance', description: 'Hisse, altın ve döviz likidite verilerinin balon dağılımı.', size: '2x1', enabled: true },
  { id: 'debt_snowball', title: 'Borç Kartopu İnfografiği', category: 'finance', description: 'Kalan vade ve borç bitiş vadelerini gösteren interaktif grafik.', size: '1x1', enabled: true },
  { id: 'quick_notes', title: 'Hızlı Not & Karalama Defteri', category: 'notes', description: 'Anlık fikirlerinizi uçtan uca şifreleyen hızlı blok.', size: '1x1', enabled: true },
  { id: 'todo_due', title: 'Önemli Görevler & Yapılacaklar', category: 'notes', description: 'Süreleri yaklaşan acil yapılacaklar listesi.', size: '1x1', enabled: false },
  { id: 'library_reading', title: 'Okuma İlerlemesi & Günlük Hedef', category: 'library', description: 'Kitap okuma sayfalarını ve kalan süreyi gösteren halka grafik.', size: '1x1', enabled: false },
  { id: 'bulletin_rss', title: 'Canlı Yapay Zeka Bülten Akışı', category: 'bulletin', description: 'Dünya gündeminden çekilen RSS özetleri ve duygu analizi.', size: '2x1', enabled: false },
  { id: 'currency_matrix', title: 'Hızlı Kur Çevirici Matrisi', category: 'utility', description: 'Canlı API ile döviz, euro ve sterlin anlık çevirici kutusu.', size: '1x1', enabled: true },
];

interface WidgetHubProps {
  onLayoutChange?: (activeIds: string[]) => void;
}

export const WidgetHub: React.FC<WidgetHubProps> = ({ onLayoutChange }) => {
  const [widgets, setWidgets] = useLocalStorage<WidgetItem[]>('apex_active_widgets_v1', ALL_WIDGETS_LIBRARY);
  const [activeCategory, setActiveCategory] = useState<'all' | 'finance' | 'notes' | 'library' | 'bulletin'>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Synchronize on load
  useEffect(() => {
    if (onLayoutChange) {
      const activeIds = widgets.filter(w => w.enabled).map(w => w.id);
      onLayoutChange(activeIds);
    }
  }, [widgets, onLayoutChange]);

  const toggleWidget = (id: string) => {
    setWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const enableAll = () => {
    setWidgets(prev => prev.map(w => ({ ...w, enabled: true })));
  };

  const disableAll = () => {
    setWidgets(prev => prev.map(w => ({ ...w, enabled: false })));
  };

  const filteredWidgets = widgets.filter(w =>
    activeCategory === 'all' || w.category === activeCategory
  );

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-focus-neon/15 border border-focus-neon/20 flex items-center justify-center">
            <Layout size={16} className="text-focus-neon animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-display font-black text-white uppercase tracking-wider">APEXOS WIDGET KÜTÜPHANESİ & MOTORU</h3>
            <p className="text-[10px] text-text-secondary">Dashboard üzerinde görüntülenecek akıllı ve interaktif bileşenleri özelleştirin.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-xl bg-focus-neon text-white dark:text-black font-black text-[11px] flex items-center gap-1.5 shadow-lg shadow-focus-neon/20 hover:scale-102 transition-all active:scale-98"
          >
            <Grid size={13} />
            {isOpen ? 'Bileşen Kütüphanesini Kapat' : 'Bileşen Ekle / Çıkar'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-4 pt-3 border-t border-white/5"
          >
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {(['all', 'finance', 'notes', 'library', 'bulletin'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-black font-extrabold'
                      : 'bg-white/[0.03] text-text-secondary hover:bg-white/5'
                  }`}
                >
                  {cat === 'all' ? 'TÜMÜ' : cat === 'finance' ? 'FİNANS' : cat === 'notes' ? 'NOTLAR' : cat === 'library' ? 'KÜTÜPHANE' : 'BÜLTEN'}
                </button>
              ))}

              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={enableAll}
                  className="px-2 py-1 text-[9px] font-bold text-focus-neon hover:underline"
                >
                  Tümünü Aç
                </button>
                <button
                  onClick={disableAll}
                  className="px-2 py-1 text-[9px] font-bold text-text-secondary hover:underline"
                >
                  Tümünü Gizle
                </button>
              </div>
            </div>

            {/* Grid of configurable widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[120px] transition-all relative overflow-hidden group ${
                    widget.enabled
                      ? 'border-focus-neon/40 bg-focus-neon/5'
                      : 'border-white/5 bg-black/20 hover:border-white/10'
                  }`}
                >
                  {/* Status Indicator Bubble */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="text-[8px] font-mono font-black opacity-45">{widget.size}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      widget.enabled
                        ? 'bg-focus-neon border-focus-neon text-white dark:text-black'
                        : 'border-white/10 text-white/20'
                    }`}>
                      {widget.enabled ? <Check size={11} className="stroke-[3]" /> : <Plus size={11} />}
                    </div>
                  </div>

                  <div>
                    {/* Category Label Pill */}
                    <span className="text-[7.5px] font-black tracking-widest uppercase text-white/30 block mb-1">
                      {widget.category}
                    </span>
                    <h4 className="text-xs font-black text-white group-hover:text-focus-neon transition-colors truncate pr-16">{widget.title}</h4>
                    <p className="text-[9.5px] text-text-secondary leading-normal mt-1 line-clamp-2 pr-4">{widget.description}</p>
                  </div>

                  <span className="text-[9px] text-text-secondary/60 flex items-center gap-1 mt-2">
                    {widget.enabled ? <Eye size={10} className="text-focus-neon" /> : <EyeOff size={10} />}
                    {widget.enabled ? 'Ana ekranda gösteriliyor' : 'Gizli'}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
