-- Add enriched Scryfall card data fields to collection_cards table
-- This enables display of full card details and MTG Arena deck export

-- Add gameplay data columns
ALTER TABLE collection_cards
  ADD COLUMN IF NOT EXISTS colors TEXT[],
  ADD COLUMN IF NOT EXISTS color_identity TEXT[],
  ADD COLUMN IF NOT EXISTS mana_cost TEXT,
  ADD COLUMN IF NOT EXISTS cmc DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS type_line TEXT,
  ADD COLUMN IF NOT EXISTS oracle_text TEXT,
  ADD COLUMN IF NOT EXISTS power TEXT,
  ADD COLUMN IF NOT EXISTS toughness TEXT,
  ADD COLUMN IF NOT EXISTS loyalty TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Add collector number for MTG Arena export format
-- Required format: "<quantity> <Card Name> (<SET>) <collector_number>"
ALTER TABLE collection_cards
  ADD COLUMN IF NOT EXISTS collector_number TEXT;

-- Add image URLs for card detail modal
ALTER TABLE collection_cards
  ADD COLUMN IF NOT EXISTS image_small TEXT,
  ADD COLUMN IF NOT EXISTS image_normal TEXT,
  ADD COLUMN IF NOT EXISTS image_large TEXT,
  ADD COLUMN IF NOT EXISTS image_art_crop TEXT;

-- Create index on collector_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_collection_cards_collector_number
  ON collection_cards(collector_number);

-- Create index on colors for filtering by color
CREATE INDEX IF NOT EXISTS idx_collection_cards_colors
  ON collection_cards USING GIN(colors);

-- Create index on type_line for filtering by card type
CREATE INDEX IF NOT EXISTS idx_collection_cards_type_line
  ON collection_cards(type_line);

-- Add comment explaining the schema
COMMENT ON COLUMN collection_cards.colors IS 'Card colors array: ["W", "U", "B", "R", "G"]';
COMMENT ON COLUMN collection_cards.color_identity IS 'Commander color identity array';
COMMENT ON COLUMN collection_cards.mana_cost IS 'Mana cost string, e.g., "{2}{U}{U}"';
COMMENT ON COLUMN collection_cards.cmc IS 'Converted mana cost (mana value)';
COMMENT ON COLUMN collection_cards.type_line IS 'Full type line, e.g., "Creature — Human Wizard"';
COMMENT ON COLUMN collection_cards.oracle_text IS 'Official card rules text';
COMMENT ON COLUMN collection_cards.power IS 'Power value (can be "*")';
COMMENT ON COLUMN collection_cards.toughness IS 'Toughness value (can be "*")';
COMMENT ON COLUMN collection_cards.loyalty IS 'Planeswalker loyalty value';
COMMENT ON COLUMN collection_cards.keywords IS 'Array of keywords: ["Flying", "Haste"]';
COMMENT ON COLUMN collection_cards.collector_number IS 'Collector number for MTG Arena export (e.g., "149")';
COMMENT ON COLUMN collection_cards.image_art_crop IS 'Art crop image URL for modal background';
