import OpenAI from 'openai';
import { getAPIKeys } from './settings';

/**
 * Get OpenAI client with API key from user settings or environment
 */
async function getClient(): Promise<OpenAI> {
  const keys = await getAPIKeys();
  const apiKey = keys.openai;

  if (!apiKey) {
    throw new Error('⚠️ API Key Missing: Please add your OpenAI API key in Settings (⚙️).');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
  });
}

export const correctCardName = async (ocrText: string): Promise<{ correctedName: string; confidence: number }> => {
  try {
    const client = await getClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `This is a Magic: The Gathering card name extracted via OCR: "${ocrText}".

Please correct any OCR errors and return ONLY the correct card name, nothing else.
If the text is clearly not a card name, return "UNKNOWN".
Be aware that card names can include special characters, apostrophes, and uncommon words.`
      }]
    });

    const correctedName = completion.choices[0]?.message?.content?.trim() || ocrText;
    const confidence = completion.choices[0]?.finish_reason === 'stop' ? 0.95 : 0.7;

    return { correctedName, confidence };
  } catch (error) {
    console.error('Error correcting card name with OpenAI:', error);
    return { correctedName: ocrText, confidence: 0.5 };
  }
};

export const correctCardNamesBatch = async (ocrTexts: string[]): Promise<Array<{ correctedName: string; confidence: number }>> => {
  try {
    const client = await getClient();

    // Limit batch size to avoid token limits
    if (ocrTexts.length > 50) {
      console.warn(`Batch size too large (${ocrTexts.length}), processing in chunks...`);
      const chunks = [];
      for (let i = 0; i < ocrTexts.length; i += 50) {
        chunks.push(ocrTexts.slice(i, i + 50));
      }
      const results = await Promise.all(chunks.map(chunk => correctCardNamesBatch(chunk)));
      return results.flat();
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `These are Magic: The Gathering card names extracted via OCR. Please correct any OCR errors.

OCR Results:
${ocrTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

Return ONLY the corrected card names, one per line, in the same order. No numbering, no explanations.
If a text is clearly not a card name, return "UNKNOWN" for that line.`
      }]
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    const correctedNames = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const confidence = completion.choices[0]?.finish_reason === 'stop' ? 0.95 : 0.7;

    return correctedNames.map(name => ({ correctedName: name, confidence }));
  } catch (error: any) {
    console.error('Error correcting card names in batch:', error);
    console.error('Error details:', error?.message || error);

    // Handle specific error types
    if (error?.message?.includes('insufficient_quota') || error?.message?.includes('quota')) {
      throw new Error('⚠️ API Credits Low: Your OpenAI API quota has been exceeded. Please visit platform.openai.com to add credits or upgrade your plan.');
    } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
      throw error; // Re-throw if it's already formatted
    } else if (error?.status === 401 || error?.message?.includes('authentication') || error?.message?.includes('Incorrect API key')) {
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your OpenAI API key in Settings (⚙️).');
    } else {
      throw new Error(`Failed to correct card names: ${error?.message || 'Unknown error'}`);
    }
  }
};

interface DeckSuggestionResponse {
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

export const getAIDeckSuggestions = async (
  prompt: string,
  currentDeck: Array<{ name: string; count: number; type?: string; cmc?: number }>,
  availableCards: Array<{ name: string; type?: string; cmc?: number; colors?: string[]; available: number }>,
  format: string
): Promise<DeckSuggestionResponse> => {
  try {
    const client = await getClient();

    const currentDeckSize = currentDeck.reduce((sum, c) => sum + c.count, 0);
    const cardsNeeded = Math.max(0, 60 - currentDeckSize);

    // Separate lands and non-lands, prioritize showing lands to AI
    const lands = availableCards.filter(c => c.type?.includes('Land'));
    const nonLands = availableCards.filter(c => !c.type?.includes('Land'));

    // Show more cards to AI: all lands + up to 400 non-lands
    const cardsToShow = [
      ...lands,
      ...nonLands.slice(0, 400)
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [{
        role: 'user',
        content: `You are a Magic: The Gathering deck building expert. Help build a ${format} format deck.

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
Include approximately ${Math.floor(cardsNeeded * 0.4)} basic lands for mana base.`
      }]
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error: any) {
    console.error('Error getting AI deck suggestions:', error);

    // Handle specific error types
    if (error?.message?.includes('insufficient_quota') || error?.message?.includes('quota')) {
      throw new Error('⚠️ API Credits Low: Your OpenAI API quota has been exceeded. Please visit platform.openai.com to add credits or upgrade your plan.');
    } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
      throw error; // Re-throw if it's already formatted
    } else if (error?.status === 401 || error?.message?.includes('authentication') || error?.message?.includes('Incorrect API key')) {
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your OpenAI API key in Settings (⚙️).');
    } else {
      throw new Error(`Failed to get AI suggestions: ${error?.message || 'Unknown error'}`);
    }
  }
};
