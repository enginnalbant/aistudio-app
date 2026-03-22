import React, { useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';

export type CharacterState = 
  | 'idle' 
  | 'typing' 
  | 'peeking' 
  | 'unveiled' 
  | 'pasting' 
  | 'deleting' 
  | 'success' 
  | 'error' 
  | 'thinking' 
  | 'surprised' 
  | 'cool';

export type CharacterType = 'alex' | 'sarah' | 'leo' | 'maya' | 'zane';

interface CharacterAnimationProps {
  state: CharacterState;
  type?: CharacterType;
  mouseX?: number;
  mouseY?: number;
}

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({ 
  state, 
  type = 'alex',
  mouseX = 0, 
  mouseY = 0 
}) => {
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });

  React.useEffect(() => {
    x.set(mouseX);
    y.set(mouseY);
  }, [mouseX, mouseY, x, y]);

  const rotateX = useTransform(y, [-500, 500], [15, -15]);
  const rotateY = useTransform(x, [-500, 500], [-15, 15]);
  const eyeX = useTransform(x, [-500, 500], [-6, 6]);
  const eyeY = useTransform(y, [-500, 500], [-4, 4]);

  // Character-specific styles
  const characterStyles = {
    alex: { skin: 'bg-orange-100 dark:bg-orange-900/30', hair: 'bg-zinc-800', accent: 'bg-indigo-500' },
    sarah: { skin: 'bg-rose-50 dark:bg-rose-900/20', hair: 'bg-yellow-600', accent: 'bg-pink-500' },
    leo: { skin: 'bg-amber-100 dark:bg-amber-900/30', hair: 'bg-orange-900', accent: 'bg-emerald-500' },
    maya: { skin: 'bg-stone-200 dark:bg-stone-800', hair: 'bg-zinc-900', accent: 'bg-purple-500' },
    zane: { skin: 'bg-blue-50 dark:bg-blue-900/20', hair: 'bg-blue-900', accent: 'bg-blue-500' },
  };

  const style = characterStyles[type];

  const variants = {
    idle: { scale: 1, rotate: 0, y: [0, -5, 0], transition: { duration: 4, repeat: Infinity } },
    typing: { scale: 1.02, rotate: [0, -1, 1, 0], transition: { duration: 0.2, repeat: Infinity } },
    peeking: { scale: 0.95, rotate: 0 },
    unveiled: { scale: 1.1, rotate: 0, y: -10 },
    pasting: { scale: 1.2, rotate: [0, -5, 5, 0], transition: { duration: 0.3 } },
    deleting: { scale: 0.98, rotate: [0, 2, -2, 0], transition: { duration: 0.1 } },
    success: { scale: 1.1, y: [0, -30, 0], transition: { duration: 0.4, repeat: 3 } },
    error: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } },
    thinking: { rotate: [0, 10, -10, 0], transition: { duration: 2, repeat: Infinity } },
    surprised: { scale: 1.3, rotate: 0 },
    cool: { scale: 1.05, rotate: [0, 5, -5, 0], transition: { duration: 1, repeat: Infinity } },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        variants={variants}
        animate={state}
        className="relative z-10 w-64 h-64 flex items-center justify-center"
      >
        {/* Head Base */}
        <motion.div
          className={`w-48 h-56 ${style.skin} rounded-[4rem] shadow-2xl border-4 border-white dark:border-zinc-700 relative overflow-hidden`}
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Hair */}
          <div className={`absolute top-0 left-0 w-full h-20 ${style.hair} rounded-b-[2rem]`} />
          
          {/* Eyes */}
          <div className="absolute top-24 left-0 w-full flex justify-center gap-10">
            {[0, 1].map((i) => (
              <div key={i} className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full relative overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                <motion.div
                  style={{ x: eyeX, y: eyeY }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={
                      state === 'peeking' ? { height: 2, width: 14 } : 
                      state === 'surprised' ? { height: 16, width: 16 } :
                      state === 'error' ? { height: 4, width: 14, rotate: 45 } :
                      { height: 12, width: 12 }
                    }
                    className="bg-zinc-900 dark:bg-white rounded-full"
                  />
                </motion.div>
                {/* Eyelid for peeking */}
                <motion.div 
                  animate={state === 'peeking' ? { top: 0 } : { top: -40 }}
                  className="absolute inset-x-0 h-full bg-inherit z-10"
                />
              </div>
            ))}
          </div>

          {/* Mouth */}
          <motion.div
            animate={
              state === 'typing' ? { width: 20, height: 8, borderRadius: '4px' } :
              state === 'unveiled' ? { width: 30, height: 30, borderRadius: '50%' } :
              state === 'success' ? { width: 50, height: 25, borderRadius: '0 0 25px 25px' } :
              state === 'error' ? { width: 30, height: 4, borderRadius: '2px', rotate: -10 } :
              state === 'thinking' ? { width: 12, height: 12, borderRadius: '50%', x: 10 } :
              { width: 24, height: 4, borderRadius: '2px' }
            }
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-200"
          />

          {/* Blush for success */}
          <AnimatePresence>
            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 inset-x-0 flex justify-between px-8"
              >
                <div className="w-8 h-4 bg-rose-400 rounded-full blur-sm" />
                <div className="w-8 h-4 bg-rose-400 rounded-full blur-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ears */}
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-12 ${style.skin} rounded-l-full border-l-4 border-white dark:border-zinc-700`} style={{ transform: 'translateZ(10px)' }} />
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-12 ${style.skin} rounded-r-full border-r-4 border-white dark:border-zinc-700`} style={{ transform: 'translateZ(10px)' }} />

        {/* Floating Status Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            className={`absolute -top-6 -right-6 w-14 h-14 ${style.accent} rounded-2xl shadow-xl flex items-center justify-center text-2xl text-white font-bold`}
            style={{ transform: 'translateZ(50px)' }}
          >
            {state === 'success' ? '✓' : state === 'error' ? '!' : state === 'typing' ? '...' : '?'}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CharacterAnimation;
