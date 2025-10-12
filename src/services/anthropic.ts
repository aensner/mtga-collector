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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a Magic: The Gathering deck building expert. Help build a ${format} format deck.

USER REQUEST: ${prompt}

CURRENT DECK (${currentDeck.reduce((sum, c) => sum + c.count, 0)} cards):
${currentDeck.length > 0 ? currentDeck.map(c => `${c.count}x ${c.name} (${c.type}, CMC ${c.cmc})`).join('\n') : 'Empty deck'}

AVAILABLE CARDS FROM COLLECTION (these are the ONLY cards you can suggest):
${availableCards.slice(0, 200).map(c => `${c.name} (${c.type}, CMC ${c.cmc}, Available: ${c.available})`).join('\n')}
${availableCards.length > 200 ? `\n...and ${availableCards.length - 200} more cards in collection` : ''}

CRITICAL RULES:
1. ONLY suggest cards that appear in the "AVAILABLE CARDS FROM COLLECTION" list above
2. DO NOT suggest cards that are not in that list, even if they would be perfect for the deck
3. Use the EXACT card names as shown in the available cards list
4. Check the "Available" count - don't suggest more copies than are available
5. Respect the 4-of limit (except basic lands like Plains, Island, Swamp, Mountain, Forest)

Respond in JSON format:
{
  "suggestions": [
    {
      "cardName": "Exact card name from available cards list",
      "count": 2,
      "reason": "Brief explanation of why this card fits"
    }
  ]
}

Remember: If a card is not in the AVAILABLE CARDS list, you CANNOT suggest it, no matter how good it would be.`
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
