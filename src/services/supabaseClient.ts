import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Helper to get env vars in both Node.js (server) and Vite (client)
const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Admin client for bypassing RLS when needed (server-side only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Table mapping configuration
export const TABLE_MAP = {
  accounts: 'accounts',
  stock: 'stock',
  stocks: 'stock',
  jobs: 'jobs',
  job_items: 'job_items',
  payments: 'payments',
  notifications: 'notifications',
  calendar_events: 'calendar_events',
  tasks: 'tasks',
  notes: 'notes',
  documents: 'documents',
  templates: 'templates',
  media_items: 'media_items',
  news_subscriptions: 'news_subscriptions',
  daily_plans: 'daily_plans',
  reminders: 'reminders'
};

// Helper for mapping Turkish columns to English keys
export const mapAccountData = (data: any) => {
  if (!data) return data;
  return {
    ...data,
    code: data["Cari Kodu"] || data.code || data.series,
    series: data["Cari Kodu"] || data.code || data.series,
    name: data["Cari İsmi"] || data.company_name || data.name,
    company_name: data["Cari İsmi"] || data.company_name || data.name,
    address_text: data["Adres"] || data.address,
    district: data["İlçe"],
    city: data["İl"],
    postal_code: data["Posta Kodu"],
    tax_office: data["Vergi Dairesi"],
    tax_number: data["Vergi Numarası"] || data.tax_number,
    tc_no: data["TC Kimlik No"],
    payment_days: data["Vade Günü"] || data.payment_term_days,
    phone: data["Telefon"] || data.phone,
    email_address: data["Email"] || data.email,
    discount_rate: data["İskonto Oranı"],
    currency_type: data["Döviz Tipi"]
  };
};

export const mapStockData = (data: any) => {
  if (!data) return data;
  return {
    ...data,
    id: data.id || data["Stok Kodu"],
    name: data["Stok İsmi"] || data.name,
    code: data["Stok Kodu"] || data.code || data.sku,
    balance: data.quantity || data.available_quantity || data.balance || 0
  };
};

// Realtime subscription helper
export const subscribeToTable = (tableName: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
    .subscribe();
};

// Robust error handling wrapper
export const safeSupabaseCall = async <T>(promise: Promise<{ data: T | null, error: any }>) => {
  try {
    const { data, error } = await promise;
    if (error) {
      console.error(`Supabase error: ${error.message}`, error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err: any) {
    console.error(`Unexpected error during Supabase call: ${err.message}`, err);
    return { data: null, error: err };
  }
};
