-- Force PostgREST to reload the schema cache
-- Run this after creating tables to make them accessible via the REST API

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also reload via Supabase Dashboard:
-- Settings → API → "Reload Schema"
