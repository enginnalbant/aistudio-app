import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

// Enhanced Haptic vibration patterns matching iOS / Native Android expectations
export const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'double' | 'success' | 'error') => {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (pattern) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'heavy':
        navigator.vibrate(60);
        break;
      case 'double':
        navigator.vibrate([20, 50, 20]);
        break;
      case 'success':
        navigator.vibrate([15, 40, 15, 60]);
        break;
      case 'error':
        navigator.vibrate([80, 80, 80]);
        break;
    }
  } catch {}
};

interface DockItemProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  isTabletOrDesktop: boolean;
  onClick: () => void;
  onLongPress: () => void;
  widgetValue?: string; // Live Widget content (e.g. ₺540K, 3 Todo, etc.)
  badgeCount?: number;  // Live notification count badge
  glowColor?: 'red' | 'green' | 'blue' | 'purple' | 'gold' | 'default'; // Dynamic glow
}

export const DockItem: React.FC<DockItemProps> = ({
  id,
  title,
  icon,
  color,
  isActive,
  isTabletOrDesktop,
  onClick,
  onLongPress,
  widgetValue,
  badgeCount,
  glowColor = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  // Dynamic Border Glow Colors
  const glowClasses = {
    red: "shadow-[0_0_15px_rgba(239,68,68,0.55)] border-red-500/40",
    green: "shadow-[0_0_15px_rgba(16,185,129,0.55)] border-emerald-500/40",
    blue: "shadow-[0_0_15px_rgba(59,130,246,0.55)] border-blue-500/40",
    purple: "shadow-[0_0_15px_rgba(139,92,246,0.55)] border-violet-500/40",
    gold: "shadow-[0_0_15px_rgba(245,158,11,0.55)] border-amber-500/40",
    default: "shadow-[0_4px_12px_rgba(0,0,0,0.2)] border-white/10 dark:border-white/5"
  };

  const handleTouchStart = () => {
    isLongPressActive.current = false;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      triggerHaptic('medium');
      onLongPress();
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    if (!isLongPressActive.current) {
      triggerHaptic('light');
      onClick();
    }
    isLongPressActive.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    isLongPressActive.current = false;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      triggerHaptic('medium');
      onLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    if (!isLongPressActive.current) {
      triggerHaptic('light');
      onClick();
    }
    isLongPressActive.current = false;
  };

  const cancelTouch = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none group"
      onMouseEnter={() => {
        setIsHovered(true);
        triggerHaptic('light');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        cancelTouch();
      }}
    >
      {/* Dynamic Hover / Stack Preview Window (Desktop Hover Visual) */}
      <AnimatePresence>
        {isHovered && isTabletOrDesktop && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: -48, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute z-[60] bg-neutral-950/95 border border-white/15 rounded-xl px-3 py-2 shadow-xl backdrop-blur-md pointer-events-none flex flex-col items-center min-w-[120px]"
          >
            <div className="text-[10px] text-focus-neon font-bold tracking-widest uppercase mb-0.5">Önizleme</div>
            <div className="text-xs font-black text-white truncate max-w-[110px]">{title}</div>
            {widgetValue && (
              <div className="text-[9px] text-emerald-400 font-mono mt-1 font-semibold">{widgetValue}</div>
            )}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-950 border-r border-b border-white/15 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={cancelTouch}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={clsx(
          "relative flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 w-11 h-11 sm:w-13 sm:h-13 border hover:scale-105 active:scale-90 overflow-visible",
          isActive ? "bg-white/15 border-white/20 text-focus-neon" : "bg-white/[0.04] text-text-secondary hover:text-white",
          glowClasses[glowColor]
        )}
      >
        {/* Dynamic Widget UI / Content inside icon container */}
        {widgetValue ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center bg-black/30 rounded-[19px] overflow-hidden">
            <span className="text-[7.5px] font-black text-white/50 tracking-tighter truncate max-w-full uppercase">{title.split(' ')[0]}</span>
            <span className="text-[9px] font-black font-mono text-focus-neon leading-none mt-0.5 truncate max-w-full">{widgetValue}</span>
          </div>
        ) : (
          <div className="shrink-0 flex items-center justify-center transition-transform group-hover:scale-110">
            {icon}
          </div>
        )}

        {/* Live Notification Badge Overlay */}
        {badgeCount && badgeCount > 0 ? (
          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-rose-500 to-red-600 border border-black/50 text-white font-mono text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shadow-[0_2px_8px_rgba(239,68,68,0.5)] animate-bounce">
            {badgeCount}
          </div>
        ) : null}

        {isActive && (
          <motion.div
            layoutId="dock-dot"
            className="absolute -bottom-1.5 w-1.5 h-1.5 bg-focus-neon rounded-full shadow-[0_0_10px_#70a1ff]"
          />
        )}
      </button>

      {/* Label under item */}
      {!widgetValue && (
        <span className="text-[9px] sm:text-[10px] font-semibold text-text-secondary mt-1 truncate max-w-[62px] opacity-75 group-hover:opacity-100 transition-opacity">
          {title}
        </span>
      )}
    </div>
  );
};
