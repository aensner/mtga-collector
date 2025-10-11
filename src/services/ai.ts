/**
 * Unified AI Service
 *
 * Automatically selects between Anthropic and OpenAI based on which API key is configured.
 * Priority: OpenAI > Anthropic (OpenAI is more affordable for this use case)
 */

import * as anthropic from './anthropic';
import * as openai from './openai';

// Check which API keys are available
const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
const hasAnthropic = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

// Determine which provider to use (prefer OpenAI for cost-effectiveness)
const useOpenAI = hasOpenAI;
const useAnthropic = !hasOpenAI && hasAnthropic;

if (!hasOpenAI && !hasAnthropic) {
  console.warn('⚠️ No AI API keys configured. AI features will be disabled.');
  console.warn('Add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file to enable AI features.');
} else {
  const provider = useOpenAI ? 'OpenAI (gpt-4o-mini)' : 'Anthropic (Claude Sonnet 4.5)';
  console.log(`✅ Using ${provider} for AI features`);
}

/**
 * Get the name of the currently active AI provider
 */
export const getActiveProvider = (): 'openai' | 'anthropic' | 'none' => {
  if (useOpenAI) return 'openai';
  if (useAnthropic) return 'anthropic';
  return 'none';
};

/**
 * Correct a single card name using AI
 */
export const correctCardName = async (ocrText: string): Promise<{ correctedName: string; confidence: number }> => {
  if (useOpenAI) {
    return openai.correctCardName(ocrText);
  } else if (useAnthropic) {
    return anthropic.correctCardName(ocrText);
  } else {
    throw new Error('⚠️ No AI Provider: Please add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file.');
  }
};

/**
 * Correct multiple card names in batch using AI
 */
export const correctCardNamesBatch = async (ocrTexts: string[]): Promise<Array<{ correctedName: string; confidence: number }>> => {
  if (useOpenAI) {
    return openai.correctCardNamesBatch(ocrTexts);
  } else if (useAnthropic) {
    return anthropic.correctCardNamesBatch(ocrTexts);
  } else {
    throw new Error('⚠️ No AI Provider: Please add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file.');
  }
};

/**
 * Get AI-powered deck building suggestions
 */
export const getAIDeckSuggestions = async (
  prompt: string,
  currentDeck: Array<{ name: string; count: number; type?: string; cmc?: number }>,
  availableCards: Array<{ name: string; type?: string; cmc?: number; colors?: string[]; available: number }>,
  format: string
): Promise<{
  suggestions: Array<{
    cardName: string;
    count: number;
    reason: string;
  }>;
}> => {
  if (useOpenAI) {
    return openai.getAIDeckSuggestions(prompt, currentDeck, availableCards, format);
  } else if (useAnthropic) {
    return anthropic.getAIDeckSuggestions(prompt, currentDeck, availableCards, format);
  } else {
    throw new Error('⚠️ No AI Provider: Please add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file.');
  }
};
