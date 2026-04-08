import { supabase } from './supabaseClient';

export class RealtimeService {
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user:${userId}:notifications`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  subscribeToAIMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user:${userId}:ai_messages`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ai_messages',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  subscribeToStockMovements(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user:${userId}:stock_movements`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'stock_movements',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  subscribeToJobStatus(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user:${userId}:jobs`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'jobs', 
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

export const realtimeService = new RealtimeService();
