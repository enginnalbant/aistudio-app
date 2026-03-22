-- NEXUS OS - ENTERPRISE ERP SUPABASE SCHEMA
-- VERSION: 3.0.0
-- DATE: 2026-03-17
-- DESCRIPTION: Production-ready, enterprise-level ERP schema with advanced AI, Workflows, and Performance optimizations.

-- ==========================================
-- 0. EXTENSIONS & CONFIGURATION
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For monitoring

-- ==========================================
-- 1. CUSTOM TYPES & ENUMS
-- ==========================================
DO $$ BEGIN
    -- Existing Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE account_type AS ENUM ('Tedarikçi', 'Müşteri', 'Personel', 'Ortak', 'Diğer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('Açık', 'Kısmi', 'Tamamlandı', 'İptal', 'Beklemede');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_role') THEN
        CREATE TYPE ai_role AS ENUM ('user', 'assistant', 'system');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
        CREATE TYPE movement_type AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT');
    END IF;

    -- New Enterprise Types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_status') THEN
        CREATE TYPE workflow_status AS ENUM ('Draft', 'Active', 'Paused', 'Completed', 'Archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_status') THEN
        CREATE TYPE action_status AS ENUM ('Pending', 'Executing', 'Success', 'Failed', 'Cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('Pending', 'Cleared', 'Reconciled', 'Voided');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. HELPER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 3. CORE MODULES (REFINED)
-- ==========================================

-- 3.1 ACCOUNTS
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    name TEXT NOT NULL,
    type account_type DEFAULT 'Müşteri',
    phone TEXT,
    email TEXT,
    website TEXT,
    tax_office TEXT,
    tax_number TEXT,
    address TEXT,
    authorized_person TEXT,
    payment_term_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Aktif',
    balance DECIMAL(15,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('turkish', name || ' ' || coalesce(tax_number, '') || ' ' || coalesce(authorized_person, ''))) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 STOCKS
CREATE TABLE IF NOT EXISTS stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT NOT NULL,
    barcode TEXT,
    purchase_price DECIMAL(15,2) DEFAULT 0,
    sale_price DECIMAL(15,2) DEFAULT 0,
    critical_level DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'Aktif',
    tags TEXT[],
    attributes JSONB DEFAULT '{}',
    fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('turkish', name || ' ' || code || ' ' || coalesce(barcode, ''))) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 JOBS (With Workflow Integration)
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    account_id UUID REFERENCES accounts(id),
    receipt_no TEXT NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL,
    status job_status DEFAULT 'Açık',
    priority priority_level DEFAULT 'medium',
    description TEXT,
    workflow_instance_id UUID,
    total_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    account_id UUID REFERENCES accounts(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL, -- 'INCOMING' or 'OUTGOING'
    description TEXT,
    category TEXT,
    status transaction_status DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. WORKFLOW STATE MACHINE
-- ==========================================

CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    name TEXT NOT NULL,
    module TEXT NOT NULL, -- 'Jobs', 'Stocks', 'Finance'
    config JSONB NOT NULL, -- States, Transitions, Rules
    status workflow_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    definition_id UUID REFERENCES workflow_definitions(id),
    current_state TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. ADVANCED AI ASSISTANT (V3)
-- ==========================================

-- 5.1 AI Models & Performance
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    provider TEXT NOT NULL,
    capabilities TEXT[],
    avg_latency_ms INTEGER,
    accuracy_score FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 AI Reasoning & Chains
CREATE TABLE IF NOT EXISTS ai_reasoning_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID, -- Link to ai_messages
    chain JSONB NOT NULL, -- Step-by-step logic
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.3 AI Embeddings (Semantic Search)
-- Note: Vector extension might be needed, using JSONB fallback if not available
CREATE TABLE IF NOT EXISTS ai_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    content_type TEXT NOT NULL, -- 'Stock', 'Account', 'Note'
    content_id UUID NOT NULL,
    embedding JSONB NOT NULL, -- Storing as JSONB for maximum compatibility
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.4 AI Anomaly Detection
CREATE TABLE IF NOT EXISTS ai_anomaly_detection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    module TEXT NOT NULL,
    target_id UUID,
    severity priority_level DEFAULT 'medium',
    description TEXT NOT NULL,
    evidence JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.5 AI Prediction History
CREATE TABLE IF NOT EXISTS ai_prediction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    type TEXT NOT NULL, -- 'StockDemand', 'CashFlow', 'Churn'
    prediction JSONB NOT NULL,
    actual_outcome JSONB,
    accuracy_delta FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.6 AI Suggested Actions
CREATE TABLE IF NOT EXISTS ai_suggested_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    action_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status action_status DEFAULT 'Pending',
    priority priority_level DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. PERFORMANCE & ANALYTICS (VIEWS)
-- ==========================================

-- 6.1 Materialized View for Stock Summary (Performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_stock_summary AS
SELECT 
    category,
    count(*) as item_count,
    sum(current_balance) as total_qty,
    sum(current_balance * purchase_price) as total_valuation
FROM stocks
GROUP BY category;

-- 6.2 Financial Performance View
CREATE OR REPLACE VIEW v_financial_performance AS
SELECT 
    date_trunc('month', date) as month,
    type,
    sum(amount) as total_amount,
    count(*) as transaction_count
FROM payments
GROUP BY 1, 2;

-- ==========================================
-- 7. STORAGE BUCKETS (SQL DEFINITIONS)
-- ==========================================
-- Note: These are usually created via Supabase API, but we define them here for documentation.
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-training', 'ai-training', false);
*/

-- ==========================================
-- 8. ADVANCED INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_accounts_fts ON accounts USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_stocks_fts ON stocks USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements (date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_metadata ON ai_messages USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_jobs_workflow ON jobs (workflow_instance_id);

-- ==========================================
-- 9. TRIGGERS & AUTOMATION
-- ==========================================

-- 9.1 Auto-log AI Actions
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW ' || quote_ident(view_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_log_ai_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_action_history (user_id, action, target_table, target_id, details)
    VALUES (NEW.user_id, 'SUGGESTED_ACTION_' || NEW.status, 'ai_suggested_actions', NEW.id, NEW.payload);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_log_ai_action
AFTER UPDATE OF status ON ai_suggested_actions
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE PROCEDURE fn_log_ai_action();

-- ==========================================
-- 10. RLS POLICIES (ENTERPRISE)
-- ==========================================
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own workflow definitions" ON workflow_definitions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read active models" ON ai_models FOR SELECT USING (is_active = true);

ALTER TABLE ai_reasoning_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own reasoning chains" ON ai_reasoning_chains FOR ALL USING (
    EXISTS (SELECT 1 FROM ai_messages m JOIN ai_conversations c ON m.conversation_id = c.id WHERE m.id = ai_reasoning_chains.message_id AND c.user_id = auth.uid())
);

ALTER TABLE ai_anomaly_detection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own anomalies" ON ai_anomaly_detection FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ai_prediction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own predictions" ON ai_prediction_history FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ai_suggested_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own suggested actions" ON ai_suggested_actions FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 11. SEED DATA (EXAMPLES)
-- ==========================================
INSERT INTO ai_models (name, version, provider, capabilities)
VALUES 
('Gemini 3.1 Pro', '3.1-pro-preview', 'Google', ARRAY['reasoning', 'vision', 'coding', 'analysis']),
('Gemini 3.1 Flash', '3.1-flash-preview', 'Google', ARRAY['speed', 'chat', 'simple-tasks'])
ON CONFLICT DO NOTHING;

INSERT INTO workflow_definitions (name, module, config)
VALUES 
('Sipariş Süreci', 'Jobs', '{"states": ["Teklif", "Onay", "Üretim", "Sevkiyat", "Tamamlandı"], "transitions": {"Teklif": ["Onay", "İptal"], "Onay": ["Üretim", "İptal"]}}')
ON CONFLICT DO NOTHING;
