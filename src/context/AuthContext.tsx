import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data: any, error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any, error: any }>;
  signInWithGoogle: () => Promise<{ data: any, error: any }>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signInWithGoogle: async () => ({ data: null, error: null }),
  signInAsGuest: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
      } else {
        // Default mock user for development
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@nexus.com',
          user_metadata: { full_name: 'Admin User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setSession({ user: mockUser, access_token: 'mock-token' });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
      } else if (!_event.includes('SIGNED_OUT')) {
        // Keep mock user if not explicitly signed out
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@nexus.com',
          user_metadata: { full_name: 'Admin User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setSession({ user: mockUser, access_token: 'mock-token' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signInAsGuest = () => {
    const guestUser = {
      id: 'guest-user-id',
      email: 'guest@example.com',
      user_metadata: { full_name: 'Misafir Kullanıcı' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    setSession({ user: guestUser, access_token: 'guest-token' });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn, signUp, signInWithGoogle, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
