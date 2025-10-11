// Run calibration migration using Supabase client
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration file
const sql = readFileSync('./supabase/migrations/003_create_calibration_table.sql', 'utf8');

console.log('🚀 Running migration: 003_create_calibration_table.sql');
console.log('========================================\n');

try {
  // Note: This requires the postgres-meta API or direct database access
  // Since we're using the anon key, we'll need to use the REST API
  console.log('⚠️  This script requires database admin access.');
  console.log('Please run the migration manually in the Supabase SQL Editor:');
  console.log('1. Go to https://supabase.com/dashboard/project/djkhfkzzvcnnzdlwpxiq/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy the contents of supabase/migrations/003_create_calibration_table.sql');
  console.log('4. Paste and click "Run"');
  console.log('\nOr use the Supabase CLI: npm run db:migrate');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
