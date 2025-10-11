// Run migration directly using Supabase Management API
import { readFileSync } from 'fs';
import fetch from 'node-fetch';

const supabaseUrl = 'https://djkhfkzzvcnnzdlwpxiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqa2hma3p6dmNubnpkbHdweGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODU0MTYsImV4cCI6MjA3NTM2MTQxNn0.LpkDAWqm29oJDne4dgrUnde2sTCtrJhOgTT3e1Yoc2Y';

// Read migration file
const sql = readFileSync('./supabase/migrations/003_create_calibration_table.sql', 'utf8');

console.log('🚀 Executing migration: 003_create_calibration_table.sql');

try {
  // Execute SQL using Supabase REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify({ query: sql })
  });

  const data = await response.text();
  console.log('Response:', response.status, data);

  if (response.ok) {
    console.log('✅ Migration completed successfully!');
  } else {
    console.error('❌ Migration failed:', data);
  }
} catch (error) {
  console.error('❌ Error:', error);
}
