import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface SystemLog {
  id?: string;
  level: LogLevel;
  module: string;
  message: string;
  metadata?: any;
  user_id?: string;
  created_at?: string;
}

export class LogService {
  async log(level: LogLevel, module: string, message: string, metadata: any = {}) {
    if (!supabase) {
      console.log(`[${level.toUpperCase()}] [${module}] ${message}`, metadata);
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await (supabase.from('system_logs') as any)
        .insert({
          id: uuidv4(),
          level,
          module,
          message,
          metadata,
          user_id: user?.id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to write log to Supabase:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in log service:', err);
      return null;
    }
  }

  async info(module: string, message: string, metadata?: any) {
    return this.log('info', module, message, metadata);
  }

  async warning(module: string, message: string, metadata?: any) {
    return this.log('warning', module, message, metadata);
  }

  async error(module: string, message: string, metadata?: any) {
    return this.log('error', module, message, metadata);
  }

  async critical(module: string, message: string, metadata?: any) {
    return this.log('critical', module, message, metadata);
  }

  async getLogs(userId: string, limit = 100) {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('system_logs')
      .select('*, profiles(full_name, email)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }

    return data;
  }
}

export const logService = new LogService();
