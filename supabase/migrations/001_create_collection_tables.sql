-- Create user_collections table
CREATE TABLE IF NOT EXISTS public.user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create collection_cards table
CREATE TABLE IF NOT EXISTS public.collection_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  scryfall_id TEXT,
  scryfall_name TEXT,
  set_code TEXT,
  rarity TEXT,
  image_url TEXT,
  page_number INTEGER,
  position_x INTEGER,
  position_y INTEGER,
  confidence DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, card_name)
);

-- Create scan_history table (optional - for tracking scan sessions)
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cards_scanned INTEGER NOT NULL DEFAULT 0,
  pages_processed INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_collection_cards_user_id ON collection_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_name ON collection_cards(card_name);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_collections
CREATE POLICY "Users can view their own collection"
  ON user_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection"
  ON user_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collection"
  ON user_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collection"
  ON user_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for collection_cards
CREATE POLICY "Users can view their own cards"
  ON collection_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards"
  ON collection_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
  ON collection_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
  ON collection_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for scan_history
CREATE POLICY "Users can view their own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_user_collections_updated_at
  BEFORE UPDATE ON user_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_cards_updated_at
  BEFORE UPDATE ON collection_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
