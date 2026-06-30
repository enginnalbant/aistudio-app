import React from 'react';
import { motion } from 'motion/react';

export const EbookTranslate = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-3xl font-display font-bold text-text-primary mb-2">E-Kitap Translate</h1>
      <p className="text-text-secondary">E-kitap çeviri aracı.</p>
    </motion.div>
  );
};
