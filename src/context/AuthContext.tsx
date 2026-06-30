import React, { createContext, useContext, useEffect, useState } from 'react';

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

const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@nexus.com',
  user_metadata: { full_name: 'Admin User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(MOCK_USER);
  const [session, setSession] = useState<any | null>({ user: MOCK_USER, access_token: 'mock-token' });
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setUser(null);
    setSession(null);
  };

  const signIn = async (email: string, password: string) => {
    setUser(MOCK_USER);
    setSession({ user: MOCK_USER, access_token: 'mock-token' });
    return { data: { user: MOCK_USER }, error: null };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    return { data: { user: MOCK_USER }, error: null };
  };

  const signInWithGoogle = async () => {
    setUser(MOCK_USER);
    setSession({ user: MOCK_USER, access_token: 'mock-token' });
    return { data: { user: MOCK_USER }, error: null };
  };

  const signInAsGuest = () => {
    setUser(MOCK_USER);
    setSession({ user: MOCK_USER, access_token: 'mock-token' });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn, signUp, signInWithGoogle, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
