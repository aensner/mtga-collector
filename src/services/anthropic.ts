import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('Anthropic API key not found. Card name correction will not work.');
}

const client = new Anthropic({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
});

export const correctCardName = async (ocrText: string): Promise<{ correctedName: string; confidence: number }> => {
  try {
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
    // Check if API key is available
    if (!apiKey) {
      console.warn('Anthropic API key not configured. Skipping AI correction.');
      return ocrTexts.map(text => ({ correctedName: text, confidence: 0.5 }));
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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
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

    const response = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '';

    const correctedNames = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const confidence = message.stop_reason === 'end_turn' ? 0.95 : 0.7;

    return correctedNames.map(name => ({ correctedName: name, confidence }));
  } catch (error: any) {
    console.error('Error correcting card names in batch:', error);
    console.error('Error details:', error?.message || error);
    // Return original texts with low confidence on error
    return ocrTexts.map(text => ({ correctedName: text, confidence: 0.5 }));
  }
};
