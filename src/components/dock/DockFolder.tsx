import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppShortcut } from './Dock';
import { triggerHaptic } from './DockItem';
import clsx from 'clsx';

interface DockFolderProps {
  title: string;
  shortcuts: AppShortcut[];
  activeModule: string;
  onSelectShortcut: (id: string) => void;
}

export const DockFolder: React.FC<DockFolderProps> = ({
  title,
  shortcuts,
  activeModule,
  onSelectShortcut
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    triggerHaptic('medium');
    setIsOpen(!isOpen);
  };

  const handleSelect = (id: string) => {
    triggerHaptic('light');
    onSelectShortcut(id);
    setIsOpen(false);
  };

  const anyActive = shortcuts.some(s => s.id === activeModule);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Folder Trigger Grid (Small 2x2 grid representing nested shortcuts) */}
      <button
        onClick={handleToggle}
        className={clsx(
          "relative flex items-center justify-center rounded-[20px] bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 dark:border-white/5 w-11 h-11 sm:w-13 sm:h-13 hover:scale-105 active:scale-90 transition-all duration-300 overflow-hidden p-1.5",
          anyActive && "shadow-[0_0_12px_rgba(112,161,255,0.4)] border-focus-neon/30 text-focus-neon"
        )}
      >
        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
          {shortcuts.slice(0, 4).map(s => (
            <div
              key={`grid-icon-${s.id}`}
              className={clsx(
                "rounded-md flex items-center justify-center overflow-hidden bg-gradient-to-br text-white p-[2px]",
                s.color
              )}
            >
              {React.cloneElement(s.icon as React.ReactElement<any>, { size: 9 })}
            </div>
          ))}
        </div>

        {anyActive && (
          <div className="absolute bottom-1 w-1.5 h-1.5 bg-focus-neon rounded-full" />
        )}
      </button>

      <span className="text-[9px] sm:text-[10px] font-semibold text-text-secondary mt-1 max-w-[62px] truncate opacity-75">
        {title}
      </span>

      {/* Fan out overlay of folder content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Folder Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm"
            />

            {/* Folder Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[150] w-[260px] bg-neutral-950/95 border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-3 backdrop-blur-xl"
            >
              <div className="text-xs font-black text-white/50 uppercase tracking-widest border-b border-white/10 w-full text-center pb-1.5">
                {title} Klasörü
              </div>

              {/* Fan-grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {shortcuts.map((s, idx) => {
                  const isActive = s.id === activeModule;
                  return (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      key={`fan-${s.id}`}
                      onClick={() => handleSelect(s.id)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-2 rounded-xl transition-all hover:bg-white/10 active:scale-90",
                        isActive ? "bg-focus-neon/15 text-focus-neon" : "text-text-secondary"
                      )}
                    >
                      <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg mb-1",
                        s.color
                      )}>
                        {React.cloneElement(s.icon as React.ReactElement<any>, { size: 16 })}
                      </div>
                      <span className="text-[9px] font-bold text-center leading-tight truncate w-full max-w-[64px] text-white">
                        {s.title.split(' ')[0]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
