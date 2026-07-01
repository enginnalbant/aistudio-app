import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setSession(currentUser ? { user: currentUser } : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: userCredential.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       return { data: { user: userCredential.user }, error: null };
    } catch (error) {
       return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      return { data: { user: userCredential.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInAsGuest = () => {
    // Optionally implement anonymous login using signInAnonymously(auth)
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signIn, signUp, signInWithGoogle, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
