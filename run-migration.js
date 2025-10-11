// Run Supabase migration directly using the REST API
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration file
const sql = readFileSync('./supabase/migrations/003_create_calibration_table.sql', 'utf8');

console.log('Running migration: 003_create_calibration_table.sql');
console.log('----------------------------------------');

// Execute SQL via Supabase client
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

console.log('✅ Migration completed successfully!');
console.log('Data:', data);
