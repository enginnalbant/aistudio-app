import { supabase } from './supabaseClient';
import Database from 'better-sqlite3';

const db = new Database('local.db');

export interface DatabaseService {
  getAccounts(): Promise<any[]>;
  getEvents(): Promise<any[]>;
  // ... add other methods as needed
}

class SQLiteDatabaseService implements DatabaseService {
  async getAccounts() {
    return db.prepare('SELECT * FROM accounts').all();
  }
  async getEvents() {
    return db.prepare('SELECT * FROM events').all();
  }
}

class SupabaseDatabaseService implements DatabaseService {
  async getAccounts() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) throw error;
    return data;
  }
  async getEvents() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    return data;
  }
}

export const getDatabaseService = (): DatabaseService => {
  return process.env.USE_SUPABASE === 'true' ? new SupabaseDatabaseService() : new SQLiteDatabaseService();
};
