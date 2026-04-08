import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Phone, Chrome, UserCheck, UserPlus, ArrowRight, Settings, History, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onStateChange: (state: any) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onGuestLogin?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onStateChange,
  onSwitchToRegister,
  onForgotPassword,
  onGuestLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  useEffect(() => {
    if (isSubmitting) {
      onStateChange('thinking');
    } else if (errorMessage) {
      onStateChange('error');
      const timer = setTimeout(() => setErrorMessage(null), 2000);
      return () => clearTimeout(timer);
    } else if (passwordValue.length > 0 && !showPassword) {
      onStateChange('peeking');
    } else if (passwordValue.length > 0 && showPassword) {
      onStateChange('unveiled');
    } else if (emailValue.length > 0) {
      onStateChange('typing');
    } else {
      onStateChange('idle');
    }
  }, [emailValue, passwordValue, showPassword, onStateChange, isSubmitting, errorMessage]);

  useEffect(() => {
    const saved = localStorage.getItem('saved_accounts');
    if (saved) {
      setSavedAccounts(JSON.parse(saved));
    }
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    onStateChange('pasting');
    setTimeout(() => onStateChange('idle'), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      onStateChange('deleting');
    }
  };

  const { signIn, signInWithGoogle } = useAuth();

  const onSubmit = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setErrorMessage(error.message);
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error(error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md space-y-8 p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 dark:border-zinc-800/50"
    >
      <div className="text-center space-y-3">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles className="w-3 h-3" />
          Giriş Paneli
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white"
        >
          Tekrar Hoş Geldiniz!
        </motion.h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Hesabınıza güvenle giriş yapın.</p>
      </div>

      {savedAccounts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {savedAccounts.map((email) => (
            <motion.button
              key={email}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setValue('email', email);
                onStateChange('surprised');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 shadow-sm whitespace-nowrap hover:border-indigo-500 transition-colors"
            >
              <History className="w-4 h-4 text-indigo-500" />
              {email}
            </motion.button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          {/* Email Field */}
          <motion.div 
            className="space-y-2"
          >
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">E-posta Adresi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                {...register('email')}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                type="email"
                className={cn(
                  "block w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                  errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                )}
                placeholder="ornek@mail.com"
              />
              <AnimatePresence>
                {emailValue && !errors.email && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-y-0 right-4 flex items-center text-emerald-500"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.email && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-red-500 ml-2">{errors.email.message}</motion.p>}
          </motion.div>

          {/* Password Field */}
          <motion.div 
            className="space-y-2"
          >
            <div className="flex justify-between items-center ml-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Şifre</label>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, x: 2 }}
                onClick={() => {
                  onForgotPassword();
                  onStateChange('thinking');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                Şifremi Unuttum?
              </motion.button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                {...register('password')}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                type={showPassword ? 'text' : 'password'}
                className={cn(
                  "block w-full pl-12 pr-14 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                  errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                )}
                placeholder="••••••••"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowPassword(!showPassword);
                  onStateChange(showPassword ? 'peeking' : 'unveiled');
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>
            {errors.password && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-red-500 ml-2">{errors.password.message}</motion.p>}
          </motion.div>
        </div>

        <div className="flex items-center justify-between px-2">
          <motion.label 
            whileHover={{ x: 5 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all" />
              <div className="absolute opacity-0 peer-checked:opacity-100 text-white transition-opacity">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">Beni Hatırla</span>
          </motion.label>
        </div>

        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-red-500 text-center"
          >
            {errorMessage}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -12px rgba(79, 70, 229, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.25rem] font-black shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
          <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-400">Veya şununla devam et</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button 
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-transparent hover:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all"
        >
          <Chrome className="w-5 h-5 text-red-500" />
          Google
        </motion.button>
        <motion.button 
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStateChange('cool')}
          className="flex items-center justify-center gap-3 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-transparent hover:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all"
        >
          <Phone className="w-5 h-5 text-green-500" />
          Telefon
        </motion.button>
      </div>

      <motion.button 
        type="button"
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          onStateChange('cool');
          if (onGuestLogin) onGuestLogin();
        }}
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-transparent hover:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all text-zinc-700 dark:text-zinc-300"
      >
        <UserCheck className="w-5 h-5 text-indigo-500" />
        Konuk Olarak Devam Et
      </motion.button>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium"
      >
        Hesabınız yok mu?{' '}
        <motion.button
          whileHover={{ scale: 1.05, color: '#4f46e5' }}
          onClick={() => {
            onSwitchToRegister();
            onStateChange('surprised');
          }}
          className="font-black text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5 border border-red-500"
        >
          <UserPlus className="w-4 h-4" />
          Şimdi Kaydol
        </motion.button>
      </motion.p>
    </motion.div>
  );
};

export default LoginForm;
