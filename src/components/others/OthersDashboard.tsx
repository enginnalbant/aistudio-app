import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Activity, ShieldCheck, LayoutGrid, Scan, History, FileText, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettings } from '../../context/SettingsContext';
import { ObjectDetectionTool } from './ObjectDetectionTool';
import clsx from 'clsx';

export function OthersDashboard() {
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'tool' | 'history' | 'reports'>('tool');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'GÜNAYDIN';
    if (hour < 18) return 'TÜNAYDIN';
    return 'İYİ AKŞAMLAR';
  };

  return (
    <div className="space-y-8 pb-20 h-full pr-2 overflow-y-auto custom-scrollbar">
      {/* Hero Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 rounded-full bg-focus-main/10 border border-focus-neon/20 text-focus-neon label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-focus-neon/5"
            >
              <Activity size={12} /> Sistem Aktif
            </motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-1.5 rounded-full bg-grow-main/10 border border-grow-main/20 text-grow-main label-mono text-[9px] flex items-center gap-2 shadow-sm shadow-grow-main/5"
            >
              <ShieldCheck size={12} /> Güvenli Bağlantı
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-display font-black tracking-tighter text-text-primary leading-none">
              {getGreeting()}, <span className="text-focus-neon">{settings.user_name.split(' ')[0]}</span>
            </h1>
            <p className="text-text-secondary font-medium text-lg tracking-tight opacity-70">Diğer işler operasyonel zekasını yönetin.</p>
          </div>
          <div className="flex items-center gap-4 text-text-secondary font-bold">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-skel-matte/5 rounded-xl border border-skel-metal/10">
              <Clock size={16} className="text-focus-neon" /> 
              <span className="font-display tracking-tight text-sm">{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <span className="w-1.5 h-1.5 bg-skel-metal/20 rounded-full" />
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-skel-matte/5 rounded-xl border border-skel-metal/10">
              <Calendar size={16} className="text-focus-neon" />
              <span className="font-display tracking-tight text-sm">{currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-skel-matte/5 p-1.5 rounded-2xl border border-skel-metal/10">
          <button 
            onClick={() => setActiveTab('tool')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-black text-xs tracking-widest uppercase transition-all",
              activeTab === 'tool' ? "bg-focus-main text-pure-white shadow-lg shadow-focus-main/20" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Scan size={16} /> AI Sayım Aracı
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-black text-xs tracking-widest uppercase transition-all",
              activeTab === 'history' ? "bg-focus-main text-pure-white shadow-lg shadow-focus-main/20" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <History size={16} /> Geçmiş İşlemler
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-black text-xs tracking-widest uppercase transition-all",
              activeTab === 'reports' ? "bg-focus-main text-pure-white shadow-lg shadow-focus-main/20" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <FileText size={16} /> Raporlar
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-[600px]"
      >
        {activeTab === 'tool' && <ObjectDetectionTool />}
        
        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <History size={80} className="text-skel-metal mb-4" />
            <p className="text-xl font-display font-bold text-skel-metal uppercase tracking-widest">Geçmiş İşlem Bulunmuyor</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <FileText size={80} className="text-skel-metal mb-4" />
            <p className="text-xl font-display font-bold text-skel-metal uppercase tracking-widest">Rapor Verisi Bulunmuyor</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
