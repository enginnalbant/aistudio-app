import React from 'react';
import { Newspaper, Hammer, ArrowLeft, Construction, RefreshCw, Milestone } from 'lucide-react';
import { motion } from 'motion/react';

interface BulletinNewsProps {
  activeSubModule?: string;
}

export function BulletinNews({ activeSubModule }: BulletinNewsProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative items-center justify-center p-6">
      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl w-full text-center space-y-8 z-10"
      >
        {/* Animated Icon Group */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl w-24 h-24 mx-auto" />
          <div className="relative w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent" />
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Construction size={40} className="text-rose-400" />
            </motion.div>
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-text-primary">
            APEXOS <span className="text-rose-400">Bülten</span>
          </h1>
          <p className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full inline-block uppercase tracking-widest font-bold">
            Geliştirilme Aşamasında
          </p>
          <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto pt-3">
            Haber ve bülten modülümüz, size daha kişiselleştirilmiş, yapay zeka destekli ve kesintisiz bir okuma deneyimi sunmak için tamamen baştan tasarlanıyor.
          </p>
        </div>

        {/* Visual Progress/Status List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left space-y-4 max-w-md mx-auto backdrop-blur-sm">
          <h4 className="text-xs font-mono text-text-secondary/60 uppercase tracking-widest font-bold">Planlanan Yenilikler</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-rose-500/10 flex items-center justify-center text-[10px] font-mono text-rose-400 shrink-0 mt-0.5">
                01
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Kişiselleştirilmiş Akışlar</p>
                <p className="text-[11px] text-text-secondary/70">Sadece ilginizi çeken kategorilerden derlenen akıllı yayınlar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-rose-500/10 flex items-center justify-center text-[10px] font-mono text-rose-400 shrink-0 mt-0.5">
                02
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Yapay Zeka Özetleme Motoru</p>
                <p className="text-[11px] text-text-secondary/70">Uzun makaleleri saniyeler içinde okuyabileceğiniz kısa bültenler haline getirme.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-rose-500/10 flex items-center justify-center text-[10px] font-mono text-rose-400 shrink-0 mt-0.5">
                03
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">Gelişmiş Filtreleme ve Arama</p>
                <p className="text-[11px] text-text-secondary/70">Zengin medya içeriklerini, infografikleri ve haber detaylarını saniyeler içinde bulma gücü.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Inquiry */}
        <p className="text-[11px] text-text-secondary/40 font-mono">
          ApexOS Core v3.5 • Entegrasyon Modülü
        </p>
      </motion.div>
    </div>
  );
}

export default BulletinNews;
