import React from 'react';
import { motion } from 'motion/react';

export const EbookPanel = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-3xl font-display font-bold text-text-primary mb-2">E-Kitap Paneli</h1>
      <p className="text-text-secondary">E-kitap yönetim paneli.</p>
    </motion.div>
  );
};
