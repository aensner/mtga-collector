/**
 * Unified AI Service
 *
 * Automatically selects between Anthropic and OpenAI based on which API key is configured.
 * Priority: User settings > Environment variables
 * Preference: OpenAI > Anthropic (OpenAI is more affordable for this use case)
 */

import * as anthropic from './anthropic';
import * as openai from './openai';
import { getAPIKeys, loadSettings } from './settings';

/**
 * Determine which AI provider to use based on available keys and user preferences
 */
async function getAIProvider(): Promise<{ useOpenAI: boolean; useAnthropic: boolean; provider: string }> {
  // Get API keys from user settings (with fallback to env)
  const keys = await getAPIKeys();
  const settings = await loadSettings();

  const hasOpenAI = !!keys.openai;
  const hasAnthropic = !!keys.anthropic;

  // Respect user preference if set
  const preference = settings.ai_provider_preference || 'auto';

  let useOpenAI = false;
  let useAnthropic = false;

  if (preference === 'openai' && hasOpenAI) {
    useOpenAI = true;
  } else if (preference === 'anthropic' && hasAnthropic) {
    useAnthropic = true;
  } else {
    // Auto mode: prefer OpenAI for cost-effectiveness
    useOpenAI = hasOpenAI;
    useAnthropic = !hasOpenAI && hasAnthropic;
  }

  const provider = useOpenAI
    ? 'OpenAI (gpt-4o-mini)'
    : useAnthropic
    ? 'Anthropic (Claude Sonnet 4.5)'
    : 'None';

  return { useOpenAI, useAnthropic, provider };
}

/**
 * Get the name of the currently active AI provider
 */
export const getActiveProvider = async (): Promise<'openai' | 'anthropic' | 'none'> => {
  const { useOpenAI, useAnthropic } = await getAIProvider();
  if (useOpenAI) return 'openai';
  if (useAnthropic) return 'anthropic';
  return 'none';
};

/**
 * Correct a single card name using AI
 */
export const correctCardName = async (ocrText: string): Promise<{ correctedName: string; confidence: number }> => {
  const { useOpenAI, useAnthropic } = await getAIProvider();

  if (useOpenAI) {
    return openai.correctCardName(ocrText);
  } else if (useAnthropic) {
    return anthropic.correctCardName(ocrText);
  } else {
    throw new Error('⚠️ API Key Missing: Please add an OpenAI or Anthropic API key in Settings (⚙️) to enable AI features.');
  }
};

/**
 * Correct multiple card names in batch using AI
 */
export const correctCardNamesBatch = async (ocrTexts: string[]): Promise<Array<{ correctedName: string; confidence: number }>> => {
  const { useOpenAI, useAnthropic } = await getAIProvider();

  if (useOpenAI) {
    return openai.correctCardNamesBatch(ocrTexts);
  } else if (useAnthropic) {
    return anthropic.correctCardNamesBatch(ocrTexts);
  } else {
    throw new Error('⚠️ API Key Missing: Please add an OpenAI or Anthropic API key in Settings (⚙️) to enable AI features.');
  }
};

/**
 * Get AI-powered deck building suggestions with full deck profile
 */
export const getAIDeckSuggestions = async (
  prompt: string,
  currentDeck: Array<{ name: string; count: number; type?: string; cmc?: number }>,
  availableCards: Array<{ name: string; type?: string; cmc?: number; colors?: string[]; available: number }>,
  format: string
): Promise<{
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
}> => {
  const { useOpenAI, useAnthropic } = await getAIProvider();

  if (useOpenAI) {
    return openai.getAIDeckSuggestions(prompt, currentDeck, availableCards, format);
  } else if (useAnthropic) {
    return anthropic.getAIDeckSuggestions(prompt, currentDeck, availableCards, format);
  } else {
    throw new Error('⚠️ API Key Missing: Please add an OpenAI or Anthropic API key in Settings (⚙️) to enable AI features.');
  }
};
