import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

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

  // Sync with Supabase on mount/auth state change
  useEffect(() => {
    let channel: any = null;

    const setupSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      try {
        // 1. Initial Fetch
        const { data, error } = await supabase
          .from('app_states')
          .select('data')
          .eq('user_id', user.id)
          .eq('key', key)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          const cloudVal = data.data as T;
          if (JSON.stringify(cloudVal) !== JSON.stringify(storedValueRef.current) && !isWritingRef.current) {
            setStoredValue(cloudVal);
            window.localStorage.setItem(key, JSON.stringify(cloudVal));
          }
        } else {
          // Row does not exist in DB, insert if local value is non-empty
          if (JSON.stringify(storedValueRef.current) !== JSON.stringify(initialValue)) {
            await supabase.from('app_states').upsert({
              user_id: user.id,
              key: key,
              data: storedValueRef.current,
              updated_at: new Date().toISOString()
            });
          }
        }

        // 2. Realtime subscription to state changes
        channel = supabase
          .channel(`state_sync_${key}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'app_states', filter: `user_id=eq.${user.id}` },
            (payload) => {
              if (payload.new && payload.new.key === key) {
                const cloudVal = payload.new.data as T;
                if (JSON.stringify(cloudVal) !== JSON.stringify(storedValueRef.current) && !isWritingRef.current) {
                  setStoredValue(cloudVal);
                  window.localStorage.setItem(key, JSON.stringify(cloudVal));
                }
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.warn(`[Supabase State Sync] Error for key "${key}":`, err);
      }
    };

    setupSync();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [key, initialValue]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);
      storedValueRef.current = valueToStore;
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event('local-storage'));
      }

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        isWritingRef.current = true;
        await supabase.from('app_states').upsert({
          user_id: user.id,
          key: key,
          data: valueToStore,
          updated_at: new Date().toISOString()
        });
        setTimeout(() => { isWritingRef.current = false; }, 500);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
