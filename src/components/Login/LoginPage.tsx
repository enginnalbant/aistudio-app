import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import CharacterAnimation, { CharacterState, CharacterType } from './CharacterAnimation';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import LoginBackground from './LoginBackground';

const LoginPage: React.FC = () => {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('register');
  const [charState, setCharState] = useState<CharacterState>('idle');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = clientX - window.innerWidth / 2;
    const y = clientY - window.innerHeight / 2;
    setMousePos({ x, y });
  };

  const handleStateChange = useCallback((state: CharacterState) => {
    setCharState(state);
  }, []);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden selection:bg-indigo-500/30"
    >
      <LoginBackground />
      
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Panel: Animation Area */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col items-center justify-center space-y-12"
        >
          <div className="text-center space-y-4 max-w-lg">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20"
            >
              Geleceğin Arayüzü
            </motion.div>
            <h1 className="text-6xl font-black text-white leading-tight tracking-tighter">
              Sizinle Birlikte <span className="text-indigo-500">Yaşayan</span> Bir Ekip.
            </h1>
            <p className="text-xl text-zinc-400">
              Nexus ekibi hareketlerinize tepki verir. Onlarla etkileşime geçin!
            </p>
          </div>
 
          <div className="w-full flex justify-center gap-0 items-end h-[450px] relative">
            {/* Couch/Sofa Visual */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] h-[180px] bg-zinc-800 rounded-[3rem_3rem_1rem_1rem] shadow-2xl border-b-8 border-zinc-900 z-0">
              {/* Couch Back */}
              <div className="absolute -top-20 left-0 w-full h-[120px] bg-zinc-800 rounded-[3rem_3rem_0_0] border-t-4 border-zinc-700/30" />
              {/* Couch Armrests */}
              <div className="absolute -left-8 top-0 w-12 h-full bg-zinc-700 rounded-full shadow-inner" />
              <div className="absolute -right-8 top-0 w-12 h-full bg-zinc-700 rounded-full shadow-inner" />
              {/* Couch Texture/Cushions */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 border-r border-zinc-700/20" />
                <div className="flex-1 border-r border-zinc-700/20" />
                <div className="flex-1 border-r border-zinc-700/20" />
                <div className="flex-1" />
              </div>
            </div>

            {(['alex', 'sarah', 'leo', 'maya', 'zane'] as CharacterType[]).map((type, idx) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.5, type: 'spring' }}
                className="w-32 h-full relative -mx-2 z-10"
                style={{ 
                  marginBottom: idx % 2 === 0 ? '20px' : '10px',
                  zIndex: 10 + idx 
                }}
              >
                <CharacterAnimation 
                  state={charState} 
                  type={type}
                  mouseX={mousePos.x} 
                  mouseY={mousePos.y} 
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Panel: Form Area */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-center items-center"
        >
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
                  onStateChange={handleStateChange}
                  onSwitchToRegister={() => setView('register')}
                  onForgotPassword={() => alert('Şifre sıfırlama bağlantısı gönderildi!')}
                  onGuestLogin={signInAsGuest}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center bg-red-500"
              >
                <RegisterForm 
                  onStateChange={handleStateChange}
                  onSwitchToLogin={() => setView('login')}
                />
              </motion.div>
            )}
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
