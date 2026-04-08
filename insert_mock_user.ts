
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertMockUser() {
  const mockUser = {
    id: '00000000-0000-0000-0000-000000000001',
    firebase_uid: 'mock-admin-uid',
    email: 'admin@nexus.com',
    full_name: 'Admin User',
    role: 'admin'
  };

  console.log('Inserting mock user...');
  const { error } = await supabase.from('users').upsert([mockUser]);
  
  if (error) {
    console.error('Error inserting mock user:', error);
  } else {
    console.log('Mock user inserted successfully');
  }
}

insertMockUser();
