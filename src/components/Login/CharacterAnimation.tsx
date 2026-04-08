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

  const rotateX = useTransform(y, [-500, 500], [10, -10]);
  const rotateY = useTransform(x, [-500, 500], [-10, 10]);
  const eyeX = useTransform(x, [-500, 500], [-4, 4]);
  const eyeY = useTransform(y, [-500, 500], [-3, 3]);

  // Character-specific styles
  const characterStyles = {
    alex: { skin: 'bg-[#f3d1b0]', hair: 'bg-[#4a3728]', accent: 'bg-indigo-600' },
    sarah: { skin: 'bg-[#ffe0bd]', hair: 'bg-[#d4a017]', accent: 'bg-rose-500' },
    leo: { skin: 'bg-[#8d5524]', hair: 'bg-[#2c1e14]', accent: 'bg-emerald-600' },
    maya: { skin: 'bg-[#e0ac69]', hair: 'bg-[#1a1a1a]', accent: 'bg-purple-600' },
    zane: { skin: 'bg-[#ffdbac]', hair: 'bg-[#3b82f6]', accent: 'bg-blue-600' },
  };

  const style = characterStyles[type];

  // Unique animation settings for each character to make them feel like individuals
  const characterBehavior = useMemo(() => {
    const behaviors = {
      alex: { idleY: -2, idleDuration: 4, typingScale: 1.02, successY: -20, errorX: -5 },
      sarah: { idleY: -1.5, idleDuration: 5, typingScale: 1.01, successY: -10, errorX: -3 },
      leo: { idleY: -3, idleDuration: 6, typingScale: 1.03, successY: -25, errorX: -7 },
      maya: { idleY: -1, idleDuration: 4.5, typingScale: 1.005, successY: -15, errorX: -4 },
      zane: { idleY: -2.5, idleDuration: 5.5, typingScale: 1.015, successY: -18, errorX: -6 },
    };
    return behaviors[type];
  }, [type]);

  const variants = {
    idle: { 
      scale: 1, 
      rotate: 0, 
      y: [0, characterBehavior.idleY, 0], 
      transition: { 
        duration: characterBehavior.idleDuration, 
        repeat: Infinity,
        ease: "easeInOut" as const
      } 
    },
    typing: { 
      scale: characterBehavior.typingScale, 
      rotate: type === 'alex' ? [0, -0.5, 0.5, 0] : 0,
      y: type === 'leo' ? -2 : 0,
      transition: { duration: 0.5, repeat: Infinity } 
    },
    peeking: { 
      scale: 0.98, 
      rotate: type === 'sarah' ? 2 : -2,
      y: 2
    },
    unveiled: { 
      scale: 1.05, 
      rotate: 0, 
      y: -5,
      transition: { type: 'spring' as const, stiffness: 300 }
    },
    pasting: { 
      scale: 1.1, 
      rotate: type === 'zane' ? [0, -2, 2, 0] : 0,
      transition: { duration: 0.3 } 
    },
    deleting: { 
      scale: 0.99, 
      rotate: type === 'maya' ? [0, 1, -1, 0] : 0,
      transition: { duration: 0.1 } 
    },
    success: { 
      scale: 1.05, 
      y: [0, characterBehavior.successY, 0], 
      rotate: type === 'alex' ? [0, 5, -5, 0] : type === 'sarah' ? [0, -3, 3, 0] : 0,
      transition: { 
        duration: 0.6, 
        repeat: type === 'leo' ? 2 : 1,
        ease: "easeInOut" as const
      } 
    },
    error: { 
      x: [0, characterBehavior.errorX, -characterBehavior.errorX, 0], 
      rotate: type === 'sarah' ? [0, 5, -5, 0] : type === 'maya' ? [0, -3, 3, 0] : 0,
      y: type === 'zane' ? [0, 5, 0] : 0,
      transition: { duration: 0.4, ease: "easeInOut" as const } 
    },
    thinking: { 
      rotate: type === 'maya' ? [0, 3, -3, 0] : type === 'leo' ? [0, -4, 4, 0] : [0, -2, 2, 0],
      scale: type === 'alex' ? [1, 1.02, 1] : 1,
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } 
    },
    surprised: { 
      scale: 1.1, 
      y: -10,
      rotate: type === 'leo' ? 5 : type === 'maya' ? -5 : 0,
      transition: { type: 'spring' as const, damping: 8, stiffness: 300 }
    },
    cool: { 
      scale: 1.02, 
      rotate: type === 'zane' ? [0, 2, -2, 0] : type === 'sarah' ? [0, -3, 3, 0] : 0,
      y: type === 'alex' ? [0, -2, 0] : 0,
      transition: { duration: 2, repeat: Infinity, ease: "linear" as const } 
    },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        variants={variants}
        animate={state}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center"
      >
        {/* Head - More Oval/Realistic */}
        <motion.div
          className={`w-20 h-24 ${style.skin} rounded-[50%_50%_45%_45%] shadow-2xl border border-black/5 relative overflow-hidden z-20`}
          style={{ transform: 'translateZ(25px)' }}
        >
          {/* Hair - More detailed */}
          <div className={`absolute top-0 left-0 w-full h-12 ${style.hair} rounded-b-[40%] opacity-90`} />
          
          {/* Eyes - Smaller, more realistic */}
          <div className="absolute top-11 left-0 w-full flex justify-center gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="w-4 h-4 bg-white rounded-full relative overflow-hidden border border-black/10">
                <motion.div
                  style={{ x: eyeX, y: eyeY }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={
                      state === 'peeking' ? { height: 1, width: 6 } : 
                      state === 'surprised' ? { height: 6, width: 6 } :
                      state === 'error' ? { height: 2, width: 6, rotate: 45 } :
                      { height: 4, width: 4 }
                    }
                    className="bg-zinc-900 rounded-full"
                  />
                </motion.div>
                {/* Eyelid */}
                <motion.div 
                  animate={state === 'peeking' ? { top: 0 } : { top: -15 }}
                  className="absolute inset-x-0 h-full bg-inherit z-10"
                />
              </div>
            ))}
          </div>

          {/* Nose */}
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-2 h-3 bg-black/10 rounded-full" />

          {/* Mouth */}
          <motion.div
            animate={
              state === 'typing' ? { width: 8, height: 2, borderRadius: '1px' } :
              state === 'unveiled' ? { width: 12, height: 12, borderRadius: '50%' } :
              state === 'success' ? { width: 20, height: 8, borderRadius: '0 0 10px 10px' } :
              state === 'error' ? { width: 12, height: 2, borderRadius: '1px', rotate: -5 } :
              state === 'thinking' ? { width: 4, height: 4, borderRadius: '50%', x: 3 } :
              { width: 10, height: 2, borderRadius: '1px' }
            }
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/80"
          />
        </motion.div>

        {/* Neck */}
        <div className={`w-6 h-4 ${style.skin} -mt-1 relative z-15 brightness-90`} />

        {/* Torso - Realistic shoulders and tapered waist */}
        <motion.div
          className={`w-24 h-28 ${style.accent} rounded-[2rem_2rem_1rem_1rem] relative z-10 shadow-xl overflow-hidden`}
          style={{ 
            transform: 'translateZ(15px)',
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' // Subtle taper
          }}
        >
          {/* Shirt details / Collar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/20 rounded-b-full" />
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-1 h-12 bg-black/5" />
          
          {/* Arms - Sitting posture with elbows */}
          <motion.div 
            animate={state === 'typing' ? { rotate: [-10, -20, -10] } : { rotate: -10 }}
            className={`absolute -left-3 top-2 w-5 h-24 ${style.skin} rounded-full origin-top shadow-md`}
          >
             {/* Sleeve */}
             <div className={`absolute top-0 left-0 w-full h-12 ${style.accent} brightness-90 rounded-t-full`} />
          </motion.div>
          <motion.div 
            animate={state === 'typing' ? { rotate: [10, 20, 10] } : { rotate: 10 }}
            className={`absolute -right-3 top-2 w-5 h-24 ${style.skin} rounded-full origin-top shadow-md`}
          >
             {/* Sleeve */}
             <div className={`absolute top-0 left-0 w-full h-12 ${style.accent} brightness-90 rounded-t-full`} />
          </motion.div>
        </motion.div>

        {/* Legs - Bent for sitting */}
        <div className="flex gap-1 -mt-2 relative z-0">
          <div className="relative">
            {/* Thigh */}
            <div className="w-10 h-16 bg-zinc-800 rounded-t-xl" />
            {/* Lower leg (bent forward) */}
            <div className="w-10 h-12 bg-zinc-900 rounded-b-xl absolute top-12 left-0 origin-top rotate-x-45" />
          </div>
          <div className="relative">
            {/* Thigh */}
            <div className="w-10 h-16 bg-zinc-800 rounded-t-xl" />
            {/* Lower leg (bent forward) */}
            <div className="w-10 h-12 bg-zinc-900 rounded-b-xl absolute top-12 left-0 origin-top rotate-x-45" />
          </div>
        </div>

        {/* Floating Status Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
            className={`absolute top-0 -right-6 w-8 h-8 ${style.accent} rounded-lg shadow-xl flex items-center justify-center text-sm text-white font-bold z-30`}
            style={{ transform: 'translateZ(60px)' }}
          >
            {state === 'success' ? '✓' : state === 'error' ? '!' : state === 'typing' ? '...' : '?'}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CharacterAnimation;
