import React from 'react';
import { motion } from 'motion/react';

export const MangaTranslate = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Manga Translate</h1>
      <p className="text-text-secondary">Manga çeviri aracı.</p>
    </motion.div>
  );
};
