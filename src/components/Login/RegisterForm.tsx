import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const registerSchema = z.object({
  fullName: z.string().min(3, 'Ad soyad en az 3 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Kullanım koşullarını kabul etmelisiniz',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onStateChange: (state: any) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onStateChange,
  onSwitchToLogin,
}) => {
  console.log('RegisterForm rendered');
  const [step, setStep] = useState(1);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const values = watch();

  useEffect(() => {
    if (isSubmitting) {
      onStateChange('thinking');
    } else if (isError) {
      onStateChange('error');
      const timer = setTimeout(() => setIsError(false), 2000);
      return () => clearTimeout(timer);
    } else if (values.password && values.password.length > 0) {
      onStateChange('peeking');
    } else if (values.fullName || values.email || values.phone) {
      onStateChange('typing');
    } else {
      onStateChange('idle');
    }
  }, [values, onStateChange, isSubmitting, isError]);

  const nextStep = async () => {
    let fields: (keyof RegisterFormValues)[] = [];
    if (step === 1) fields = ['fullName', 'email', 'phone'];
    if (step === 2) fields = ['password', 'confirmPassword'];

    const isValid = await trigger(fields);
    if (isValid) {
      setStep(step + 1);
      onStateChange('surprised');
    } else {
      onStateChange('error');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    onStateChange('thinking');
  };

  const { signUp } = useAuth();

  const onSubmit = async (data: RegisterFormValues) => {
    const { error } = await signUp(data.email, data.password, { 
      full_name: data.fullName,
      phone: data.phone 
    });
    if (error) {
      setIsError(true);
      console.error('Registration error:', error);
      if ('details' in error) {
        console.error('Error details:', (error as any).details);
      }
      if ('hint' in error) {
        console.error('Error hint:', (error as any).hint);
      }
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(values.password);

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
          className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          <UserPlus className="w-3 h-3" />
          Yeni Hesap Oluştur
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white"
        >
          Bize Katılın
        </motion.h2>
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                step === s ? "w-8 bg-indigo-600" : "w-4 bg-zinc-200 dark:bg-zinc-800",
                step > s && "bg-emerald-500"
              )}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Ad Soyad</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    {...register('fullName')}
                    className={cn(
                      "block w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                      errors.fullName && "border-red-500"
                    )}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && <p className="text-xs font-bold text-red-500 ml-2">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">E-posta</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className={cn(
                      "block w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                      errors.email && "border-red-500"
                    )}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs font-bold text-red-500 ml-2">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Telefon</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    {...register('phone')}
                    className={cn(
                      "block w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                      errors.phone && "border-red-500"
                    )}
                    placeholder="5xx xxx xx xx"
                  />
                </div>
                {errors.phone && <p className="text-xs font-bold text-red-500 ml-2">{errors.phone.message}</p>}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Şifre</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className={cn(
                      "block w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                      errors.password && "border-red-500"
                    )}
                    placeholder="••••••••"
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <span>Şifre Gücü</span>
                    <span>%{strength}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength}%` }}
                      className={cn(
                        "h-full transition-all duration-500",
                        strength <= 25 ? "bg-red-500" :
                        strength <= 50 ? "bg-orange-500" :
                        strength <= 75 ? "bg-yellow-500" : "bg-emerald-500"
                      )}
                    />
                  </div>
                </div>
                {errors.password && <p className="text-xs font-bold text-red-500 ml-2">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-2">Şifre Tekrar</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className={cn(
                      "block w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-medium",
                      errors.confirmPassword && "border-red-500"
                    )}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs font-bold text-red-500 ml-2">{errors.confirmPassword.message}</p>}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6 text-center"
            >
              <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-500/20">
                <CheckCircle2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Neredeyse Hazır!</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Hesabınızı oluşturmak için kullanım koşullarını kabul etmeniz gerekmektedir.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-all">
                <div className="relative flex items-center justify-center mt-1">
                  <input
                    type="checkbox"
                    {...register('terms')}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all" />
                  <div className="absolute opacity-0 peer-checked:opacity-100 text-white transition-opacity">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-normal">
                  Kullanım Koşullarını ve Gizlilik Politikasını okudum, kabul ediyorum.
                </span>
              </label>
              {errors.terms && <p className="text-xs font-bold text-red-500">{errors.terms.message}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={prevStep}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-black transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri
            </motion.button>
          )}
          
          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -12px rgba(79, 70, 229, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={nextStep}
              className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/25 transition-all border border-red-500"
            >
              Devam Et
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -12px rgba(79, 70, 229, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/25 transition-all disabled:opacity-50 border border-red-500"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </form>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-zinc-600 dark:text-zinc-400 font-medium"
      >
        Zaten hesabınız var mı?{' '}
        <motion.button
          whileHover={{ scale: 1.05, color: '#4f46e5' }}
          onClick={() => {
            onSwitchToLogin();
            onStateChange('cool');
          }}
          className="font-black text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Giriş Yap
        </motion.button>
      </motion.p>
    </motion.div>
  );
};

export default RegisterForm;
