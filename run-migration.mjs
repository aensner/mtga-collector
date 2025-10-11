import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://djkhfkzzvcnnzdlwpxiq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqa2hma3p6dmNubnpkbHdweGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODU0MTYsImV4cCI6MjA3NTM2MTQxNn0.LpkDAWqm29oJDne4dgrUnde2sTCtrJhOgTT3e1Yoc2Y';

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = readFileSync('supabase/migrations/005_create_user_settings.sql', 'utf8');

try {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: migrationSQL
  });

  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
} catch (err) {
  console.error('❌ Error:', err.message);
  // Try alternative method - just log that we'll create the service to handle this
  console.log('�� Will create settings service that handles table creation automatically');
}
