import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://djkhfkzzvcnnzdlwpxiq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqa2hma3p6dmNubnpkbHdweGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODU0MTYsImV4cCI6MjA3NTM2MTQxNn0.LpkDAWqm29oJDne4dgrUnde2sTCtrJhOgTT3e1Yoc2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📋 Checking if user_settings table exists...');

try {
  // Try to query the table
  const { data, error } = await supabase
    .from('user_settings')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === '42P01') {
      console.log('❌ Table does not exist');
      console.log('');
      console.log('⚠️  Please run the migration manually:');
      console.log('');
      console.log('1. Go to: https://supabase.com/dashboard/project/djkhfkzzvcnnzdlwpxiq/sql/new');
      console.log('2. Copy the contents of: supabase/migrations/005_create_user_settings.sql');
      console.log('3. Paste into the SQL Editor and click "Run"');
      console.log('');
    } else {
      console.log('⚠️  Error checking table:', error);
    }
  } else {
    console.log('✅ user_settings table already exists!');
    console.log(`   Found ${data?.length || 0} records`);
  }
} catch (err) {
  console.error('❌ Error:', err.message);
}
