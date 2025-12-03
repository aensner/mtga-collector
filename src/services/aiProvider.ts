/**
 * Unified AI Provider interface and utilities.
 * Extracts common logic from OpenAI and Anthropic services to reduce duplication.
 */

import { AI } from '../constants/processing';
import { parseAPIError } from '../types/errors';
import { aiLogger } from './logger';

/** Response format for card name correction */
export interface CardCorrectionResult {
  correctedName: string;
  confidence: number;
}

/** Response format for deck suggestions */
export interface DeckSuggestionResponse {
  deckName: string;
  deckDescription: string;
  keyCard: string;
  strategy: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    cardName: string;
    count: number;
    reason: string;
  }>;
}

/** Card info for deck building */
export interface DeckCardInfo {
  name: string;
  count: number;
  type?: string;
  cmc?: number;
}

/** Available card info for deck suggestions */
export interface AvailableCardInfo {
  name: string;
  type?: string;
  cmc?: number;
  colors?: string[];
  available: number;
}

/**
 * Abstract base class for AI providers.
 * Defines the common interface that OpenAI and Anthropic implementations must follow.
 */
export abstract class AIProvider {
  protected readonly providerName: string;

  constructor(providerName: string) {
    this.providerName = providerName;
  }

  /** Correct a single card name from OCR text */
  abstract correctCardName(ocrText: string): Promise<CardCorrectionResult>;

  /** Correct multiple card names in batch */
  abstract correctCardNamesBatch(ocrTexts: string[]): Promise<CardCorrectionResult[]>;

  /** Get AI suggestions for deck building */
  abstract getAIDeckSuggestions(
    prompt: string,
    currentDeck: DeckCardInfo[],
    availableCards: AvailableCardInfo[],
    format: string
  ): Promise<DeckSuggestionResponse>;

  /**
   * Handle batch processing with chunking for large batches
   */
  protected async processBatchWithChunking(
    texts: string[],
    processFn: (chunk: string[]) => Promise<CardCorrectionResult[]>
  ): Promise<CardCorrectionResult[]> {
    if (texts.length <= AI.MAX_BATCH_SIZE) {
      return processFn(texts);
    }

    aiLogger.warn(`Batch size too large (${texts.length}), processing in chunks...`);

    const chunks: string[][] = [];
    for (let i = 0; i < texts.length; i += AI.MAX_BATCH_SIZE) {
      chunks.push(texts.slice(i, i + AI.MAX_BATCH_SIZE));
    }

    const results = await Promise.all(chunks.map(processFn));
    return results.flat();
  }

  /**
   * Handle API errors with proper error types
   */
  protected handleAPIError(error: unknown): never {
    const apiError = parseAPIError(error, this.providerName);
    aiLogger.error(`${this.providerName} API error`, apiError);
    throw apiError;
  }
}

/**
 * Build the prompt for single card name correction
 */
export function buildSingleCardPrompt(ocrText: string): string {
  return `This is a Magic: The Gathering card name extracted via OCR: "${ocrText}".

Please correct any OCR errors and return ONLY the correct card name, nothing else.
If the text is clearly not a card name, return "UNKNOWN".
Be aware that card names can include special characters, apostrophes, and uncommon words.`;
}

/**
 * Build the prompt for batch card name correction
 */
export function buildBatchCardPrompt(ocrTexts: string[]): string {
  return `Extract the Magic: The Gathering card name from OCR text.

OCR text has 1-3 garbage characters at the start/end. Strip them and extract the real card name.

OCR Results:
${ocrTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

SIMPLE RULES:
1. Remove 1-3 leading characters if they're lowercase letters or "Y"
   - "za Yjwari Disruption i" → remove "za Y" → "jwari Disruption i"
2. Remove 1-2 trailing single letters (i, a, etc.)
   - "jwari Disruption i" → remove "i" → "jwari Disruption"
3. Capitalize the first letter
   - "jwari Disruption" → "Jwari Disruption"
4. If it's a Modal DFC, add the back face
   - "Jwari Disruption" → "Jwari Disruption // Jwari Ruins"

Common Zendikar Rising MDFCs:
- Jwari Disruption // Jwari Ruins (blue instant/land)
- Valakut Awakening // Valakut Stoneforge (red sorcery/land)
- Agadeem's Awakening // Agadeem, the Undercrypt (black sorcery/land)
- Vastwood Fortification // Vastwood Thicket (green instant/land)
- Shatterskull Smashing // Shatterskull, the Hammer Pass (red sorcery/land)

EXAMPLES:
Input: "za Yjwari Disruption i"
→ Strip "za Y" and "i" → "jwari Disruption"
→ Capitalize → "Jwari Disruption"
→ Add back face → "Jwari Disruption // Jwari Ruins"

Input: "Valakut Awakening"
→ Already clean
→ Add back face → "Valakut Awakening // Valakut Stoneforge"

Return ONLY the card names, one per line, no extra formatting.`;
}

/**
 * Build the prompt for deck suggestions
 */
export function buildDeckSuggestionPrompt(
  prompt: string,
  currentDeck: DeckCardInfo[],
  cardsToShow: AvailableCardInfo[],
  format: string
): string {
  const currentDeckSize = currentDeck.reduce((sum, c) => sum + c.count, 0);
  const cardsNeeded = Math.max(0, 60 - currentDeckSize);

  return `You are a Magic: The Gathering deck building expert. Help build a ${format} format deck.

USER REQUEST: ${prompt}

CURRENT DECK (${currentDeckSize} cards):
${currentDeck.length > 0 ? currentDeck.map(c => `${c.count}x ${c.name} (${c.type}, CMC ${c.cmc})`).join('\n') : 'Empty deck'}

TARGET: A complete 60-card deck. You need to suggest approximately ${cardsNeeded} more cards to reach 60.

AVAILABLE CARDS FROM COLLECTION (these are the ONLY cards you can suggest):
${cardsToShow.map(c => `${c.name} (${c.type}, CMC ${c.cmc}, Available: ${c.available})`).join('\n')}

CRITICAL RULES:
1. ONLY suggest cards that appear in the "AVAILABLE CARDS FROM COLLECTION" list above
2. Basic lands (Plains, Island, Swamp, Mountain, Forest) are ALWAYS available in unlimited quantities (MTG Arena feature)
3. DO NOT suggest non-basic cards that are not in the list - NO EXCEPTIONS
4. Use the EXACT card names as shown in the available cards list (copy them character-by-character)
5. Check the "Available" count - don't suggest more copies than are available
6. Respect the 4-of limit for non-basic cards
7. You can suggest unlimited basic lands (no 4-of limit applies to Plains, Island, Swamp, Mountain, Forest)
8. IMPORTANT: Suggest enough cards to build a COMPLETE 60-card deck (approximately ${cardsNeeded} cards needed)
9. Include 22-26 basic lands for a proper mana base!

Respond in JSON format with a COMPLETE deck profile:
{
  "deckName": "Creative deck name (e.g., 'Lifegain Swarm', 'Burn Rush', 'Control Tower')",
  "deckDescription": "1-2 sentence overview of the deck's theme and playstyle",
  "keyCard": "The strongest/most important card name from the deck",
  "strategy": "2-3 sentences explaining how to play this deck and win",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": [
    {
      "cardName": "Exact card name from available cards list",
      "count": 4,
      "reason": "Brief explanation of why this card fits"
    },
    // ... more cards to reach ~60 total cards
  ]
}

STRICT VALIDATION CHECKLIST - Before adding ANY non-basic card to your suggestions:
✓ Search the AVAILABLE CARDS list for the EXACT card name
✓ If the card is NOT in the list above AND is not a basic land, DO NOT suggest it
✓ Double-check you're copying the exact name from the list
✓ Verify the Available count is sufficient
✓ Basic lands (Plains, Island, Swamp, Mountain, Forest) are ALWAYS OK to suggest

Example validation:
✅ "Plains" - ALWAYS available (basic land)
✅ "Healer's Hawk" - Check if in available cards list
❌ "Return to Dust" - NOT in available cards list, DON'T suggest it

Build a complete ${cardsNeeded > 0 ? `${cardsNeeded}-card addition to reach 60 total` : '60-card deck'}.
Include approximately ${Math.floor(cardsNeeded * 0.4)} basic lands for mana base.`;
}

/**
 * Parse batch correction response into results
 */
export function parseBatchResponse(
  response: string,
  confidence: number
): CardCorrectionResult[] {
  const correctedNames = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return correctedNames.map(name => ({ correctedName: name, confidence }));
}

/**
 * Prepare cards for AI suggestion prompt (separates lands, limits non-lands)
 */
export function prepareCardsForSuggestion(
  availableCards: AvailableCardInfo[]
): AvailableCardInfo[] {
  const lands = availableCards.filter(c => c.type?.includes('Land'));
  const nonLands = availableCards.filter(c => !c.type?.includes('Land'));

  return [
    ...lands,
    ...nonLands.slice(0, AI.MAX_CARDS_FOR_SUGGESTIONS)
  ];
}

/**
 * Extract JSON from AI response (handles markdown code blocks)
 */
export function extractJSON<T>(response: string): T {
  let jsonText = response;

  // Try to extract from markdown code blocks
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                    response.match(/```\n([\s\S]*?)\n```/);

  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }

  return JSON.parse(jsonText);
}
