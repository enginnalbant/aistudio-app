import React from 'react';
import { motion } from 'motion/react';
import { Hammer, Construction, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  brandName?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "Bu bölüm şu anda geliştirilme aşamasında. Çok yakında APEXOS ekosistemine dahil olacak.", 
  brandName = "APEXOS"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-focus-neon/10 border border-focus-neon/20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-focus-neon/20 to-transparent animate-pulse" />
          <Hammer className="text-focus-neon size-10 relative z-10" />
        </div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-nrg-sun/20 border border-nrg-sun/30 flex items-center justify-center"
        >
          <Sparkles className="text-nrg-sun size-4" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-md space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Construction className="text-text-secondary size-4" />
          <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">
            Geliştirme Aşamasında
          </span>
        </div>
        
        <h1 className="text-3xl font-display font-black text-text-primary tracking-tighter uppercase italic">
          {brandName} <span className="text-focus-neon">{title}</span>
        </h1>
        
        <p className="text-text-secondary text-sm leading-relaxed font-medium">
          {description}
        </p>

        <div className="pt-8">
          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-mono text-text-secondary gap-3">
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-focus-neon animate-pulse" />
               <div className="w-1.5 h-1.5 rounded-full bg-focus-neon/60 animate-pulse delay-75" />
               <div className="w-1.5 h-1.5 rounded-full bg-focus-neon/30 animate-pulse delay-150" />
             </div>
             SİSTEM OPTİMİZE EDİLİYOR...
          </div>
        </div>
      </motion.div>
    </div>
  );
};
