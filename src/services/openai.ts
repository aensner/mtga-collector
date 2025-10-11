import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found. AI features will not work with OpenAI.');
}

const client = new OpenAI({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

export const correctCardName = async (ocrText: string): Promise<{ correctedName: string; confidence: number }> => {
  try {
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
    // Check if API key is available
    if (!apiKey) {
      throw new Error('⚠️ API Key Missing: Please add your OpenAI API key to the .env file (VITE_OPENAI_API_KEY).');
    }

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
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your OpenAI API key.');
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
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [{
        role: 'user',
        content: `You are a Magic: The Gathering deck building expert. Help build a ${format} format deck.

USER REQUEST: ${prompt}

CURRENT DECK (${currentDeck.reduce((sum, c) => sum + c.count, 0)} cards):
${currentDeck.length > 0 ? currentDeck.map(c => `${c.count}x ${c.name} (${c.type}, CMC ${c.cmc})`).join('\n') : 'Empty deck'}

AVAILABLE CARDS FROM COLLECTION:
${availableCards.slice(0, 100).map(c => `${c.name} (${c.type}, CMC ${c.cmc}, Available: ${c.available})`).join('\n')}
${availableCards.length > 100 ? `\n...and ${availableCards.length - 100} more cards` : ''}

Please suggest 5-10 cards to add to this deck based on the user's request. Only suggest cards that are in the available collection.

Respond in JSON format:
{
  "suggestions": [
    {
      "cardName": "Exact card name from available cards",
      "count": 2,
      "reason": "Brief explanation of why this card fits"
    }
  ]
}

IMPORTANT:
- Only suggest cards from the AVAILABLE CARDS list
- Respect the 4-of limit (except basic lands)
- Consider mana curve and card synergies
- Match the user's requested strategy
- Keep suggestions practical and focused`
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
    } else if (error?.message?.includes('API key')) {
      throw new Error('⚠️ API Key Missing: Please add your OpenAI API key to the .env file (VITE_OPENAI_API_KEY).');
    } else if (error?.status === 401 || error?.message?.includes('authentication') || error?.message?.includes('Incorrect API key')) {
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your OpenAI API key.');
    } else {
      throw new Error(`Failed to get AI suggestions: ${error?.message || 'Unknown error'}`);
    }
  }
};
