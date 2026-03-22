-- Supabase Initial Setup & Missing Structures
-- This script creates the necessary tables, storage buckets, and security rules for Nexus OS.

-- ==========================================
-- 1. USER PROFILES & AUTHENTICATION
-- ==========================================

-- Create a table for public user profiles linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signups and create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 2. STORAGE BUCKETS
-- ==========================================

-- Create a bucket for general media and attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nexus-media', 'nexus-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create a bucket for secure documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nexus-documents', 'nexus-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage
CREATE POLICY "Public Access to Media" ON storage.objects
  FOR SELECT USING (bucket_id = 'nexus-media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nexus-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'nexus-media' AND auth.uid() = owner);

CREATE POLICY "Authenticated users can delete own media" ON storage.objects
  FOR DELETE USING (bucket_id = 'nexus-media' AND auth.uid() = owner);

-- Secure documents policies
CREATE POLICY "Authenticated users can access documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'nexus-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'nexus-documents' AND auth.role() = 'authenticated');


-- ==========================================
-- 3. SYSTEM LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert logs, but only admins can view all logs
CREATE POLICY "Authenticated users can insert logs" ON public.system_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all logs" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ==========================================
-- 4. WORKFLOWS (İş Akışları)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.workflow_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{"states": [], "transitions": {}}'::jsonb,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed', 'Archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.workflow_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  definition_id UUID REFERENCES public.workflow_definitions(id) ON DELETE CASCADE NOT NULL,
  current_state TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  started_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workflow definitions" ON public.workflow_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage workflow definitions" ON public.workflow_definitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can view and manage workflow instances" ON public.workflow_instances
  FOR ALL USING (auth.role() = 'authenticated');


-- ==========================================
-- 5. AI & ANOMALY TABLES (If missing)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ai_anomaly_detection (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  details JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.ai_prediction_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target TEXT NOT NULL,
  prediction JSONB NOT NULL,
  actual JSONB,
  accuracy NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ai_anomaly_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prediction_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view anomalies" ON public.ai_anomaly_detection
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view predictions" ON public.ai_prediction_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert some default workflow definitions if they don't exist
INSERT INTO public.workflow_definitions (name, module, config, status)
VALUES (
  'Standart Satın Alma Onay Süreci',
  'purchasing',
  '{"states": ["Talep Edildi", "Yönetici Onayında", "Teklif Bekleniyor", "Sipariş Verildi", "Tamamlandı", "Reddedildi"], "transitions": {"Talep Edildi": ["Yönetici Onayında", "Reddedildi"], "Yönetici Onayında": ["Teklif Bekleniyor", "Reddedildi"], "Teklif Bekleniyor": ["Sipariş Verildi", "Reddedildi"], "Sipariş Verildi": ["Tamamlandı"]}}',
  'Active'
) ON CONFLICT DO NOTHING;
