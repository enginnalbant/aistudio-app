import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UnifiedUser {
  uid: string;
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: UnifiedUser | null;
  accessToken: string | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data: any, error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any, error: any }>;
  signInWithGoogle: () => Promise<{ data: any, error: any }>;
  signInAsGuest: () => void;
  signInWithPhone: (phone: string) => Promise<{ data: any, error: any }>;
  verifyPhoneOTP: (phone: string, token: string) => Promise<{ data: any, error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signInWithGoogle: async () => ({ data: null, error: null }),
  signInAsGuest: () => {},
  signInWithPhone: async () => ({ data: null, error: null }),
  verifyPhoneOTP: async () => ({ data: null, error: null }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to ensure profile row exists in DB
  const ensureProfileExists = async (sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', sessionUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile does not exist, insert it
        await supabase.from('profiles').insert({
          id: sessionUser.id,
          email: sessionUser.email,
          display_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.display_name || sessionUser.email?.split('@')[0],
          avatar_url: sessionUser.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + sessionUser.id,
        });
        console.log('[Supabase Auth] Profile row created successfully.');
      }
    } catch (err: any) {
      console.warn('[Supabase Auth Warning] Error during auto profiling:', err.message);
    }
  };

  useEffect(() => {
    // 1. Initial Session Check from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const unified: UnifiedUser = {
          uid: session.user.id,
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
          photoURL: session.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + session.user.id,
          phone: session.user.phone,
        };
        setUser(unified);
        setSession(session);
        setAccessToken(session.access_token);
        ensureProfileExists(session.user);
      } else {
        // Fallback to local guest if saved in localStorage
        const guest = {
          uid: 'guest-user',
          id: 'guest-user',
          email: 'misafir@apexos.com',
          displayName: 'Misafir Kullanıcı',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
          isGuest: true,
        };
        localStorage.setItem('guest_user', JSON.stringify(guest));
        setUser(guest);
      }
      setLoading(false);
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const unified: UnifiedUser = {
          uid: session.user.id,
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
          photoURL: session.user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + session.user.id,
          phone: session.user.phone,
        };
        setUser(unified);
        setSession(session);
        setAccessToken(session.access_token);
        ensureProfileExists(session.user);
      } else {
        const guest = {
          uid: 'guest-user',
          id: 'guest-user',
          email: 'misafir@apexos.com',
          displayName: 'Misafir Kullanıcı',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
          isGuest: true,
        };
        localStorage.setItem('guest_user', JSON.stringify(guest));
        setUser(guest);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('guest_user');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAccessToken(null);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('[Supabase Auth] Login Error:', error.message);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('[Supabase Auth] Registration Error:', error.message);
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('[Supabase Auth] Google Auth Error:', error.message);
      return { data: null, error };
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('[Supabase Auth] Phone OTP Request Error:', error.message);
      return { data: null, error };
    }
  };

  const verifyPhoneOTP = async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('[Supabase Auth] Phone OTP Verification Error:', error.message);
      return { data: null, error };
    }
  };

  const signInAsGuest = () => {
    const guest: UnifiedUser = {
      uid: 'guest-user',
      id: 'guest-user',
      email: 'misafir@apexos.com',
      displayName: 'Misafir Kullanıcı',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      isGuest: true,
    };
    localStorage.setItem('guest_user', JSON.stringify(guest));
    setUser(guest);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, session, loading, signOut, signIn, signUp, signInWithGoogle, signInAsGuest, signInWithPhone, verifyPhoneOTP }}>
      {children}
    </AuthContext.Provider>
  );
}
