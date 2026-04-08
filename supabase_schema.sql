-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE job_type AS ENUM ('production', 'service', 'custom');
CREATE TYPE account_type AS ENUM ('customer', 'supplier', 'both');
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'bank_transfer', 'check');
CREATE TYPE movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'COUNT');
CREATE TYPE shipment_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'archived');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 1. USERS (Supabase Auth ile senkronize)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- 2. USER PROFILES
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3-6. JOBS & PRODUCTION
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_id UUID REFERENCES accounts(id),
  receipt_no TEXT,
  date TIMESTAMP DEFAULT NOW(),
  title TEXT,
  description TEXT,
  type TEXT DEFAULT 'production',
  status TEXT DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE job_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stock(id),
  qty DECIMAL NOT NULL,
  price DECIMAL,
  received_qty DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  stock_id UUID,
  quantity_needed DECIMAL,
  quantity_used DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7-10. INVENTORY & STOCKS  
CREATE TABLE stock_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES stock_categories(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  sku TEXT UNIQUE,
  barcode TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES stock_categories(id),
  unit TEXT,
  quantity DECIMAL DEFAULT 0,
  min_quantity DECIMAL DEFAULT 0,
  warehouse_location TEXT,
  supplier_id UUID,
  purchase_price DECIMAL DEFAULT 0,
  sale_price DECIMAL DEFAULT 0,
  critical_level DECIMAL DEFAULT 10,
  category TEXT,
  code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_id UUID REFERENCES stock(id),
  user_id UUID REFERENCES users(id),
  type movement_type,
  qty DECIMAL NOT NULL,
  from_location TEXT,
  to_location TEXT,
  reference_type TEXT,
  reference_id UUID,
  job_id UUID,
  job_item_id UUID,
  notes TEXT,
  date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stock_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_id UUID REFERENCES stock(id),
  price_type TEXT,
  price DECIMAL,
  effective_date TIMESTAMP DEFAULT NOW()
);

-- 11-14. ACCOUNTS & PAYMENTS
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_type account_type,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  payment_terms TEXT,
  balance DECIMAL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_id UUID REFERENCES accounts(id),
  payment_type TEXT,
  payment_method payment_method,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'TRY',
  reference_number TEXT,
  invoice_id UUID,
  payment_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_id UUID REFERENCES accounts(id),
  invoice_number TEXT UNIQUE,
  invoice_type TEXT,
  total_amount DECIMAL,
  paid_amount DECIMAL DEFAULT 0,
  status TEXT,
  due_date TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  stock_id UUID,
  description TEXT,
  quantity DECIMAL,
  unit_price DECIMAL,
  total_price DECIMAL
);

-- 15-18. PURCHASING
CREATE TABLE purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  request_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  priority TEXT,
  required_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  supplier_id UUID REFERENCES accounts(id),
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  total_amount DECIMAL,
  expected_delivery TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  request_id UUID REFERENCES purchase_requests(id),
  supplier_id UUID REFERENCES accounts(id),
  quote_number TEXT,
  total_amount DECIMAL,
  valid_until TIMESTAMP,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_name TEXT,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 19-22. SHIPMENTS
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tracking_number TEXT UNIQUE,
  recipient_name TEXT,
  delivery_address TEXT,
  invoice_address TEXT,
  carrier_name TEXT,
  vehicle_info TEXT,
  logistics_cost_amount DECIMAL,
  logistics_cost_currency TEXT,
  departure_date TIMESTAMP,
  delivery_date TIMESTAMP,
  scheduled_date TIMESTAMP,
  priority TEXT,
  status TEXT DEFAULT 'pending',
  transport_method TEXT,
  shipment_type TEXT,
  extra_details TEXT,
  pallets JSONB DEFAULT '[]',
  products JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shipment_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  address_type TEXT,
  full_address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shipment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  stock_id UUID REFERENCES stock(id),
  quantity DECIMAL,
  weight DECIMAL,
  dimensions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shipment_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  location TEXT,
  status TEXT,
  movement_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  file_paths TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 23-27. FINANCE & BUDGET
CREATE TABLE budget_incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  category TEXT,
  amount DECIMAL NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  category TEXT,
  amount DECIMAL NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  service_name TEXT NOT NULL,
  cost DECIMAL NOT NULL,
  billing_cycle TEXT,
  next_billing_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  asset_name TEXT NOT NULL,
  asset_type TEXT,
  amount_invested DECIMAL NOT NULL,
  current_value DECIMAL,
  purchase_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  item_name TEXT NOT NULL,
  estimated_cost DECIMAL,
  priority TEXT,
  target_date TIMESTAMP,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 28-32. PRODUCTIVITY
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'partial', 'completed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  sort_order INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  target_date DATE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  trigger_time TIMESTAMP NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 33-36. MEDIA & DOCS
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key, locale)
);

-- 37-39. COMMS & AI
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 40-43. SYSTEM & LOGS
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT,
  parameters JSONB,
  result_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, key)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
-- Ensure missing columns exist
ALTER TABLE shipment_movements ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE shipment_movements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE shipment_movements ADD COLUMN IF NOT EXISTS movement_date TIMESTAMP DEFAULT NOW();
ALTER TABLE shipment_movements ADD COLUMN IF NOT EXISTS file_paths TEXT[] DEFAULT '{}';
ALTER TABLE shipment_movements ENABLE ROW LEVEL SECURITY;

ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS qty DECIMAL;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS type movement_type;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS job_item_id UUID;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS date TIMESTAMP DEFAULT NOW();

ALTER TABLE budget_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Allow users to read/write their own data)
-- Users
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id OR (auth.jwt()->>'sub') = firebase_uid);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id OR (auth.jwt()->>'sub') = firebase_uid);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id OR (auth.jwt()->>'sub') = firebase_uid);

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id OR (auth.jwt()->>'sub') = (SELECT firebase_uid FROM users WHERE id = user_id));
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt()->>'sub') = (SELECT firebase_uid FROM users WHERE id = user_id));
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id OR (auth.jwt()->>'sub') = (SELECT firebase_uid FROM users WHERE id = user_id));

-- For all other tables with user_id, create generic policies
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'user_id' AND table_schema = 'public' AND table_name != 'users' AND table_name != 'user_profiles'
    LOOP
        EXECUTE format('CREATE POLICY "Users can view own %I" ON %I FOR SELECT USING (auth.uid() = user_id OR (auth.jwt()->>''sub'') = (SELECT firebase_uid FROM users WHERE id = user_id))', t_name, t_name);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id OR (auth.jwt()->>''sub'') = (SELECT firebase_uid FROM users WHERE id = user_id))', t_name, t_name);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON %I FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt()->>''sub'') = (SELECT firebase_uid FROM users WHERE id = user_id))', t_name, t_name);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON %I FOR DELETE USING (auth.uid() = user_id OR (auth.jwt()->>''sub'') = (SELECT firebase_uid FROM users WHERE id = user_id))', t_name, t_name);
    END LOOP;
END $$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t_name, t_name);
    END LOOP;
END $$;

-- Indexes
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_stocks_user_id ON stocks(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Daily Planner Table
CREATE TABLE IF NOT EXISTS public.daily_planner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    item_key TEXT NOT NULL,
    time_range TEXT DEFAULT '',
    morning_status INTEGER DEFAULT 0,
    evening_status INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    detail TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    category TEXT DEFAULT '',
    estimated_time TEXT DEFAULT '',
    actual_time TEXT DEFAULT '',
    assigned_to TEXT DEFAULT '',
    recurrence TEXT DEFAULT '',
    color_tag TEXT DEFAULT '',
    sub_tasks TEXT DEFAULT '',
    comments TEXT DEFAULT '',
    url TEXT DEFAULT '',
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Summaries Table
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    summary TEXT DEFAULT '',
    focus_score INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    productivity_score INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- RLS for Daily Planner
ALTER TABLE public.daily_planner ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own planner items" ON public.daily_planner
    FOR ALL USING (auth.uid() = user_id);

-- RLS for Daily Summaries
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own summaries" ON public.daily_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
-- Note: update_updated_at_column() exists in schema
CREATE TRIGGER update_daily_planner_updated_at BEFORE UPDATE ON public.daily_planner
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON public.daily_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_daily_planner_user_id_date ON daily_planner(user_id, date);
CREATE INDEX idx_daily_summaries_user_id_date ON daily_summaries(user_id, date);
