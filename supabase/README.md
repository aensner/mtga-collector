# Database Setup Instructions

This directory contains SQL migration files for setting up the Supabase database schema.

## Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Supabase project credentials added to `.env` file

## Setup Steps

### 1. Navigate to your Supabase project

Go to https://supabase.com and open your project.

### 2. Run the migration

1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the contents of `migrations/001_create_collection_tables.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the migration

### 3. Run additional migrations

After running the first migration, also run these in order:

**Migration 003 - Calibration Settings** (`003_create_calibration_table.sql`):
- Copy contents of `migrations/003_create_calibration_table.sql`
- Paste into SQL Editor and run
- This creates the `user_calibration_settings` table for per-user calibration persistence

### 4. Verify the tables

Go to **Table Editor** in the left sidebar and verify that the following tables were created:

- `user_collections` - Stores user collection metadata
- `collection_cards` - Stores individual cards with quantities
- `scan_history` - Tracks scan sessions (optional analytics)
- `user_calibration_settings` - Stores per-user calibration settings

## Database Schema

### `user_collections`
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users (unique per user)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `collection_cards`
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `card_name` (text) - Card name (unique constraint with user_id)
- `quantity` (integer) - Number of copies owned
- `scryfall_id` (text) - Scryfall card ID
- `scryfall_name` (text) - Canonical Scryfall name
- `set_code` (text) - Set abbreviation
- `rarity` (text) - Card rarity
- `image_url` (text) - Card image URL
- `page_number` (integer) - Which screenshot page
- `position_x` (integer) - Grid X position
- `position_y` (integer) - Grid Y position
- `confidence` (decimal) - OCR confidence score
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `scan_history`
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users
- `cards_scanned` (integer) - Number of cards in scan
- `pages_processed` (integer) - Number of screenshots processed
- `created_at` (timestamp)

### `user_calibration_settings`
- `id` (UUID) - Primary key
- `user_id` (UUID) - References auth.users (unique per user)
- `start_x`, `start_y` (decimal) - Grid starting position
- `grid_width`, `grid_height` (decimal) - Grid dimensions
- `card_gap_x`, `card_gap_y` (decimal) - Card spacing
- `ocr_left`, `ocr_top`, `ocr_width`, `ocr_height` (decimal) - OCR region parameters
- `quantity_offset_x`, `quantity_offset_y`, `quantity_width`, `quantity_height` (decimal) - Quantity detection region
- `brightness_threshold`, `saturation_threshold` (integer) - Quantity detection thresholds
- `fill_ratio_threshold` (decimal) - Quantity detection fill ratio
- `created_at`, `updated_at` (timestamp)

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only view/edit/delete their own data
- Authentication is required for all operations

## Auto-updating Timestamps

The `updated_at` columns in `user_collections`, `collection_cards`, and `user_calibration_settings` are automatically updated via database triggers whenever a row is modified.

## Per-User Calibration

Each user's calibration settings (grid position, OCR regions, quantity detection) are stored in their own row in `user_calibration_settings`. When a user adjusts calibration sliders:
- Settings are automatically saved to the database after 1 second
- Settings are loaded automatically when the app starts
- Different users can have different calibration settings
- If no settings exist, default calibrated values are used

## Testing the Setup

After running the migration:

1. Start the app: `npm run dev`
2. Sign in with your Supabase account
3. Upload and process a screenshot
4. Cards should automatically save to the database
5. Refresh the page - your collection should persist
6. Click "Reset Collection" to test deletion

## Troubleshooting

**Error: 404 "Not Found" on API calls**
- The tables exist but aren't exposed via the REST API
- **FIX**: Drop the existing tables and re-run the migration:
  1. Go to Supabase → SQL Editor → New Query
  2. Run this first to drop old tables:
     ```sql
     DROP TABLE IF EXISTS collection_cards CASCADE;
     DROP TABLE IF EXISTS user_collections CASCADE;
     DROP TABLE IF EXISTS scan_history CASCADE;
     ```
  3. Then copy and run the entire updated migration from `001_create_collection_tables.sql`
  4. The tables will now be in the `public` schema and accessible via API

**Error: "relation does not exist"**
- Make sure the migration was run successfully in the SQL Editor

**Error: "permission denied"**
- Check that RLS policies were created correctly
- Verify you're signed in with a valid user account

**Cards not saving**
- Check browser console for errors
- Verify `.env` has correct Supabase credentials
- Check Supabase Auth is enabled and user is authenticated
