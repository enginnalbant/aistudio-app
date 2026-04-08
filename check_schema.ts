
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking shipment_movements schema...');
  const commonColumns = ['created_at', 'updated_at', 'movement_date', 'timestamp', 'date', 'location', 'status', 'description', 'notes', 'file_paths', 'shipment_id', 'user_id'];
  for (const col of commonColumns) {
    const { error } = await supabase.from('shipment_movements').select(col).limit(1);
    if (!error) {
      console.log(`Column ${col} exists in shipment_movements.`);
    } else {
      console.log(`Column ${col} does NOT exist in shipment_movements: ${error.message}`);
    }
  }

  console.log('\nChecking created_at in other tables...');
  const tables = ['notifications', 'calendar_events', 'tasks', 'notes', 'accounts', 'jobs'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('created_at').limit(1);
    if (!error) {
      console.log(`Column created_at exists in ${table}.`);
    } else {
      console.log(`Column created_at does NOT exist in ${table}: ${error.message}`);
    }
  }
}

checkSchema();
