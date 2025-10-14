import Anthropic from '@anthropic-ai/sdk';
import { getAPIKeys } from './settings';

/**
 * Get Anthropic client with API key from user settings or environment
 */
async function getClient(): Promise<Anthropic> {
  const keys = await getAPIKeys();
  const apiKey = keys.anthropic;

  if (!apiKey) {
    throw new Error('⚠️ API Key Missing: Please add your Anthropic API key in Settings (⚙️).');
  }

  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
  });
}

export const correctCardName = async (ocrText: string): Promise<{ correctedName: string; confidence: number }> => {
  try {
    const client = await getClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `This is a Magic: The Gathering card name extracted via OCR: "${ocrText}".

Please correct any OCR errors and return ONLY the correct card name, nothing else.
If the text is clearly not a card name, return "UNKNOWN".
Be aware that card names can include special characters, apostrophes, and uncommon words.`
      }]
    });

    const correctedName = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : ocrText;

    // Simple confidence based on stop_reason
    const confidence = message.stop_reason === 'end_turn' ? 0.95 : 0.7;

    return { correctedName, confidence };
  } catch (error) {
    console.error('Error correcting card name with Anthropic:', error);
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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Extract the Magic: The Gathering card name from OCR text.

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

Return ONLY the card names, one per line, no extra formatting.`
      }]
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '';

    const correctedNames = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const confidence = message.stop_reason === 'end_turn' ? 0.95 : 0.7;

    return correctedNames.map(name => ({ correctedName: name, confidence }));
  } catch (error: any) {
    console.error('Error correcting card names in batch:', error);
    console.error('Error details:', error?.message || error);

    // Handle specific error types
    if (error?.message?.includes('credit balance is too low')) {
      throw new Error('⚠️ API Credits Low: Your Anthropic API credit balance is too low. Please visit console.anthropic.com to add credits or upgrade your plan.');
    } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
      throw error; // Re-throw if it's already formatted
    } else if (error?.status === 401 || error?.message?.includes('authentication')) {
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your Anthropic API key in Settings (⚙️).');
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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
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

    const response = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response;
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error: any) {
    console.error('Error getting AI deck suggestions:', error);

    // Handle specific error types
    if (error?.message?.includes('credit balance is too low')) {
      throw new Error('⚠️ API Credits Low: Your Anthropic API credit balance is too low. Please visit console.anthropic.com to add credits or upgrade your plan.');
    } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
      throw error; // Re-throw if it's already formatted
    } else if (error?.status === 401 || error?.message?.includes('authentication')) {
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your Anthropic API key in Settings (⚙️).');
    } else {
      throw new Error(`Failed to get AI suggestions: ${error?.message || 'Unknown error'}`);
    }
  }
};
