import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeDeck, findSubstitutes, type DeckCard } from './deckOptimization';

// Mock Anthropic SDK
const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

// Mock settings
vi.mock('./settings', () => ({
  getAPIKeys: vi.fn(() => Promise.resolve({ anthropic: 'test-api-key' })),
}));

describe('Deck Optimization Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeDeck', () => {
    it('should analyze deck and return optimization recommendations', async () => {
      const mockResponse = {
        archetype: 'Aggro',
        archetypeConfidence: 0.92,
        winRateEstimate: 65,
        consistencyScore: 80,
        strengths: [
          'Fast mana curve',
          'High creature density',
          'Good removal'
        ],
        weaknesses: [
          'No card draw',
          'Weak to board wipes'
        ],
        suggestedChanges: {
          add: [
            {
              cardName: 'Embercleave',
              count: 2,
              reason: 'Increases win rate against control',
              impactEstimate: '+8% win rate',
              owned: 1
            }
          ],
          remove: [
            {
              cardName: 'Phoenix of Ash',
              count: 2,
              reason: 'Too slow for aggro plan'
            }
          ]
        }
      };

      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify(mockResponse)
        }],
        stop_reason: 'end_turn'
      });

      const deckCards: DeckCard[] = [
        { name: 'Lightning Bolt', count: 4, type: 'Instant', cmc: 1, colors: ['R'], owned: 4 },
        { name: 'Monastery Swiftspear', count: 4, type: 'Creature', cmc: 1, colors: ['R'], owned: 4 },
        { name: 'Mountain', count: 20, type: 'Land', cmc: 0, colors: [], owned: 999 },
      ];

      const availableCards: DeckCard[] = [
        { name: 'Embercleave', count: 1, type: 'Equipment', cmc: 6, colors: ['R'], owned: 1 },
        { name: 'Shock', count: 4, type: 'Instant', cmc: 1, colors: ['R'], owned: 4 },
      ];

      const result = await analyzeDeck(deckCards, availableCards, 'Standard');

      expect(result.archetype).toBe('Aggro');
      expect(result.winRateEstimate).toBe(65);
      expect(result.consistencyScore).toBe(80);
      expect(result.strengths).toHaveLength(3);
      expect(result.weaknesses).toHaveLength(2);
      expect(result.suggestedChanges.add).toHaveLength(1);
      expect(result.suggestedChanges.remove).toHaveLength(1);
      expect(result.suggestedChanges.add[0].cardName).toBe('Embercleave');
    });

    it('should handle JSON wrapped in markdown code blocks', async () => {
      const mockResponse = {
        archetype: 'Control',
        archetypeConfidence: 0.88,
        winRateEstimate: 58,
        consistencyScore: 75,
        strengths: ['Card draw', 'Removal'],
        weaknesses: ['Slow'],
        suggestedChanges: {
          add: [],
          remove: []
        }
      };

      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: `\`\`\`json\n${JSON.stringify(mockResponse)}\n\`\`\``
        }],
        stop_reason: 'end_turn'
      });

      const deckCards: DeckCard[] = [
        { name: 'Counterspell', count: 4, type: 'Instant', cmc: 2, colors: ['U'], owned: 4 },
      ];

      const result = await analyzeDeck(deckCards, [], 'Standard');

      expect(result.archetype).toBe('Control');
      expect(result.winRateEstimate).toBe(58);
    });

    it('should throw error when API key is missing', async () => {
      const { getAPIKeys } = await import('./settings');
      vi.mocked(getAPIKeys).mockResolvedValueOnce({ anthropic: '' });

      const deckCards: DeckCard[] = [];
      const availableCards: DeckCard[] = [];

      await expect(analyzeDeck(deckCards, availableCards)).rejects.toThrow('API Key Missing');
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'));

      const deckCards: DeckCard[] = [
        { name: 'Test Card', count: 4, type: 'Creature', cmc: 1 },
      ];

      await expect(analyzeDeck(deckCards, [])).rejects.toThrow('Failed to analyze deck');
    });

    it('should handle low credit balance error', async () => {
      mockCreate.mockRejectedValueOnce({
        message: 'Your credit balance is too low'
      });

      const deckCards: DeckCard[] = [
        { name: 'Test Card', count: 4, type: 'Creature', cmc: 1 },
      ];

      await expect(analyzeDeck(deckCards, [])).rejects.toThrow('API Credits Low');
    });

    it('should calculate deck statistics correctly', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify({
            archetype: 'Midrange',
            archetypeConfidence: 0.85,
            winRateEstimate: 60,
            consistencyScore: 70,
            strengths: [],
            weaknesses: [],
            suggestedChanges: { add: [], remove: [] }
          })
        }],
        stop_reason: 'end_turn'
      });

      const deckCards: DeckCard[] = [
        { name: 'Creature 1', count: 10, type: 'Creature', cmc: 2, owned: 10 },
        { name: 'Spell 1', count: 8, type: 'Instant', cmc: 1, owned: 8 },
        { name: 'Land 1', count: 24, type: 'Land', cmc: 0, owned: 999 },
      ];

      await analyzeDeck(deckCards, []);

      // Verify the call was made with deck statistics
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('Total Cards: 42')
            })
          ])
        })
      );
    });
  });

  describe('findSubstitutes', () => {
    it('should find substitute cards for missing card', async () => {
      const mockResponse = [
        {
          cardName: 'Lightning Strike',
          similarityScore: 90,
          reason: 'Similar instant burn spell, same CMC',
          owned: 4
        },
        {
          cardName: 'Shock',
          similarityScore: 85,
          reason: 'Lower CMC but similar effect',
          owned: 4
        }
      ];

      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify(mockResponse)
        }],
        stop_reason: 'end_turn'
      });

      const missingCard = {
        name: 'Lightning Bolt',
        type: 'Instant',
        cmc: 1,
        colors: ['R']
      };

      const availableCards: DeckCard[] = [
        { name: 'Lightning Strike', count: 4, type: 'Instant', cmc: 2, colors: ['R'], owned: 4 },
        { name: 'Shock', count: 4, type: 'Instant', cmc: 1, colors: ['R'], owned: 4 },
      ];

      const result = await findSubstitutes(missingCard, availableCards, 'Red aggro deck');

      expect(result).toHaveLength(2);
      expect(result[0].cardName).toBe('Lightning Strike');
      expect(result[0].similarityScore).toBe(90);
      expect(result[0].owned).toBe(4);
      expect(result[1].cardName).toBe('Shock');
    });

    it('should handle markdown code blocks in response', async () => {
      const mockResponse = [
        {
          cardName: 'Substitute Card',
          similarityScore: 75,
          reason: 'Similar effect',
          owned: 2
        }
      ];

      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: `\`\`\`json\n${JSON.stringify(mockResponse)}\n\`\`\``
        }],
        stop_reason: 'end_turn'
      });

      const missingCard = { name: 'Test Card', type: 'Creature', cmc: 2, colors: ['G'] };
      const availableCards: DeckCard[] = [];

      const result = await findSubstitutes(missingCard, availableCards, 'Test deck');

      expect(result).toHaveLength(1);
      expect(result[0].cardName).toBe('Substitute Card');
    });

    it('should handle errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API error'));

      const missingCard = { name: 'Test Card', type: 'Creature', cmc: 2 };
      const availableCards: DeckCard[] = [];

      await expect(findSubstitutes(missingCard, availableCards, 'Test')).rejects.toThrow(
        'Failed to find substitutes'
      );
    });

    it('should prioritize cards with similar CMC and type', async () => {
      const mockResponse = [
        {
          cardName: 'Perfect Match',
          similarityScore: 95,
          reason: 'Same CMC and type',
          owned: 4
        },
        {
          cardName: 'Close Match',
          similarityScore: 80,
          reason: 'CMC +1',
          owned: 2
        },
        {
          cardName: 'Distant Match',
          similarityScore: 60,
          reason: 'Different type',
          owned: 1
        }
      ];

      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify(mockResponse)
        }],
        stop_reason: 'end_turn'
      });

      const missingCard = {
        name: 'Original Card',
        type: 'Creature',
        cmc: 3,
        colors: ['W']
      };

      const availableCards: DeckCard[] = [
        { name: 'Perfect Match', count: 4, type: 'Creature', cmc: 3, colors: ['W'], owned: 4 },
        { name: 'Close Match', count: 2, type: 'Creature', cmc: 4, colors: ['W'], owned: 2 },
        { name: 'Distant Match', count: 1, type: 'Instant', cmc: 3, colors: ['W'], owned: 1 },
      ];

      const result = await findSubstitutes(missingCard, availableCards, 'White weenie');

      // Results should be sorted by similarity score
      expect(result[0].similarityScore).toBeGreaterThan(result[1].similarityScore);
      expect(result[1].similarityScore).toBeGreaterThan(result[2].similarityScore);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      mockCreate.mockRejectedValueOnce({
        status: 401,
        message: 'Invalid authentication'
      });

      const deckCards: DeckCard[] = [{ name: 'Test', count: 1, type: 'Creature', cmc: 1 }];

      await expect(analyzeDeck(deckCards, [])).rejects.toThrow('Authentication Failed');
    });

    it('should handle invalid JSON responses', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: 'Not valid JSON'
        }],
        stop_reason: 'end_turn'
      });

      const deckCards: DeckCard[] = [{ name: 'Test', count: 1, type: 'Creature', cmc: 1 }];

      await expect(analyzeDeck(deckCards, [])).rejects.toThrow();
    });
  });
});
