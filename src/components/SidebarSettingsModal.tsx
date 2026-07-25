import React from 'react';
import { X, PanelLeft, PanelRight, PanelBottom } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface SidebarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarSettingsModal = ({ isOpen, onClose }: SidebarSettingsModalProps) => {
  const { settings, updateSetting } = useSettings();
  const position = settings['sidebar_position']?.value || 'left';

  const positions = [
    { id: 'left', label: 'Sol', icon: PanelLeft },
    { id: 'right', label: 'Sağ', icon: PanelRight },
    { id: 'bottom', label: 'Alt (Dock)', icon: PanelBottom },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sidebar-settings-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-pure-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <motion.div
            key="sidebar-settings-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bento-card p-6 z-[1001] space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-black text-text-primary uppercase">Sidebar Ayarları</h2>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => updateSetting('sidebar_position', pos.id)}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all border",
                    position === pos.id
                      ? "bg-focus-neon/10 border-focus-neon text-focus-neon"
                      : "bg-skel-matte/5 border-skel-metal/10 text-text-secondary hover:bg-skel-matte/10"
                  )}
                >
                  <pos.icon size={24} />
                  <span className="text-[10px] font-bold uppercase">{pos.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
