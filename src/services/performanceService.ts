import { supabase } from './supabaseClient';

export class PerformanceService {
  /**
   * Refreshes the materialized view for stock summary.
   * This should be called periodically or after significant stock updates.
   */
  async refreshStockSummary() {
    const { error } = await (supabase as any).rpc('refresh_materialized_view', { view_name: 'mv_stock_summary' });
    if (error) {
      // If RPC doesn't exist, we might need to use a raw query if allowed, 
      // but usually we'd define a Postgres function for this.
      console.error('Error refreshing materialized view:', error);
      
      // Fallback: Try a direct SQL execution if your Supabase client has permissions
      // (Note: This usually requires service_role key or a specific RPC)
    }
  }

  async getSlowQueries() {
    // Requires pg_stat_statements extension to be active and configured
    const { data, error } = await (supabase as any)
      .from('pg_stat_statements')
      .select('*')
      .order('total_exec_time', { ascending: false })
      .limit(10);
    
    if (error) {
      console.warn('pg_stat_statements not accessible or not installed.');
      return [];
    }
    return data;
  }

  async getStockSummary(userId: string) {
    const { data, error } = await (supabase as any)
      .from('mv_stock_summary')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
}

export const performanceService = new PerformanceService();
