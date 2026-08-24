import { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db, doc, setDoc, onSnapshot } from '../lib/firebase';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`[Storage] JSON parse error for key "${key}":`, error);
      return initialValue;
    }
  });

  const storedValueRef = useRef(storedValue);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  // 1. Cross-Tab Local Storage Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      try {
        const isCustom = 'detail' in e;
        if (!isCustom && (e as StorageEvent).key !== key) return;
        
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          setStoredValue(parsed);
          storedValueRef.current = parsed;
        }
      } catch (err) {
        // Ignore parse error
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage-sync' as any, handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage-sync' as any, handleStorageChange as EventListener);
    };
  }, [key]);

  // 2. Cloud Firestore Realtime Synchronization (When user is authenticated)
  useEffect(() => {
    if (!auth || !db) return;

    let unsubscribe: (() => void) | null = null;

    const setupCloudSync = () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, 'user_data', user.uid, 'store', key);
        unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && data.value !== undefined) {
              const cloudValue = data.value as T;
              // Avoid cyclic overwrite if local value matches
              if (JSON.stringify(cloudValue) !== JSON.stringify(storedValueRef.current)) {
                isSyncingRef.current = true;
                setStoredValue(cloudValue);
                storedValueRef.current = cloudValue;
                try {
                  window.localStorage.setItem(key, JSON.stringify(cloudValue));
                } catch {}
                isSyncingRef.current = false;
              }
            }
          }
        }, (err) => {
          // Silent catch for security rule boundaries or offline state
          console.debug(`[CloudSync] Snapshot listener offline or restricted for key ${key}:`, err.message);
        });
      } catch (err) {
        console.debug(`[CloudSync] Setup skipped for key ${key}`);
      }
    };

    setupCloudSync();

    const authUnsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setupCloudSync();
      } else if (unsubscribe) {
        unsubscribe();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      authUnsub();
    };
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);
      storedValueRef.current = valueToStore;
      
      // Local persistence
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key, value: valueToStore } }));
      }

      // Cloud persistence (Debounced Background Task)
      const user = auth?.currentUser;
      if (user && db && !isSyncingRef.current) {
        const docRef = doc(db, 'user_data', user.uid, 'store', key);
        setDoc(docRef, {
          value: valueToStore,
          updatedAt: Date.now(),
          key
        }, { merge: true }).catch((err) => {
          console.debug(`[CloudSync] Failed to save key "${key}" to Firestore (will remain in LocalStorage):`, err.message);
        });
      }
    } catch (error) {
      console.warn(`[Storage] Error setting storage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

export const useSyncedStorage = useLocalStorage;
