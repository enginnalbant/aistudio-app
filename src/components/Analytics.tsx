import React from 'react';
import { BarChart3, TrendingUp, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black tracking-tight text-text-primary uppercase">
          Veri Analizi
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Aktif Kullanıcılar', value: '1,284', icon: <Zap size={20} />, color: 'text-focus-neon' },
          { label: 'Dönüşüm Oranı', value: '%12.4', icon: <TrendingUp size={20} />, color: 'text-ai-bright' },
          { label: 'Toplam Hacim', value: '₺42.5K', icon: <BarChart3 size={20} />, color: 'text-focus-main' },
          { label: 'Hedef Başarımı', value: '%88', icon: <Target size={20} />, color: 'text-crit-vivid' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bento-card p-6 flex flex-col gap-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-skel-matte/5 flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60">{stat.label}</p>
              <h3 className="text-2xl font-display font-black text-text-primary mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bento-card p-8 h-[400px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <BarChart3 size={48} className="text-skel-metal/20 mx-auto" />
          <p className="text-skel-metal/40 font-mono text-xs uppercase tracking-widest">Grafik Verileri Yükleniyor...</p>
        </div>
      </div>
    </div>
  );
};
