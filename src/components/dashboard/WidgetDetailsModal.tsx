import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Info } from 'lucide-react';

interface WidgetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  details: React.ReactNode;
  linkTo?: string;
  onNavigate?: (path: string) => void;
}

export function WidgetDetailsModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  details, 
  linkTo,
  onNavigate 
}: WidgetDetailsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-skel-dark/80 backdrop-blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl layer-3d rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-skel-metal/10 flex items-center justify-between bg-skel-matte/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-lg shadow-accent/5">
                  <Info size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-text-primary tracking-tighter">{title}</h3>
                  <p className="label-mono text-[10px] mt-0.5">{description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-skel-matte/10 rounded-xl transition-all text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto text-text-primary">
              {details}
            </div>

            <div className="p-6 border-t border-skel-metal/10 bg-skel-matte/5 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="os-btn os-btn-secondary"
              >
                Kapat
              </button>
              {linkTo && onNavigate && (
                <button
                  onClick={() => {
                    onNavigate(linkTo);
                    onClose();
                  }}
                  className="os-btn os-btn-primary"
                >
                  Detaylı Görünüm <ExternalLink size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
