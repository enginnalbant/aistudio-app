import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';

const LoadingScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Sistemler başlatılıyor...",
    "Güvenlik protokolleri kontrol ediliyor...",
    "Veri senkronizasyonu yapılıyor...",
    "Kullanıcı profili yükleniyor...",
    "Arayüz hazırlanıyor...",
    "Neredeyse hazır!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-md px-8 text-center space-y-12">
        {/* Logo Animation */}
        <div className="relative flex justify-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)]"
          >
            <Cpu className="w-16 h-16 text-white" />
          </motion.div>
          
          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-4 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-4 -left-4 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl"
          >
            <Zap className="w-5 h-5 text-yellow-500" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 -right-12"
          >
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black tracking-tighter text-white"
            >
              NEXUS <span className="text-indigo-500">OS</span>
            </motion.h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-zinc-400 font-bold text-sm tracking-wide h-5"
              >
                {statuses[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Global Network
              </span>
              <span className="text-sm font-black text-indigo-500 tabular-nums">
                %{progress}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-8 border-t border-zinc-900"
        >
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
            Secure Connection Established
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
