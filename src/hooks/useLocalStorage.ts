import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const storedValueRef = useRef(storedValue);
  const isWritingRef = useRef(false);

  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Sync data from local storage to Firebase if Firebase is empty, or load from Firebase
        const docRef = doc(db, `users/${user.uid}/app_state/${key}`);
        
        const unsubscribeSnapshot = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data().data as T;
            if (data !== undefined && JSON.stringify(data) !== JSON.stringify(storedValueRef.current) && !isWritingRef.current) {
               setStoredValue(data);
               window.localStorage.setItem(key, JSON.stringify(data));
            }
          } else {
             // Document doesn't exist, let's create it with local data if we have any
             if (JSON.stringify(storedValueRef.current) !== JSON.stringify(initialValue) && Array.isArray(storedValueRef.current) && storedValueRef.current.length > 0) {
                 setDoc(docRef, { data: storedValueRef.current }, { merge: true });
             }
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);
      storedValueRef.current = valueToStore;
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event('local-storage'));
      }

      if (auth.currentUser) {
        isWritingRef.current = true;
        const docRef = doc(db, `users/${auth.currentUser.uid}/app_state/${key}`);
        setDoc(docRef, { data: valueToStore }, { merge: true }).finally(() => {
           setTimeout(() => { isWritingRef.current = false; }, 500);
        });
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
