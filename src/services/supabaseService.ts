import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface SyncResult {
  success: boolean;
  message: string;
  count?: number;
}

/**
 * Supabase synchronization engine designed with Offline-First LocalStorage Fallbacks.
 */
export const supabaseService = {
  /**
   * Helper to get current authenticated user's ID
   */
  async getCurrentUserId(): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  },

  /**
   * Syncs all items of a given LocalStorage key to its corresponding Supabase table
   */
  async syncLocalStorageToSupabase(localStorageKey: string, tableName: string): Promise<SyncResult> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured. Local data remains offline.' };
    }

    try {
      const localDataRaw = localStorage.getItem(localStorageKey);
      if (!localDataRaw) {
        return { success: true, message: 'No local data to sync.', count: 0 };
      }

      const items = JSON.parse(localDataRaw);
      if (!Array.isArray(items) || items.length === 0) {
        return { success: true, message: 'No local items to sync.', count: 0 };
      }

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, message: 'User must be authenticated to sync data to cloud.' };
      }

      console.log(`[Supabase Sync] Syncing ${items.length} items to table ${tableName} for user ${userId}...`);

      // Prepare items by injecting user_id
      const preparedItems = items.map((item: any) => ({
        ...item,
        user_id: userId,
        // Make sure date or ID fields are mapped properly
        id: item.id || crypto.randomUUID(),
        updated_at: new Date().toISOString()
      }));

      // Perform upsert (Insert or Update if ID exists)
      const { error, count } = await supabase
        .from(tableName)
        .upsert(preparedItems, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Synchronized successfully with cloud DB.',
        count: preparedItems.length
      };
    } catch (err: any) {
      console.error(`[Supabase Sync Error] Table ${tableName}:`, err);
      return { success: false, message: `Cloud sync failed: ${err.message}` };
    }
  },

  /**
   * Fetches data from Supabase table or falls back to LocalStorage if not configured/offline
   */
  async fetchTableData<T>(tableName: string, localStorageKey: string): Promise<T[]> {
    const localDataRaw = localStorage.getItem(localStorageKey);
    const localItems = localDataRaw ? JSON.parse(localDataRaw) : [];

    if (!isSupabaseConfigured()) {
      return localItems;
    }

    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return localItems;

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Sync local storage with latest cloud data
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        return data as T[];
      }

      return localItems;
    } catch (err) {
      console.warn(`[Supabase Fetch Fallback] Using offline data for ${tableName}:`, err);
      return localItems;
    }
  },

  /**
   * Inserts a record locally and synchronously pushes to Supabase if online
   */
  async insertRecord(tableName: string, record: any, localStorageKey: string): Promise<any> {
    const localDataRaw = localStorage.getItem(localStorageKey);
    const localItems = localDataRaw ? JSON.parse(localDataRaw) : [];

    const newRecord = {
      ...record,
      id: record.id || crypto.randomUUID(),
      created_at: record.created_at || new Date().toISOString()
    };

    // Save locally first (Offline-First)
    const updatedItems = [newRecord, ...localItems];
    localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));

    if (isSupabaseConfigured()) {
      try {
        const userId = await this.getCurrentUserId();
        if (userId) {
          const { data, error } = await supabase
            .from(tableName)
            .insert({ ...newRecord, user_id: userId })
            .select()
            .single();

          if (error) throw error;
          console.log(`[Supabase Insert] Successfully synced to cloud table ${tableName}`);
          return data;
        }
      } catch (err) {
        console.warn(`[Supabase Sync Queue] Saved offline. Will retry sync later:`, err);
      }
    }

    return newRecord;
  },

  /**
   * Deletes a record locally and synchronously pushes to Supabase if online
   */
  async deleteRecord(tableName: string, id: string, localStorageKey: string): Promise<boolean> {
    const localDataRaw = localStorage.getItem(localStorageKey);
    if (localDataRaw) {
      const localItems = JSON.parse(localDataRaw);
      const filteredItems = localItems.filter((item: any) => item.id !== id);
      localStorage.setItem(localStorageKey, JSON.stringify(filteredItems));
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;
        console.log(`[Supabase Delete] Successfully deleted from cloud table ${tableName}`);
        return true;
      } catch (err) {
        console.warn(`[Supabase Sync Queue] Delete saved offline:`, err);
      }
    }

    return true;
  }
};
