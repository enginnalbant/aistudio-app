import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Dynamic import for better-sqlite3 to prevent bundling in browser
let DatabaseClass: any;
try {
  const mod = await import('better-sqlite3');
  DatabaseClass = mod.default || mod;
} catch (e) {
  // Handle case where better-sqlite3 is not available (e.g., browser)
}

// const db = DatabaseClass ? new DatabaseClass('local.db') : null;
let db: any = null;
const getDb = () => {
  if (!db && DatabaseClass) {
    db = new DatabaseClass('local.db');
  }
  return db;
};

export interface DatabaseService {
  // Core Modules
  getAccounts(): Promise<any[]>;
  getStocks(): Promise<any[]>;
  getJobs(): Promise<any[]>;
  getInvoices(): Promise<any[]>;
  getPayments(): Promise<any[]>;
  getShipments(): Promise<any[]>;
  getBudgets(): Promise<any[]>;
  getPlanner(date?: string): Promise<any[]>;
  getNotes(): Promise<any[]>;
  getEvents(): Promise<any[]>;
  getNotifications(): Promise<any[]>;
  getMedia(): Promise<any[]>;
  getSettings(): Promise<any>;

  // AI Assistant Modules
  getAIProfile(): Promise<any>;
  getAIConversations(): Promise<any[]>;
  getAIMessages(conversationId: string): Promise<any[]>;
  getAIMemories(category?: string): Promise<any[]>;
  getAIInsights(): Promise<any[]>;
  getAITasks(): Promise<any[]>;
  getAILearningData(): Promise<any[]>;
  getAISystemSnapshots(): Promise<any[]>;
  getAIActionHistory(): Promise<any[]>;

  // Generic Operations
  from(table: string): {
    select: (columns?: string) => Promise<any[]>;
    insert: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<boolean>;
    eq: (column: string, value: any) => any;
  };
  
  // Specific Actions
  createAccount(data: any): Promise<string>;
  insert(table: string, data: any): Promise<any>;
  update(table: string, id: string, data: any): Promise<any>;
  delete(table: string, id: string): Promise<boolean>;
  query(table: string, filter?: any): Promise<any[]>;
}

class SQLiteDatabaseService implements DatabaseService {
  // SQLite implementation (minimal for demo, mostly returns empty for new tables)
  async getAccounts() { return getDb().prepare('SELECT * FROM accounts').all(); }
  async getStocks() { return getDb().prepare('SELECT * FROM stocks').all(); }
  async getJobs() { return getDb().prepare('SELECT * FROM jobs').all(); }
  async getInvoices() { return []; }
  async getPayments() { return getDb().prepare('SELECT * FROM payments').all(); }
  async getShipments() { return getDb().prepare('SELECT * FROM shipments').all(); }
  async getBudgets() { return []; }
  async getPlanner(date?: string) { return []; }
  async getNotes() { return getDb().prepare('SELECT * FROM notes').all(); }
  async getEvents() { return getDb().prepare('SELECT * FROM events').all(); }
  async getNotifications() { return getDb().prepare('SELECT * FROM notifications').all(); }
  async getMedia() { return []; }
  async getSettings() { return getDb().prepare('SELECT * FROM settings').all(); }

  async getAIProfile() { return getDb().prepare('SELECT * FROM ai_profiles LIMIT 1').get() || null; }
  async getAIConversations() { return getDb().prepare('SELECT * FROM ai_conversations ORDER BY updated_at DESC').all(); }
  async getAIMessages(conversationId: string) { return getDb().prepare('SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId); }
  async getAIMemories(category?: string) { 
    if (category) return getDb().prepare('SELECT * FROM ai_memories WHERE category = ? ORDER BY last_accessed DESC').all(category);
    return getDb().prepare('SELECT * FROM ai_memories ORDER BY last_accessed DESC').all();
  }
  async getAIInsights() { return getDb().prepare('SELECT * FROM ai_insights ORDER BY created_at DESC').all(); }
  async getAITasks() { return getDb().prepare('SELECT * FROM ai_tasks ORDER BY due_at ASC').all(); }
  async getAILearningData() { return getDb().prepare('SELECT * FROM ai_learning_data').all(); }
  async getAISystemSnapshots() { return getDb().prepare('SELECT * FROM ai_system_snapshots ORDER BY created_at DESC').all(); }
  async getAIActionHistory() { return getDb().prepare('SELECT * FROM ai_action_history ORDER BY created_at DESC').all(); }

  from(table: string) {
    return {
      select: async () => getDb().prepare(`SELECT * FROM ${table}`).all(),
      insert: async (data: any) => this.insert(table, data),
      update: async (id: string, data: any) => this.update(table, id, data),
      delete: async (id: string) => this.delete(table, id),
      eq: () => ({}) // Minimal mock
    };
  }

  async insert(table: string, data: any) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    return getDb().prepare(sql).run(...values);
  }

  async update(table: string, id: string, data: any) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    return getDb().prepare(sql).run(...values, id);
  }

  async delete(table: string, id: string) {
    getDb().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return true;
  }

  async query(table: string, filter?: any) {
    let sql = `SELECT * FROM ${table}`;
    const values: any[] = [];
    if (filter) {
      sql += ` WHERE ` + Object.keys(filter).map(k => `${k} = ?`).join(' AND ');
      values.push(...Object.values(filter));
    }
    return getDb().prepare(sql).all(...values);
  }

  async createAccount(data: any) {
    const id = data.id || uuidv4();
    await this.insert('accounts', { ...data, id });
    return id;
  }
}

class SupabaseDatabaseService implements DatabaseService {
  async getAccounts() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('accounts').select('*').order('name');
    if (error) throw error;
    return data;
  }
  async getStocks() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('stocks').select('*, stock_categories(name)').order('name');
    if (error) throw error;
    return data;
  }
  async getJobs() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('jobs').select('*, accounts(name)').order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getInvoices() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('invoices').select('*, accounts(name)').order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getPayments() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('payments').select('*, accounts(name)').order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getShipments() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getBudgets() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('budgets').select('*');
    if (error) throw error;
    return data;
  }
  async getPlanner(date?: string) {
    if (!supabase) return [];
    let query = supabase.from('daily_planners').select('*');
    if (date) query = query.eq('date', date);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
  async getNotes() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getEvents() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('events').select('*').order('start_time');
    if (error) throw error;
    return data;
  }
  async getNotifications() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getMedia() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('media_items').select('*');
    if (error) throw error;
    return data;
  }
  async getSettings() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('system_settings').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // AI Assistant
  async getAIProfile() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('ai_profiles').select('*').single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
  async getAIConversations() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_conversations').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getAIMessages(conversationId: string) {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }
  async getAIMemories(category?: string) {
    if (!supabase) return [];
    let query = supabase.from('ai_memories').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query.order('last_accessed', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getAIInsights() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_insights').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getAITasks() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_tasks').select('*').order('due_at');
    if (error) throw error;
    return data;
  }
  async getAILearningData() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_learning_data').select('*');
    if (error) throw error;
    return data;
  }
  async getAISystemSnapshots() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_system_snapshots').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  async getAIActionHistory() {
    if (!supabase) return [];
    const { data, error } = await supabase.from('ai_action_history').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  from(table: string) {
    if (!supabase) throw new Error('Supabase not initialized');
    return {
      select: async (columns = '*') => {
        const { data, error } = await supabase.from(table).select(columns);
        if (error) throw error;
        return data;
      },
      insert: async (data: any) => {
        const { data: result, error } = await supabase.from(table).insert(data).select().single();
        if (error) throw error;
        return result;
      },
      update: async (id: string, data: any) => {
        const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
        if (error) throw error;
        return result;
      },
      delete: async (id: string) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return true;
      },
      eq: (column: string, value: any) => supabase.from(table).select('*').eq(column, value)
    };
  }

  async insert(table: string, data: any) {
    if (!supabase) return null;
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) throw error;
    return result;
  }

  async update(table: string, id: string, data: any) {
    if (!supabase) return null;
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
  }

  async delete(table: string, id: string) {
    if (!supabase) return false;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async query(table: string, filter?: any) {
    if (!supabase) return [];
    let query = supabase.from(table).select('*');
    if (filter) {
      Object.keys(filter).forEach(key => {
        query = query.eq(key, filter[key]);
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createAccount(data: any) {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data: result, error } = await supabase.from('accounts').insert(data).select().single();
    if (error) throw error;
    return result.id;
  }
}

export const getDatabaseService = (): DatabaseService => {
  return process.env.USE_SUPABASE === 'true' ? new SupabaseDatabaseService() : new SQLiteDatabaseService();
};
