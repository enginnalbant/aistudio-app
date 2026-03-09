import React from 'react';
import { Check, Minus, Circle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StatusButtonProps {
  status: number; // 0: empty, 1: completed, 2: partial
  onChange: (newStatus: number) => void;
  size?: number;
  type?: 'morning' | 'evening';
}

export const StatusButton: React.FC<StatusButtonProps> = ({ status, onChange, size = 20, type }) => {
  const handleClick = () => {
    const nextStatus = (status + 1) % 3;
    onChange(nextStatus);
  };

  const getStatusConfig = (s: number) => {
    switch (s) {
      case 1: return { color: 'bg-emerald-500', icon: Check, label: 'Tamamlandı', shadow: 'shadow-emerald-500/40' };
      case 2: return { color: 'bg-amber-500', icon: Minus, label: 'Yarım Kaldı', shadow: 'shadow-amber-500/40' };
      default: return { color: 'bg-bg-app border-2 border-border', icon: null, label: 'Bekliyor', shadow: '' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="relative group flex justify-center">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${config.color} ${config.shadow} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {Icon ? (
            <motion.div
              key={status}
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Icon size={size} strokeWidth={3} className="text-white drop-shadow-md" />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2 h-2 rounded-full bg-border/50"
            />
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-bg-card border border-border px-3 py-1.5 rounded-xl shadow-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-2 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${status === 1 ? 'bg-emerald-500' : status === 2 ? 'bg-amber-500' : 'bg-text-secondary'}`} />
          {config.label}
        </div>
      </div>
    </div>
  );
};
