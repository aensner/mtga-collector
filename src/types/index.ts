export interface CardData {
  nummer: number;
  positionX: number;
  positionY: number;
  kartenname: string;
  anzahl: number;
  confidence?: number;
  correctedName?: string;
  scryfallMatch?: ScryfallCard;
  pageNumber?: number; // Which screenshot/page this card came from (1-indexed)
  screenshotFilename?: string; // Filename of the screenshot
  ocrRegion?: { // The OCR region coordinates for this card
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ocrRegionImage?: string; // Base64 data URL of the OCR region
}

export interface ScryfallCard {
  id: string;
  name: string;
  set: string; // 3-letter set code (e.g., "grn", "war")
  set_name: string; // Full set name
  rarity: string;
  collector_number: string; // Required for MTG Arena export

  // Gameplay data
  colors?: string[]; // ["W", "U", "B", "R", "G"]
  color_identity?: string[];
  mana_cost?: string; // "{2}{U}{U}"
  cmc?: number; // Converted mana cost
  type_line?: string; // "Instant" or "Creature — Human Wizard"
  oracle_text?: string; // Official rules text
  power?: string; // Can be "*" or number
  toughness?: string; // Can be "*" or number
  loyalty?: string; // Planeswalker loyalty
  keywords?: string[]; // ["Flying", "Haste"]

  // Image URLs
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop?: string; // For modal background
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface GridCell {
  x: number;
  y: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cardName?: string;
  quantity?: number;
  ocrConfidence?: number;
}

export interface ProcessingResult {
  cards: CardData[];
  totalCards: number;
  accuracy?: AccuracyMetrics;
  processingTime: number;
}

export interface AccuracyMetrics {
  exactNameMatches: number;
  fuzzyNameMatches: number;
  quantityMatches: number;
  totalCards: number;
  nameAccuracy: number;
  quantityAccuracy: number;
  overallAccuracy: number;
  errors: Array<{
    expected: string;
    actual: string;
    position: { x: number; y: number };
  }>;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  processed: boolean;
  result?: ProcessingResult;
}

export interface DbCollectionCard {
  id: string;
  user_id: string;
  card_name: string;
  quantity: number;
  scryfall_id?: string;
  scryfall_name?: string;
  set_code?: string;
  rarity?: string;
  collector_number?: string; // NEW: For MTG Arena export

  // Gameplay data
  colors?: string[];
  color_identity?: string[];
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  keywords?: string[];

  // Image URLs
  image_url?: string; // Deprecated, use image_normal
  image_small?: string;
  image_normal?: string;
  image_large?: string;
  image_art_crop?: string;

  // Position metadata
  page_number?: number;
  position_x?: number;
  position_y?: number;
  confidence?: number;

  created_at: string;
  updated_at: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface CalibrationSettings {
  // Grid calibration parameters
  startX: number;
  startY: number;
  gridWidth: number;
  gridHeight: number;
  cardGapX: number;
  cardGapY: number;

  // OCR region parameters
  ocrLeft: number;
  ocrTop: number;
  ocrWidth: number;
  ocrHeight: number;

  // Quantity detection parameters
  quantityOffsetX: number;
  quantityOffsetY: number;
  quantityWidth: number;
  quantityHeight: number;
  brightnessThreshold: number;
  saturationThreshold: number;
  fillRatioThreshold: number;
}

export interface DbCalibrationSettings {
  id: string;
  user_id: string;
  start_x: number;
  start_y: number;
  grid_width: number;
  grid_height: number;
  card_gap_x: number;
  card_gap_y: number;
  ocr_left: number;
  ocr_top: number;
  ocr_width: number;
  ocr_height: number;
  quantity_offset_x: number;
  quantity_offset_y: number;
  quantity_width: number;
  quantity_height: number;
  brightness_threshold: number;
  saturation_threshold: number;
  fill_ratio_threshold: number;
  created_at: string;
  updated_at: string;
}

// Deck types
export type DeckFormat = 'standard' | 'historic' | 'explorer' | 'alchemy' | 'timeless' | 'brawl' | 'casual';
export type DeckArchetype = 'Aggro' | 'Control' | 'Midrange' | 'Combo' | 'Ramp' | 'Tempo' | 'Other';

export interface Deck {
  id: string;
  userId: string;
  name: string;
  format: DeckFormat;
  archetype?: DeckArchetype;
  description?: string;
  totalCards: number;
  isValid: boolean; // >= 60 cards
  cards: DeckCard[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckCard {
  id: string;
  deckId: string;
  scryfallId: string;
  cardName: string;
  quantity: number;

  // Cached card data for performance
  manaCost?: string;
  cmc?: number;
  typeLine?: string;
  colors?: string[];
  rarity?: string;
  setCode?: string;

  createdAt: string;
  updatedAt: string;
}

// Database types (snake_case for Supabase)
export interface DbDeck {
  id: string;
  user_id: string;
  name: string;
  format: DeckFormat;
  archetype?: DeckArchetype;
  description?: string;
  total_cards: number;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbDeckCard {
  id: string;
  deck_id: string;
  scryfall_id: string;
  card_name: string;
  quantity: number;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  colors?: string[];
  rarity?: string;
  set_code?: string;
  created_at: string;
  updated_at: string;
}

// View model for deck display
export interface DeckSummary {
  id: string;
  name: string;
  format: DeckFormat;
  archetype?: DeckArchetype;
  totalCards: number;
  isValid: boolean;
  ownedPercentage: number; // Calculated: % of cards user owns
  updatedAt: string;
  colors: string[]; // Deck's color identity
  primaryType?: string; // Most common card type
}
