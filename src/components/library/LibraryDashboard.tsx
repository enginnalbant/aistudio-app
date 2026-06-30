import React from 'react';
import { motion } from 'motion/react';

export const LibraryDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-3xl font-display font-bold text-text-primary mb-2">Kütüphane Dashboard</h1>
      <p className="text-text-secondary">Kütüphanenize genel bakış.</p>
    </motion.div>
  );
};
