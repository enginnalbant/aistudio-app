import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import CharacterAnimation, { CharacterState } from './CharacterAnimation';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const { signInAsGuest } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [charState, setCharState] = useState<CharacterState>('idle');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = clientX - window.innerWidth / 2;
    const y = clientY - window.innerHeight / 2;
    setMousePos({ x, y });
  };

  const handleLogin = async (data: any) => {
    setCharState('success');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
    
    setTimeout(() => {
      signInAsGuest();
    }, 1000);
  };

  const handleRegister = async (data: any) => {
    setCharState('success');
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      signInAsGuest();
    }, 1000);
  };

  const handleStateChange = useCallback((state: CharacterState) => {
    setCharState(state);
  }, []);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden selection:bg-indigo-500/30 bg-transparent"
    >
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Panel: Animation Area */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col items-center justify-center space-y-8"
        >
          <div className="text-center space-y-4 max-w-md">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest"
            >
              Geleceğin Arayüzü
            </motion.div>
            <h1 className="text-5xl font-black text-zinc-900 dark:text-white leading-tight">
              Sizinle Birlikte <span className="text-indigo-600">Yaşayan</span> Bir Deneyim.
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Karakterimiz hareketlerinize tepki verir. Yazarken, silerken veya şifrenize bakarken onu izleyin!
            </p>
          </div>

          <div className="w-full aspect-square max-w-md relative">
            <CharacterAnimation 
              state={charState} 
              mouseX={mousePos.x} 
              mouseY={mousePos.y} 
            />
          </div>
        </motion.div>

        {/* Right Panel: Form Area */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-center items-center"
        >
          <AnimatePresence mode="wait">
            {view === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                <LoginForm 
                  onLogin={handleLogin}
                  onStateChange={handleStateChange}
                  onSwitchToRegister={() => setView('register')}
                  onForgotPassword={() => alert('Şifre sıfırlama bağlantısı gönderildi!')}
                  onGuestLogin={() => {
                    setCharState('success');
                    setTimeout(signInAsGuest, 1000);
                  }}
                  onDemoLogin={() => {
                    setCharState('success');
                    setTimeout(signInAsGuest, 1000);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                <RegisterForm 
                  onRegister={handleRegister}
                  onStateChange={handleStateChange}
                  onSwitchToLogin={() => setView('login')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile Character (Small version for mobile) */}
      <div className="lg:hidden fixed bottom-4 right-4 w-24 h-24 z-50 pointer-events-none">
        <CharacterAnimation state={charState} />
      </div>
    </div>
  );
};

export default LoginPage;
