import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserPopupRedirectResolver,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  increment, 
  getDoc, 
  getDocs,
  getDocFromServer,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

// Firebase configuration from the auto-generated config file
const firebaseConfig = {
  projectId: "studio-2411979060-e5b46",
  appId: "1:847724784887:web:a2ecad7a86b6d9fb45b7f2",
  apiKey: "AIzaSyDBgpoSaUBhjxqmenqhiTYXe5_Iyo3SZWw",
  authDomain: "studio-2411979060-e5b46.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-nexusosakllretim-2cb0c450-5907-4f7c-a9c8-de8445b9d92b",
  storageBucket: "studio-2411979060-e5b46.firebasestorage.app",
  messagingSenderId: "847724784887",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Export Firebase Auth functions
export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  browserPopupRedirectResolver
};
export type { User };

// Export Firestore functions
export {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  increment,
  getDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
  onSnapshot
};

// Compatibility helper for existing code
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
