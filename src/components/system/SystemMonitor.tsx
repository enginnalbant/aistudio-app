import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Database, 
  Globe, 
  Activity, 
  ShieldCheck, 
  Terminal,
  Zap,
  HardDrive
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export function SystemMonitor() {
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    network: 0,
    storage: 0
  });

  const [history, setHistory] = useState<any[]>([]);

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // In production, this would fetch real system metrics
    const interval = setInterval(() => {
      // Placeholder for real data fetching logic
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-8 h-full overflow-y-auto pr-2 custom-scrollbar pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-text-primary">SİSTEM <span className="text-focus-neon">MONİTÖRÜ</span></h1>
          <p className="text-text-secondary font-medium mt-1">Apex Core v4.2.0-Apex Kaynak Kullanımı</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-grow-main/10 border border-grow-main/20 text-grow-main label-mono text-[10px] flex items-center gap-2">
            <ShieldCheck size={14} /> Çekirdek Korumalı
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-focus-main/10 text-focus-neon flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <span className="text-[10px] font-mono font-bold text-focus-neon">CPU</span>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-text-primary">%{stats.cpu}</div>
            <div className="w-full h-1.5 bg-skel-metal/10 rounded-full mt-2 overflow-hidden">
              <motion.div 
                animate={{ width: `${stats.cpu}%` }}
                className="h-full bg-focus-neon"
              />
            </div>
          </div>
        </div>

        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-ai-royal/10 text-ai-bright flex items-center justify-center">
              <Database size={20} />
            </div>
            <span className="text-[10px] font-mono font-bold text-ai-bright">RAM</span>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-text-primary">{stats.ram}GB</div>
            <div className="w-full h-1.5 bg-skel-metal/10 rounded-full mt-2 overflow-hidden">
              <motion.div 
                animate={{ width: `${(stats.ram / 16) * 100}%` }}
                className="h-full bg-ai-bright"
              />
            </div>
          </div>
        </div>

        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-grow-main/10 text-grow-phosphor flex items-center justify-center">
              <Globe size={20} />
            </div>
            <span className="text-[10px] font-mono font-bold text-grow-phosphor">AĞ</span>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-text-primary">{stats.network}ms</div>
            <div className="w-full h-1.5 bg-skel-metal/10 rounded-full mt-2 overflow-hidden">
              <motion.div 
                animate={{ width: `${stats.network}%` }}
                className="h-full bg-grow-phosphor"
              />
            </div>
          </div>
        </div>

        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-nrg-sun/10 text-nrg-sun flex items-center justify-center">
              <HardDrive size={20} />
            </div>
            <span className="text-[10px] font-mono font-bold text-nrg-sun">DİSK</span>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-text-primary">%{stats.storage}</div>
            <div className="w-full h-1.5 bg-skel-metal/10 rounded-full mt-2 overflow-hidden">
              <motion.div 
                animate={{ width: `${stats.storage}%` }}
                className="h-full bg-nrg-sun"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bento-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-black tracking-tighter text-text-primary flex items-center gap-3">
              <Activity size={20} className="text-focus-neon" />
              Performans Geçmişi
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-focus-neon" />
                <span className="label-mono">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ai-bright" />
                <span className="label-mono">RAM</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-focus-neon)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-focus-neon)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-skel-space)', 
                    borderColor: 'rgba(161, 165, 183, 0.1)', 
                    borderRadius: '12px' 
                  }}
                />
                <Area type="monotone" dataKey="cpu" stroke="var(--color-focus-neon)" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} />
                <Area type="monotone" dataKey="ram" stroke="var(--color-ai-bright)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-8 flex flex-col">
          <h3 className="text-xl font-display font-black tracking-tighter text-text-primary flex items-center gap-3 mb-8">
            <Terminal size={20} className="text-focus-neon" />
            Aktif Süreçler
          </h3>
          <div className="space-y-4 flex-1">
            {[].length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                <Activity size={40} className="text-skel-metal mb-2" />
                <p className="text-xs font-mono font-bold text-skel-metal uppercase tracking-widest">Süreç Bulunmuyor</p>
              </div>
            )}
            {[].map((proc: any, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10 hover:bg-skel-matte/10 transition-all">
                <div>
                  <p className="text-sm font-display font-bold text-text-primary">{proc.name}</p>
                  <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">{proc.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-focus-neon">{proc.cpu}</p>
                  <p className="text-[10px] font-mono text-text-secondary">{proc.ram}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="os-btn os-btn-secondary w-full mt-6 text-xs">
            <Zap size={14} /> Tüm Süreçleri Yönet
          </button>
        </div>
      </div>

      <div className="bento-card p-8 bg-skel-matte/30 border-focus-neon/20">
        <h3 className="text-xl font-display font-black tracking-tighter text-text-primary flex items-center gap-3 mb-6">
          <Terminal size={20} className="text-focus-neon" />
          Çekirdek Konsolu (Kernel Console)
        </h3>
        <div className="bg-black/80 rounded-2xl p-6 font-mono text-xs text-focus-neon h-64 overflow-y-auto custom-scrollbar border border-focus-neon/30 shadow-[0_0_20px_rgba(0,255,159,0.1)]">
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center opacity-30 italic">
              Sistem logları bekleniyor...
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="mb-1 opacity-80 hover:opacity-100 transition-opacity">
              <span className="text-text-secondary mr-2">»</span>
              {log}
            </div>
          ))}
          <motion.div 
            animate={{ opacity: [0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2 h-4 bg-focus-neon ml-1 align-middle"
          />
        </div>
      </div>
    </div>
  );
}
