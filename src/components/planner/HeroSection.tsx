import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, Zap, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const HeroSection = ({ date }: { date: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-3xl bg-gradient-to-br from-bg-card to-bg-app border border-border shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-emerald-500/5 blur-3xl"></div>
      
      <div className="relative">
        <h1 className="text-5xl font-black text-text-primary tracking-tighter">
          {new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
        </h1>
      </div>
    </motion.div>
  );
};
