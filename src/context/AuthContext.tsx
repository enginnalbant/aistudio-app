import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, browserPopupRedirectResolver, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
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
  accessToken: null,
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const testConnection = async () => {
      try {
        if (db) {
          await getDocFromServer(doc(db, 'test', 'connection'));
        }
      } catch (error) {
        console.warn("Firebase connection test failed (expected if collection 'test' is empty or rules block it):", error);
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAccessToken(null);
        setSession({ user: currentUser });
        setIsGuest(false);
        setLoading(false);
      } else {
        setUser(prev => {
          if (prev && prev.uid === 'guest-user') return prev;
          setAccessToken(null);
          setSession(null);
          return null;
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setAccessToken(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) return { data: null, error: new Error("Auth not initialized") };
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: userCredential.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!auth) return { data: null, error: new Error("Auth not initialized") };
    try {
       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       return { data: { user: userCredential.user }, error: null };
    } catch (error) {
       return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) return { data: null, error: new Error("Auth not initialized") };
    try {
      console.log("Initiating Google Sign-In popup...");
      // Explicitly use popup resolver to handle iframe constraints better
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
      
      console.log("Sign-In successful:", result.user.email);
      return { data: { user: result.user }, error: null };
    } catch (error: any) {
      console.error("Sign-In Error:", error);
      // Provide a more helpful error message for common iframe/popup issues
      let errorMessage = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Giriş penceresi kapatıldı.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Giriş isteği iptal edildi.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Tarayıcı pencereyi engelledi. Lütfen izin verin.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Google ile giriş Firebase konsolunda etkinleştirilmemiş olabilir.";
      }
      return { data: null, error: { ...error, message: errorMessage } };
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    setUser({
      uid: 'guest-user',
      email: 'misafir@apexos.com',
      displayName: 'Misafir Kullanıcı',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'
    } as any);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, session, loading, signOut, signIn, signUp, signInWithGoogle, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}
