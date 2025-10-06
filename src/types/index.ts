export interface CardData {
  nummer: number;
  positionX: number;
  positionY: number;
  kartenname: string;
  anzahl: number;
  confidence?: number;
  correctedName?: string;
  scryfallMatch?: ScryfallCard;
}

export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  rarity: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
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
