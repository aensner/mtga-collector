import Anthropic from '@anthropic-ai/sdk';
import { getAPIKeys } from './settings';

async function getClient(): Promise<Anthropic> {
  const keys = await getAPIKeys();
  const apiKey = keys.anthropic;

  if (!apiKey) {
    throw new Error('⚠️ API Key Missing: Please add your Anthropic API key in Settings (⚙️).');
  }

  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export interface DeckCard {
  name: string;
  count: number;
  type?: string;
  cmc?: number;
  colors?: string[];
  owned?: number;
}

export interface DeckAnalysis {
  archetype: string;
  archetypeConfidence: number;
  winRateEstimate: number;
  consistencyScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestedChanges: {
    add: Array<{
      cardName: string;
      count: number;
      reason: string;
      impactEstimate: string;
      owned: number;
    }>;
    remove: Array<{
      cardName: string;
      count: number;
      reason: string;
    }>;
  };
}

/**
 * Analyzes a deck and provides optimization recommendations
 */
export const analyzeDeck = async (
  deckCards: DeckCard[],
  availableCards: DeckCard[],
  format: string = 'Standard'
): Promise<DeckAnalysis> => {
  try {
    const client = await getClient();

    const totalCards = deckCards.reduce((sum, c) => sum + c.count, 0);

    // Calculate basic deck stats
    const lands = deckCards.filter(c => c.type?.toLowerCase().includes('land'));
    const creatures = deckCards.filter(c => c.type?.toLowerCase().includes('creature'));
    const spells = deckCards.filter(c =>
      c.type?.toLowerCase().includes('instant') ||
      c.type?.toLowerCase().includes('sorcery')
    );

    const avgCmc = deckCards
      .filter(c => !c.type?.toLowerCase().includes('land'))
      .reduce((sum, c) => sum + (c.cmc || 0) * c.count, 0) /
      (totalCards - lands.reduce((sum, c) => sum + c.count, 0));

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are a professional Magic: The Gathering deck builder and meta analyst. Analyze this ${format} deck and provide optimization recommendations.

CURRENT DECK (${totalCards} cards):
${deckCards.map(c => `${c.count}x ${c.name} (${c.type}, CMC ${c.cmc || 0}, Owned: ${c.owned || 0})`).join('\n')}

DECK STATISTICS:
- Total Cards: ${totalCards}
- Lands: ${lands.reduce((sum, c) => sum + c.count, 0)}
- Creatures: ${creatures.reduce((sum, c) => sum + c.count, 0)}
- Spells: ${spells.reduce((sum, c) => sum + c.count, 0)}
- Average CMC: ${avgCmc.toFixed(2)}

AVAILABLE CARDS IN COLLECTION (for replacement suggestions):
${availableCards.slice(0, 200).map(c => `${c.name} (${c.type}, CMC ${c.cmc || 0}, Available: ${c.owned || 0})`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Identify the deck's archetype (Aggro, Midrange, Control, Combo, or Tempo)
2. Estimate competitive win rate (realistic percentage based on card quality and synergy)
3. Calculate consistency score (0-100, based on mana curve, card draw, redundancy)
4. List 3-5 strengths (what the deck does well)
5. List 2-4 weaknesses (vulnerabilities, missing pieces)
6. Suggest specific changes:
   - Cards to ADD (prioritize cards from available collection)
   - Cards to REMOVE (identify weak/redundant cards)
   - Each suggestion should include impact estimate (win rate improvement %)

CRITICAL RULES:
1. ONLY suggest cards that appear in the "AVAILABLE CARDS IN COLLECTION" list above
2. Basic lands are ALWAYS available (unlimited)
3. Focus on high-impact changes (prioritize quality over quantity)
4. Consider card synergies and mana curve balance
5. Keep total deck at 60 cards
6. Use exact card names from the available cards list

Respond in JSON format:
{
  "archetype": "Aggro|Midrange|Control|Combo|Tempo",
  "archetypeConfidence": 0.95,
  "winRateEstimate": 62,
  "consistencyScore": 78,
  "strengths": [
    "Fast mana curve with avg CMC 2.1",
    "High creature density for board presence",
    "Good removal package"
  ],
  "weaknesses": [
    "No card draw engines",
    "Weak to board wipes",
    "Limited late-game reach"
  ],
  "suggestedChanges": {
    "add": [
      {
        "cardName": "Exact card name from available list",
        "count": 2,
        "reason": "Provides card draw and helps rebuild after board wipes",
        "impactEstimate": "+8% win rate",
        "owned": 4
      }
    ],
    "remove": [
      {
        "cardName": "Card to remove from current deck",
        "count": 2,
        "reason": "Too slow for the deck's aggro game plan"
      }
    ]
  }
}

Provide actionable, specific recommendations that improve the deck's competitive viability.`
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

    const parsed: DeckAnalysis = JSON.parse(jsonText);
    return parsed;
  } catch (error: any) {
    console.error('Error analyzing deck:', error);

    // Handle specific error types
    if (error?.message?.includes('credit balance is too low')) {
      throw new Error('⚠️ API Credits Low: Your Anthropic API credit balance is too low. Please visit console.anthropic.com to add credits or upgrade your plan.');
    } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
      throw error;
    } else if (error?.status === 401 || error?.message?.includes('authentication')) {
      throw new Error('⚠️ Authentication Failed: Your API key may be invalid. Please check your Anthropic API key in Settings (⚙️).');
    } else {
      throw new Error(`Failed to analyze deck: ${error?.message || 'Unknown error'}`);
    }
  }
};

/**
 * Finds substitute cards for missing cards
 */
export const findSubstitutes = async (
  missingCard: { name: string; type?: string; cmc?: number; colors?: string[] },
  availableCards: DeckCard[],
  deckContext: string
): Promise<Array<{ cardName: string; similarityScore: number; reason: string; owned: number }>> => {
  try {
    const client = await getClient();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Find substitute cards for a missing MTG card.

MISSING CARD: ${missingCard.name} (${missingCard.type}, CMC ${missingCard.cmc}, Colors: ${missingCard.colors?.join('') || 'None'})

DECK CONTEXT: ${deckContext}

AVAILABLE CARDS IN COLLECTION:
${availableCards.slice(0, 150).map(c => `${c.name} (${c.type}, CMC ${c.cmc || 0}, Colors: ${c.colors?.join('') || 'None'}, Available: ${c.owned || 0})`).join('\n')}

REQUIREMENTS:
1. Find 3-5 best substitutes from the available cards list
2. Prioritize cards with similar:
   - Mana cost (±1 CMC acceptable)
   - Card type (creature for creature, instant for instant)
   - Colors (same or subset)
   - Function/effect
3. Only suggest cards from the available list above
4. Score similarity 0-100 (100 = perfect replacement, 0 = poor fit)

Respond in JSON format:
[
  {
    "cardName": "Exact card name from available list",
    "similarityScore": 85,
    "reason": "Similar effect and CMC, slightly different colors",
    "owned": 4
  }
]

Return 3-5 best substitutes, sorted by similarity score (best first).`
      }]
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '';

    // Extract JSON from response
    let jsonText = response;
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed: Array<{ cardName: string; similarityScore: number; reason: string; owned: number }> = JSON.parse(jsonText);
    return parsed;
  } catch (error: any) {
    console.error('Error finding substitutes:', error);
    throw new Error(`Failed to find substitutes: ${error?.message || 'Unknown error'}`);
  }
};
