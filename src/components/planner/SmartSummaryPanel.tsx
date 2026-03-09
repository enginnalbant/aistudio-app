import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BarChart2, Lightbulb, RefreshCw } from 'lucide-react';

export const SmartSummaryPanel = ({ items, completedCount }: { items: any[], completedCount: number }) => {
  const [activeTab, setActiveTab] = useState<'Özet' | 'Analiz' | 'Öneriler'>('Özet');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const total = items.length;
  const critical = items.filter(i => i.priority === 2).length;
  const productivityScore = total > 0 ? Math.round((completedCount * 100) / total) : 0;

  const tabs = ['Özet', 'Analiz', 'Öneriler'];

  return (
    <motion.div 
      layout
      className="bg-white/90 backdrop-blur-md border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-black text-text-primary">Günün Zeka Özeti</h2>
        </div>
        <button className="p-2 hover:bg-bg-app rounded-xl text-text-secondary hover:text-emerald-500">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-bg-app p-1 rounded-xl">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-emerald-500' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {activeTab === 'Özet' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl font-black text-emerald-500">{productivityScore}%</div>
                <p className="text-xs font-black text-text-secondary uppercase tracking-widest mt-1">Verimlilik Skoru</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-app p-4 rounded-2xl border border-border">
                  <p className="text-[10px] uppercase font-black text-text-secondary mb-1">Kritik İşler</p>
                  <div className="text-2xl font-black text-rose-500">{critical}</div>
                </div>
                <div className="bg-bg-app p-4 rounded-2xl border border-border">
                  <p className="text-[10px] uppercase font-black text-text-secondary mb-1">Tamamlanan</p>
                  <div className="text-2xl font-black text-emerald-500">{completedCount}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-all text-xs uppercase">Tümünü Tamamla</button>
                <button className="flex-1 py-3 bg-bg-app text-text-primary font-black rounded-xl hover:bg-border transition-all text-xs uppercase">Rapor Al</button>
              </div>
            </div>
          )}
          {activeTab === 'Analiz' && (
            <div className="text-center py-12 text-text-secondary text-sm italic">
              Analiz verileri yakında eklenecek.
            </div>
          )}
          {activeTab === 'Öneriler' && (
            <div className="text-center py-12 text-text-secondary text-sm italic">
              Öneriler yakında eklenecek.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
