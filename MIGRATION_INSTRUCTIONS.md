# Database Migration Instructions

## Apply Deck Tables Migration

The deck-first architecture requires new database tables. Follow these steps to apply the migration:

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project SQL Editor:
   ```
   https://supabase.com/dashboard/project/djkhfkzzvcnnzdlwpxiq/sql
   ```

2. Click "New Query"

3. Copy the entire contents of:
   ```
   supabase/migrations/20250114000001_create_decks_tables.sql
   ```

4. Paste into the SQL editor

5. Click "Run" or press `Ctrl+Enter`

6. Verify success - you should see:
   - ✅ Tables created: `decks`, `deck_cards`
   - ✅ Indexes created
   - ✅ RLS policies enabled
   - ✅ Triggers created

### Option 2: Command Line (If Supabase CLI is configured)

```bash
# This will push all migrations
npm run db:migrate

# Or specifically push with confirmation
npx supabase db push --linked --include-all
```

**Note**: This may fail if previous migrations have conflicts. Use Option 1 instead.

### Verification

After applying the migration, verify it worked:

```bash
node apply-deck-migration.mjs
```

You should see:
```
✅ Tables already exist! Migration may have been applied.
✅ Successfully queried decks table (0 decks found)
```

### What the Migration Does

- **Creates `decks` table**: Stores deck metadata (name, format, archetype, total cards, validity)
- **Creates `deck_cards` table**: Stores individual cards in each deck with quantities
- **Adds RLS policies**: Row-level security ensures users only see their own decks
- **Creates indexes**: Performance optimization for queries on user_id, format, scryfall_id
- **Adds auto-triggers**: Automatically updates deck stats when cards are added/removed

### Troubleshooting

**Error: "Table already exists"**
- The migration was already applied. No action needed.

**Error: "Could not find table in schema cache"**
- PostgREST API cache needs refresh
- Wait 1-2 minutes and try again
- Or restart Supabase services from dashboard

**Error: "Permission denied"**
- Ensure you're logged in to the correct Supabase project
- Check that your API key has sufficient permissions

### Next Steps

Once the migration is applied:
1. ✅ Deck database is ready
2. ✅ Can create/edit/delete decks
3. ✅ My Decks dashboard will load decks from database
4. ✅ DeckBuilder will persist decks to database

No data loss - existing localStorage decks remain accessible until migrated.
