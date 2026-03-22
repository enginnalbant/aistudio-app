import { supabase } from './supabaseClient';

export class RealtimeService {
  subscribeToNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, callback)
      .subscribe();
  }

  subscribeToAIMessages(callback: (payload: any) => void) {
    return supabase
      .channel('public:ai_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_messages' }, callback)
      .subscribe();
  }

  subscribeToStockMovements(callback: (payload: any) => void) {
    return supabase
      .channel('public:stock_movements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stock_movements' }, callback)
      .subscribe();
  }

  subscribeToJobStatus(callback: (payload: any) => void) {
    return supabase
      .channel('public:jobs')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: 'status=eq.Tamamlandı' }, callback)
      .subscribe();
  }
}

export const realtimeService = new RealtimeService();
