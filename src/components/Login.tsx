import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion } from 'motion/react';
import { Lock, Mail, ShieldCheck, Zap } from 'lucide-react';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase bağlantısı kurulamadı. Lütfen .env dosyanızı kontrol edin.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-void-black text-text-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-focus-main/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-ai-royal/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bento-card p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-focus-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex flex-col items-center mb-10 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-focus-main/10 text-focus-neon flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(30,144,255,0.2)]">
              <Zap size={40} className="animate-pulse" />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tighter text-void-white">Nexus OS</h1>
            <p className="text-sm font-mono text-skel-metal uppercase tracking-[0.3em] mt-2">Sistem Erişimi</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 rounded-xl bg-crit-blood/10 border border-crit-blood/20 text-crit-vivid text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-nrg-sun/10 border border-nrg-sun/20 text-nrg-sun text-sm font-medium">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-skel-metal">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-skel-space/50 border border-skel-metal/20 rounded-xl py-3 pl-12 pr-4 text-void-white placeholder-skel-metal focus:outline-none focus:border-focus-neon/50 focus:ring-1 focus:ring-focus-neon/50 transition-all font-medium"
                  placeholder="E-posta adresi"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-skel-metal">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-skel-space/50 border border-skel-metal/20 rounded-xl py-3 pl-12 pr-4 text-void-white placeholder-skel-metal focus:outline-none focus:border-focus-neon/50 focus:ring-1 focus:ring-focus-neon/50 transition-all font-medium"
                  placeholder="Şifre"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-focus-main text-pure-white font-display font-bold text-lg hover:bg-focus-main/90 transition-all shadow-lg shadow-focus-main/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-pure-white/20 border-t-pure-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  {isSignUp ? 'Kayıt Ol' : 'Sisteme Giriş Yap'}
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-skel-metal hover:text-focus-neon text-sm transition-colors"
              >
                {isSignUp ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
