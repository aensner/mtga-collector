-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('standard', 'historic', 'explorer', 'alchemy', 'timeless', 'brawl', 'casual')),
  archetype TEXT, -- e.g., 'Aggro', 'Control', 'Midrange', 'Combo'
  description TEXT,
  total_cards INTEGER NOT NULL DEFAULT 0,
  is_valid BOOLEAN DEFAULT FALSE, -- Whether deck meets 60-card minimum
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deck_cards junction table (many-to-many: decks <-> cards)
CREATE TABLE IF NOT EXISTS deck_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  scryfall_id TEXT NOT NULL, -- Scryfall card ID for consistency
  card_name TEXT NOT NULL, -- Redundant but useful for display
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 999), -- 4-of limit enforced in app, 999 for basic lands

  -- Cached card data (denormalized for performance)
  mana_cost TEXT,
  cmc REAL,
  type_line TEXT,
  colors TEXT[], -- Array of color codes: ['W', 'U', 'B', 'R', 'G']
  rarity TEXT,
  set_code TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique cards per deck
  UNIQUE(deck_id, scryfall_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_format ON decks(format);
CREATE INDEX IF NOT EXISTS idx_decks_updated_at ON decks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_cards_scryfall_id ON deck_cards(scryfall_id);

-- Enable Row Level Security
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decks table
CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for deck_cards table
CREATE POLICY "Users can view cards in their decks"
  ON deck_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert cards into their decks"
  ON deck_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their decks"
  ON deck_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their decks"
  ON deck_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Function to update deck stats when cards change
CREATE OR REPLACE FUNCTION update_deck_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_cards and is_valid in parent deck
  UPDATE decks
  SET
    total_cards = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM deck_cards
      WHERE deck_id = COALESCE(NEW.deck_id, OLD.deck_id)
    ),
    is_valid = (
      SELECT COALESCE(SUM(quantity), 0) >= 60
      FROM deck_cards
      WHERE deck_id = COALESCE(NEW.deck_id, OLD.deck_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.deck_id, OLD.deck_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update deck stats
CREATE TRIGGER trigger_update_deck_stats
  AFTER INSERT OR UPDATE OR DELETE ON deck_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_deck_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deck_cards_updated_at
  BEFORE UPDATE ON deck_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
