import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envFile = readFileSync(join(__dirname, '.env'), 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration SQL
const migrationSQL = readFileSync(
  join(__dirname, 'supabase', 'migrations', '20250114000001_create_decks_tables.sql'),
  'utf-8'
);

console.log('📄 Applying deck tables migration...');
console.log('Migration length:', migrationSQL.length, 'characters\n');

// Execute SQL using Supabase client
// Note: This uses the PostgREST API which has limitations for DDL
// We'll try to execute it, but may need manual application via Supabase dashboard
try {
  // Check if tables already exist
  const { data: existingTables, error: checkError } = await supabase
    .from('decks')
    .select('id')
    .limit(1);

  if (!checkError || checkError.code === 'PGRST116') {
    // Table doesn't exist or other error - try to create
    console.log('⚠️  Direct SQL execution via Supabase client is limited.');
    console.log('📋 Please apply the migration manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/djkhfkzzvcnnzdlwpxiq/sql');
    console.log('2. Create a new query');
    console.log('3. Copy the content from: supabase/migrations/20250114000001_create_decks_tables.sql');
    console.log('4. Execute the query\n');
    console.log('Or use: npx supabase db push --include-all');
  } else {
    console.log('✅ Tables already exist! Migration may have been applied.');

    // Test if we can query the tables
    const { data: testDecks, error: testError } = await supabase
      .from('decks')
      .select('id, name')
      .limit(5);

    if (testError) {
      console.error('❌ Error querying decks table:', testError.message);
    } else {
      console.log(`✅ Successfully queried decks table (${testDecks?.length || 0} decks found)`);
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n📋 Manual migration steps:');
  console.log('1. Go to Supabase SQL Editor');
  console.log('2. Run the migration SQL from: supabase/migrations/20250114000001_create_decks_tables.sql');
}
