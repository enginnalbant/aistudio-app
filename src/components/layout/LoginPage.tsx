import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { InteractiveCharacters } from './InteractiveCharacters';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Mail,
  Lock,
  Smartphone,
  KeyRound,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

// Maps common Supabase / Postgres auth error messages/codes into highly readable Turkish explanations
function translateAuthError(error: any): string {
  if (!error) return 'Bilinmeyen bir hata oluştu.';
  const message = error.message || String(error);

  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Giriş bilgileri geçersiz. E-posta adresinizi veya şifrenizi kontrol edin.';
  }
  if (message.includes('User already registered') || message.includes('already_registered')) {
    return 'Bu e-posta adresiyle zaten kayıtlı bir kullanıcı bulunuyor.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'Güvenliğiniz için şifreniz en az 6 karakterden oluşmalıdır.';
  }
  if (message.includes('Email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.';
  }
  if (message.includes('Too many requests') || message.includes('rate limit')) {
    return 'Çok fazla istek gönderildi. Lütfen bir dakika bekledikten sonra tekrar deneyin.';
  }
  if (message.includes('signup_disabled')) {
    return 'Yeni kullanıcı kaydı şu anda geçici olarak devre dışıdır.';
  }
  if (message.includes('SMS spoofing') || message.includes('sms_provider_error')) {
    return 'SMS gönderimi sırasında bir hata oluştu. Lütfen numaranızı kontrol edin.';
  }
  if (message.includes('Invalid OTP') || message.includes('invalid_grant')) {
    return 'Girilen 6 haneli doğrulama kodu geçersiz veya süresi dolmuş.';
  }

  return `Kimlik doğrulama hatası: ${message}`;
}

export function LoginPage() {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInAsGuest,
    signInWithPhone,
    verifyPhoneOTP
  } = useAuth();

  // Form Mode & Input Fields
  const [isRegister, setIsRegister] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Styling & UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3D Model Reaction Controllers
  const [focusField, setFocusField] = useState<'email' | 'password' | 'none'>('none');
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Trigger error state and shake the 3D characters
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsError(true);
    setTimeout(() => {
      setIsError(false);
    }, 1500);
  };

  // Basic email validation regex
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Submit Handler: Email & Password (Login or Register)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // 1. Validation checks
    if (!email.trim() || !password) {
      triggerError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!isValidEmail(email)) {
      triggerError('Lütfen geçerli bir e-posta adresi girin (örn. adsoyad@sirket.com).');
      return;
    }

    if (password.length < 6) {
      triggerError('Şifreniz güvenlik nedeniyle en az 6 karakter uzunluğunda olmalıdır.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        // Register / Sign Up
        const { error } = await signUp(email, password, { display_name: email.split('@')[0] });
        if (error) throw error;
        setInfoMsg('Kayıt başarılı! E-posta adresinizi doğrulayabilir veya doğrudan giriş yapabilirsiniz.');
        setIsRegister(false);
      } else {
        // Login / Sign In
        const { error } = await signIn(email, password);
        if (error) throw error;
        setIsSuccess(true);
      }
    } catch (err: any) {
      triggerError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler: Request OTP via SMS
  const handlePhoneRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // Clean and validate Turkish phone number format (+905xxxxxxxxxx)
    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!cleanedPhone) {
      triggerError('Lütfen telefon numaranızı girin.');
      return;
    }

    if (!cleanedPhone.startsWith('+')) {
      triggerError('Telefon numarası ülke kodu ile başlamalıdır (Örn: +905XXXXXXXXX).');
      return;
    }

    if (cleanedPhone.length < 10) {
      triggerError('Lütfen geçerli uzunlukta bir telefon numarası girin.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signInWithPhone(cleanedPhone);
      if (error) throw error;
      setOtpSent(true);
      setInfoMsg('Tek kullanımlık 6 haneli SMS kodu telefonunuza gönderildi.');
    } catch (err: any) {
      triggerError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler: Verify OTP Code
  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      triggerError('Lütfen telefonunuza gelen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await verifyPhoneOTP(phone, otp);
      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      triggerError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      triggerError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background transition-colors duration-500 overflow-y-auto">

      {/* LEFT COLUMN: Stylized 3D Character Stage & Header */}
      <div className="flex-1 flex flex-col justify-between p-8 lg:p-16 relative overflow-hidden bg-gradient-to-br from-void-black/20 to-focus-void/30 border-r border-border/10 min-h-[450px]">

        {/* Top Header Row */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-focus-main flex items-center justify-center shadow-lg shadow-focus-main/30">
            <Zap size={20} className="text-pure-white" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter text-text-primary">
            APEX<span className="text-focus-neon">OS</span>
          </span>
        </div>

        {/* Central 3D Canvas Stage */}
        <div className="flex-1 flex items-center justify-center my-6">
          <InteractiveCharacters
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
          />
        </div>

        {/* Bottom Stage Text */}
        <div className="space-y-3 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-focus-neon/10 border border-focus-neon/20 text-focus-neon text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Yapay Zeka & 3D Destekli İşletim Sistemi
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-black text-text-primary tracking-tight">
            Geleceğin OS Deneyimiyle Tanışın
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed opacity-70">
            Kişisel Finans, Notlarım, Kütüphane ve Bülten modülleriniz tüm cihazlarınızda gerçek zamanlı Supabase veri tabanıyla senkronize edilir. Sol taraftaki dost canlısı robot asistanlarımız form alanlarına göre canlı tepki verir!
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Frosted Form Panel */}
      <div className="w-full lg:w-[540px] flex flex-col justify-center p-6 lg:p-12 relative z-10 bg-skel-space/5">

        <div className="w-full max-w-sm mx-auto space-y-8">

          {/* Section Titles */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-display font-black tracking-tight text-text-primary">
              {isRegister ? 'Hesap Oluştur' : 'Sisteme Bağlan'}
            </h1>
            <p className="text-text-secondary text-sm">
              {isRegister
                ? 'Bilgilerinizi doldurarak ücretsiz hesabınızı oluşturun.'
                : 'ApexOS evrenine giriş yapmak için tercih ettiğiniz yöntemi seçin.'
              }
            </p>
          </div>

          {/* Form Selector Tabs (Only when not requesting OTP) */}
          {!otpSent && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-skel-matte/10 border border-skel-metal/5 text-sm font-semibold">
              <button
                onClick={() => { setUsePhone(false); setErrorMsg(null); setInfoMsg(null); }}
                className={`py-2.5 rounded-lg transition-all duration-300 cursor-pointer ${!usePhone ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                E-Posta / Şifre
              </button>
              <button
                onClick={() => { setUsePhone(true); setErrorMsg(null); setInfoMsg(null); }}
                className={`py-2.5 rounded-lg transition-all duration-300 cursor-pointer ${usePhone ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Telefon No (OTP)
              </button>
            </div>
          )}

          {/* Alert Messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-crit-pale border border-crit-vivid/20 text-crit-vivid text-xs font-bold flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-crit-vivid mt-1.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {infoMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-grow-mint border border-grow-phosphor/20 text-grow-main text-xs font-bold flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-grow-phosphor mt-1.5" />
                <span>{infoMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Interactive Forms */}
          <div className="space-y-4">

            {/* 1. EMAIL & PASSWORD LOGIN / REGISTER */}
            {!usePhone && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">E-Posta Adresi</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-secondary/40">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusField('email')}
                      onBlur={() => setFocusField('none')}
                      placeholder="adsoyad@sirket.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10 focus:outline-none focus:border-focus-neon/50 focus:ring-4 focus:ring-focus-neon/5 text-text-primary transition-all duration-300 placeholder:text-text-secondary/30 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Parola</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-secondary/40">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusField('password')}
                      onBlur={() => setFocusField('none')}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10 focus:outline-none focus:border-focus-neon/50 focus:ring-4 focus:ring-focus-neon/5 text-text-primary transition-all duration-300 placeholder:text-text-secondary/30 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  className="w-full py-3.5 px-4 rounded-xl bg-focus-main text-pure-white font-bold text-sm tracking-wide shadow-lg shadow-focus-main/30 hover:shadow-xl hover:shadow-focus-main/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      {isRegister ? 'Hesap Oluştur' : 'Giriş Yap'} <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. PHONE OTP REQUEST */}
            {usePhone && !otpSent && (
              <form onSubmit={handlePhoneRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">Telefon Numarası</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-secondary/40">
                      <Smartphone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+905551234567"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10 focus:outline-none focus:border-focus-neon/50 focus:ring-4 focus:ring-focus-neon/5 text-text-primary transition-all duration-300 placeholder:text-text-secondary/30 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  className="w-full py-3.5 px-4 rounded-xl bg-focus-main text-pure-white font-bold text-sm tracking-wide shadow-lg shadow-focus-main/30 hover:shadow-xl hover:shadow-focus-main/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <>
                      SMS Kodu Gönder <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. PHONE OTP VERIFY */}
            {usePhone && otpSent && (
              <form onSubmit={handlePhoneVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-bold">6 Haneli SMS Kodu</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-secondary/40">
                      <KeyRound size={16} />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-skel-matte/5 border border-skel-metal/10 focus:outline-none focus:border-focus-neon/50 focus:ring-4 focus:ring-focus-neon/5 text-text-primary transition-all duration-300 placeholder:text-text-secondary/30 text-sm font-semibold text-center tracking-[0.4em]"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); setErrorMsg(null); setInfoMsg(null); }}
                    className="flex-1 py-3 px-4 rounded-xl bg-skel-matte/10 hover:bg-skel-matte/15 text-text-primary text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Geri Git
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    onMouseEnter={() => setIsHoveringSubmit(true)}
                    onMouseLeave={() => setIsHoveringSubmit(false)}
                    className="flex-[2] py-3 px-4 rounded-xl bg-focus-main text-pure-white font-bold text-sm tracking-wide shadow-lg shadow-focus-main/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Kodu Doğrula'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Social / OAuth Logins (Only if not verifying OTP) */}
          {!otpSent && (
            <div className="space-y-4 pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/10"></div>
                <span className="flex-shrink mx-4 text-text-secondary/40 text-[10px] font-mono uppercase tracking-widest font-bold">Veya Diğer Yollar</span>
                <div className="flex-grow border-t border-border/10"></div>
              </div>

              {/* Google OAuth Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-bg-card border border-border hover:bg-skel-matte/10 text-text-primary font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google ile Giriş Yap
              </button>

              {/* Guest / Demo Login */}
              <button
                type="button"
                onClick={signInAsGuest}
                className="w-full py-3 px-4 rounded-xl bg-skel-matte/10 hover:bg-skel-matte/15 text-text-primary font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                Misafir Olarak Giriş Yap
              </button>
            </div>
          )}

          {/* Mode Switcher footer */}
          {!usePhone && !otpSent && (
            <p className="text-center text-xs text-text-secondary">
              {isRegister ? 'Zaten bir hesabınız var mı? ' : 'Henüz hesabınız yok mu? '}
              <button
                onClick={() => { setIsRegister(!isRegister); setErrorMsg(null); setInfoMsg(null); }}
                className="font-bold text-focus-neon hover:underline cursor-pointer"
              >
                {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
