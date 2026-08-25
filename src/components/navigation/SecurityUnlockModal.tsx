import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ShieldAlert, ShieldCheck, X, Check, Delete, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

type ModalState = 'idle' | 'verifying' | 'success' | 'error';

export const SecurityUnlockModal: React.FC = () => {
  const { securityPrompt, verifyPin, closeSecurityPrompt } = useNavigation();
  const [pin, setPin] = useState<string>('');
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset modal on opening
  useEffect(() => {
    if (securityPrompt.isOpen) {
      setPin('');
      setModalState('idle');
      // Focus hidden input for instant typing and paste support
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [securityPrompt.isOpen]);

  // Handle PIN verification
  const executeVerification = useCallback((candidatePin: string) => {
    setModalState('verifying');

    setTimeout(() => {
      const success = verifyPin(candidatePin);
      if (success) {
        setModalState('success');
        setTimeout(() => {
          closeSecurityPrompt();
        }, 800);
      } else {
        setModalState('error');
        // Auto recovery sequence: shake -> reset -> restore focus
        setTimeout(() => {
          setPin('');
          setModalState('idle');
          inputRef.current?.focus();
        }, 1200);
      }
    }, 450);
  }, [verifyPin, closeSecurityPrompt]);

  const handleCharInput = useCallback((char: string) => {
    if (modalState === 'verifying' || modalState === 'success') return;
    if (pin.length < 8) {
      const nextPin = pin + char;
      setPin(nextPin);
      if (modalState === 'error') setModalState('idle');

      if (nextPin.length === 4) {
        executeVerification(nextPin);
      }
    }
  }, [pin, modalState, executeVerification]);

  const handleDelete = useCallback(() => {
    if (modalState === 'verifying' || modalState === 'success') return;
    setPin((prev) => prev.slice(0, -1));
    if (modalState === 'error') setModalState('idle');
  }, [modalState]);

  // Physical Keyboard Listener + Paste Handler
  useEffect(() => {
    if (!securityPrompt.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalState === 'verifying' || modalState === 'success') return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleCharInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pin.length > 0) executeVerification(pin);
      } else if (e.key === 'Escape') {
        closeSecurityPrompt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [securityPrompt.isOpen, modalState, pin, handleCharInput, handleDelete, executeVerification, closeSecurityPrompt]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    const cleanNumeric = pastedText.replace(/\D/g, '').slice(0, 8);
    if (cleanNumeric) {
      setPin(cleanNumeric);
      setModalState('idle');
      if (cleanNumeric.length >= 4) {
        executeVerification(cleanNumeric);
      }
    }
  };

  if (!securityPrompt.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 selection:bg-none">
        {/* Glass Distortion Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSecurityPrompt}
          className={`absolute inset-0 transition-colors duration-500 backdrop-blur-xl ${
            modalState === 'error'
              ? 'bg-rose-950/40 backdrop-hue-rotate-15'
              : modalState === 'success'
              ? 'bg-emerald-950/30'
              : 'bg-black/80'
          }`}
        />

        {/* Hidden Input for Mobile / Paste Accessibility */}
        <input
          ref={inputRef}
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          value={pin}
          onChange={() => {}}
          onPaste={handlePaste}
          className="sr-only"
          aria-hidden="true"
        />

        {/* Main Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={
            modalState === 'error'
              ? {
                  opacity: 1,
                  scale: 1,
                  x: [-14, 14, -10, 10, -5, 5, 0],
                  transition: { duration: 0.45, ease: 'easeInOut' },
                }
              : modalState === 'success'
              ? { opacity: 1, scale: 1.03, y: 0 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className={`relative w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl border transition-all duration-300 text-white ${
            modalState === 'error'
              ? 'bg-neutral-950/90 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)]'
              : modalState === 'success'
              ? 'bg-neutral-950/95 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
              : 'bg-neutral-950/90 border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={closeSecurityPrompt}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header & Icon Morph */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              animate={{
                scale: modalState === 'success' ? [1, 1.2, 1] : 1,
                rotate: modalState === 'success' ? [0, -10, 0] : 0,
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner border transition-all duration-300 ${
                modalState === 'error'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : modalState === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-focus-main/15 border-focus-neon/30 text-focus-neon'
              }`}
            >
              <AnimatePresence mode="wait">
                {modalState === 'verifying' ? (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Loader2 size={26} className="animate-spin text-focus-neon" />
                  </motion.div>
                ) : modalState === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Unlock size={26} />
                  </motion.div>
                ) : modalState === 'error' ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <ShieldAlert size={26} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Lock size={26} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <h3 className="text-lg font-display font-bold tracking-tight text-white">
              {modalState === 'success'
                ? 'Erişim Onaylandı'
                : modalState === 'verifying'
                ? 'Doğrulanıyor...'
                : 'Güvenlik Korumalı Alan'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[250px]">
              <span className="font-semibold text-neutral-200">{securityPrompt.targetTitle}</span> alanına erişmek için PIN kodunuzu girin.
            </p>
          </div>

          {/* PIN Indicators & Password Reveal Toggle */}
          <div className="relative flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3].map((i) => {
                const char = pin[i];
                const isFilled = char !== undefined;
                const isLatest = pin.length - 1 === i;

                return (
                  <motion.div
                    key={i}
                    animate={{
                      scale: isLatest && isFilled ? [1, 1.25, 1] : 1,
                    }}
                    transition={{ duration: 0.18 }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border font-mono font-bold text-base transition-all duration-200 ${
                      modalState === 'error'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : modalState === 'success'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : isFilled
                        ? 'bg-focus-main/20 border-focus-neon text-white shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                        : 'bg-white/5 border-white/15 text-neutral-600'
                    }`}
                  >
                    {isFilled ? (
                      showPassword ? (
                        <span>{char}</span>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-focus-neon shadow-[0_0_8px_#00E5FF]" />
                      )
                    ) : (
                      <span className="text-neutral-600 text-xs">•</span>
                    )}
                  </motion.div>
                );
              })}

              {/* Eye Toggle for Password Reveal */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Gizle' : 'Göster'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Micro Feedback Status Text */}
            <AnimatePresence mode="wait">
              {modalState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-1.5 text-rose-400 text-xs font-semibold"
                >
                  <ShieldAlert size={14} /> Hatalı PIN kodu. Tekrar deneniyor...
                </motion.div>
              )}
              {modalState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold"
                >
                  <ShieldCheck size={14} /> Doğrulandı, sayfa açılıyor...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad Buttons (Level 1 Micro Interaction Feedback) */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <motion.button
                key={num}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleCharInput(num)}
                disabled={modalState === 'verifying' || modalState === 'success'}
                className="h-12 rounded-2xl bg-white/5 hover:bg-white/12 active:bg-white/20 border border-white/10 font-display font-semibold text-lg text-white transition-colors duration-150 flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                {num}
              </motion.button>
            ))}

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleDelete}
              disabled={modalState === 'verifying' || modalState === 'success'}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/12 active:bg-white/20 border border-white/10 text-neutral-400 hover:text-white transition-colors duration-150 flex items-center justify-center cursor-pointer disabled:opacity-40"
              title="Sil"
            >
              <Delete size={18} />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleCharInput('0')}
              disabled={modalState === 'verifying' || modalState === 'success'}
              className="h-12 rounded-2xl bg-white/5 hover:bg-white/12 active:bg-white/20 border border-white/10 font-display font-semibold text-lg text-white transition-colors duration-150 flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              0
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => executeVerification(pin)}
              disabled={!pin || modalState === 'verifying' || modalState === 'success'}
              className="h-12 rounded-2xl bg-focus-main hover:bg-focus-main/90 active:bg-focus-main/80 text-white font-semibold text-sm transition-colors duration-150 flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-lg shadow-focus-main/20"
              title="Onayla"
            >
              <Check size={18} />
            </motion.button>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-1 border-t border-white/5">
            <span className="text-[11px] text-neutral-500">
              Klavye ile doğrudan yazabilir veya yapıştırabilirsiniz (<strong className="text-neutral-400 font-mono">1234</strong>).
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
