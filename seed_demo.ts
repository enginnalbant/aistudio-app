
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Get the first user
  const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
  
  if (userError || !users || users.length === 0) {
    console.error('No users found to associate demo data with');
    return;
  }

  const userId = users[0].id;
  console.log(`Seeding demo data for user: ${userId}`);

  const demoAccounts = [
    { user_id: userId, company_name: 'Global Lojistik A.Ş.', contact_name: 'Ahmet Yılmaz', account_type: 'supplier', email: 'info@globallojistik.com', phone: '0212 555 1010' },
    { user_id: userId, company_name: 'Tekno Market Ltd. Şti.', contact_name: 'Mehmet Demir', account_type: 'customer', email: 'satis@teknomarket.com', phone: '0216 444 2020' },
    { user_id: userId, company_name: 'Yıldız Hammadde Tedarik', contact_name: 'Ayşe Yıldız', account_type: 'supplier', email: 'ayse@yildizhammaddde.com', phone: '0232 333 4040' },
    { user_id: userId, company_name: 'Özdemir İnşaat Grubu', contact_name: 'Can Özdemir', account_type: 'customer', email: 'can@ozdemirinsaat.com', phone: '0312 222 5050' },
    { user_id: userId, company_name: 'Anadolu Makine Sanayi', contact_name: 'Murat Kaya', account_type: 'both', email: 'murat@anadolumakine.com', phone: '0224 111 6060' }
  ];

  const demoStocks = [
    { user_id: userId, sku: 'ALU-2020', name: 'Alüminyum Profil 20x20', quantity: 100, unit: 'metre', cost_price: 45.50, sale_price: 75.00 },
    { user_id: userId, sku: 'VIDA-M6', name: 'Çelik Vida M6x30', quantity: 5000, unit: 'adet', cost_price: 0.15, sale_price: 0.45 },
    { user_id: userId, sku: 'RUL-608', name: 'Rulman 608ZZ', quantity: 200, unit: 'adet', cost_price: 12.00, sale_price: 25.00 },
    { user_id: userId, sku: 'KALIP-01', name: 'Plastik Enjeksiyon Kalıbı', quantity: 5, unit: 'adet', cost_price: 1500.00, sale_price: 2500.00 },
    { user_id: userId, sku: 'YAG-1040', name: 'Endüstriyel Yağ 10W-40', quantity: 50, unit: 'litre', cost_price: 85.00, sale_price: 140.00 },
    { user_id: userId, sku: 'KAB-25', name: 'Bakır Kablo 2.5mm', quantity: 500, unit: 'metre', cost_price: 18.00, sale_price: 32.00 }
  ];

  console.log('Inserting accounts...');
  const { error: accError } = await supabase.from('accounts').insert(demoAccounts);
  if (accError) console.error('Error inserting accounts:', accError);
  else console.log('Accounts inserted successfully');

  console.log('Inserting stocks...');
  const { error: stockError } = await supabase.from('stock').insert(demoStocks);
  if (stockError) console.error('Error inserting stocks:', stockError);
  else console.log('Stocks inserted successfully');
}

seed();
