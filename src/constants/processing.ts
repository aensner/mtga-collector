/**
 * Processing constants for card extraction and OCR
 * Centralizes magic numbers for easier configuration and testing
 */

/** Grid layout constants */
export const GRID = {
  /** Number of columns in the MTG Arena collection grid */
  COLUMNS: 12,
  /** Number of rows in the MTG Arena collection grid */
  ROWS: 3,
  /** Total cards per screenshot page */
  CARDS_PER_PAGE: 36,
} as const;

/** OCR processing constants */
export const OCR = {
  /** Number of parallel Tesseract workers */
  WORKER_COUNT: 4,
  /** Cards processed per batch */
  BATCH_SIZE: 4,
  /** Contrast enhancement factor for preprocessing */
  CONTRAST_FACTOR: 1.5,
  /** Minimum card name length for validation */
  MIN_CARD_NAME_LENGTH: 2,
  /** Maximum card name length */
  MAX_CARD_NAME_LENGTH: 100,
} as const;

/** Empty slot detection thresholds */
export const EMPTY_DETECTION = {
  /** Edge density threshold - below this is considered empty */
  EDGE_THRESHOLD: 0.02,
  /** Percentage of card center to analyze */
  CENTER_REGION: 0.7,
} as const;

/** Quantity detection constants */
export const QUANTITY = {
  /** Maximum card quantity (excluding infinity) */
  MAX_QUANTITY: 4,
  /** Number of diamond zones to check */
  DIAMOND_ZONES: 4,
  /** Default brightness threshold for dark pixels */
  DEFAULT_BRIGHTNESS_THRESHOLD: 50,
  /** Default saturation threshold for grey pixels */
  DEFAULT_SATURATION_THRESHOLD: 10,
  /** Default fill ratio threshold */
  DEFAULT_FILL_RATIO_THRESHOLD: 0.05,
} as const;

/** AI processing constants */
export const AI = {
  /** Maximum batch size for AI correction */
  MAX_BATCH_SIZE: 50,
  /** Maximum cards to show AI for deck suggestions */
  MAX_CARDS_FOR_SUGGESTIONS: 400,
} as const;

/** Scryfall API constants */
export const SCRYFALL = {
  /** Base URL for Scryfall API */
  BASE_URL: 'https://api.scryfall.com',
  /** Delay between API requests (ms) to respect rate limits */
  RATE_LIMIT_DELAY: 100,
  /** Maximum retry attempts for API calls */
  MAX_RETRIES: 3,
  /** Base delay for exponential backoff (ms) */
  RETRY_BASE_DELAY: 200,
} as const;

/** Deck building constants */
export const DECK = {
  /** Standard deck size */
  STANDARD_SIZE: 60,
  /** Recommended land count range */
  LAND_COUNT_MIN: 22,
  LAND_COUNT_MAX: 26,
  /** Maximum copies of non-basic cards */
  MAX_COPIES: 4,
} as const;

/** UI timing constants */
export const UI = {
  /** Debounce delay for calibration changes (ms) */
  CALIBRATION_DEBOUNCE: 1000,
  /** Auto-hide delay for success messages (ms) */
  SUCCESS_MESSAGE_DURATION: 3000,
  /** Progress indicator hide delay after completion (ms) */
  PROGRESS_HIDE_DELAY: 2000,
} as const;

/** Default calibration values */
export const DEFAULT_CALIBRATION = {
  // Grid parameters
  START_X: 0.027,
  START_Y: 0.193,
  GRID_WIDTH: 0.945,
  GRID_HEIGHT: 0.788,
  CARD_GAP_X: 0.008,
  CARD_GAP_Y: 0.036,

  // OCR region parameters
  OCR_LEFT: 0.05,
  OCR_TOP: 0.043,
  OCR_WIDTH: 0.80,
  OCR_HEIGHT: 0.075,

  // Quantity detection parameters
  QUANTITY_OFFSET_X: 0.28,
  QUANTITY_OFFSET_Y: 0.08,
  QUANTITY_WIDTH: 0.44,
  QUANTITY_HEIGHT: 0.07,
} as const;

/** Basic land names (unlimited in MTG Arena) */
export const BASIC_LANDS = [
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
] as const;

export type BasicLand = typeof BASIC_LANDS[number];
