import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadAllDecks,
  createDeck,
  updateDeckMetadata,
  deleteDeck,
  addCardToDeck,
  removeCardFromDeck,
  updateCardQuantity,
} from './deckDatabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const { supabase: mockSupabase } = await import('./supabase');

describe('Deck Database Service', () => {
  const mockUser = { id: 'test-user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: user is authenticated
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe('loadAllDecks', () => {
    it('should load all decks with cards for authenticated user', async () => {
      const mockDbDecks = [
        {
          id: 'deck-1',
          user_id: mockUser.id,
          name: 'Red Aggro',
          format: 'standard',
          archetype: 'aggro',
          description: 'Fast red deck',
          total_cards: 60,
          is_valid: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          deck_cards: [
            {
              id: 'card-1',
              deck_id: 'deck-1',
              scryfall_id: 'scry-bolt',
              card_name: 'Lightning Bolt',
              quantity: 4,
              mana_cost: '{R}',
              cmc: 1,
              type_line: 'Instant',
              colors: ['R'],
              rarity: 'common',
            },
          ],
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDbDecks, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await loadAllDecks();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Red Aggro');
      expect(result[0].format).toBe('standard');
      expect(result[0].totalCards).toBe(60);
      expect(result[0].cards).toHaveLength(1);
      expect(result[0].cards[0].cardName).toBe('Lightning Bolt');
    });

    it('should return empty array when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await loadAllDecks();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await loadAllDecks();

      expect(result).toEqual([]);
    });
  });

  describe('createDeck', () => {
    it('should create a new deck', async () => {
      const mockInsertedDeck = {
        id: 'new-deck-id',
        user_id: mockUser.id,
        name: 'Blue Control',
        format: 'modern',
        archetype: 'control',
        description: 'Counter everything',
        total_cards: 0,
        is_valid: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockInsertedDeck, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await createDeck('Blue Control', 'modern', 'control', 'Counter everything');

      expect(mockSupabase.from).toHaveBeenCalledWith('decks');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        name: 'Blue Control',
        format: 'modern',
        archetype: 'control',
        description: 'Counter everything',
        total_cards: 0,
        is_valid: false,
      });

      expect(result.name).toBe('Blue Control');
      expect(result.format).toBe('modern');
      expect(result.totalCards).toBe(0);
      expect(result.cards).toEqual([]);
    });

    it('should throw error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(createDeck('Test Deck', 'standard')).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should throw error on database error', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(createDeck('Test Deck', 'standard')).rejects.toThrow();
    });
  });

  describe('updateDeckMetadata', () => {
    it('should update deck metadata', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await updateDeckMetadata('deck-1', {
        name: 'Updated Name',
        format: 'pioneer',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('decks');
      expect(mockChain.update).toHaveBeenCalledWith({
        name: 'Updated Name',
        format: 'pioneer',
      });
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'deck-1');
    });

    it('should throw error on database error', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Update failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(
        updateDeckMetadata('deck-1', { name: 'New Name' })
      ).rejects.toThrow();
    });
  });

  describe('deleteDeck', () => {
    it('should delete a deck', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await deleteDeck('deck-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('decks');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'deck-1');
    });

    it('should throw error on database error', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(deleteDeck('deck-1')).rejects.toThrow();
    });
  });

  describe('addCardToDeck', () => {
    it('should add card to deck with full card data', async () => {
      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await addCardToDeck(
        'deck-1',
        'scry-bolt',
        'Lightning Bolt',
        4,
        {
          manaCost: '{R}',
          cmc: 1,
          typeLine: 'Instant',
          colors: ['R'],
          rarity: 'common',
          setCode: 'M21',
        }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('deck_cards');
      expect(mockChain.upsert).toHaveBeenCalledWith(
        {
          deck_id: 'deck-1',
          scryfall_id: 'scry-bolt',
          card_name: 'Lightning Bolt',
          quantity: 4,
          mana_cost: '{R}',
          cmc: 1,
          type_line: 'Instant',
          colors: ['R'],
          rarity: 'common',
          set_code: 'M21',
        },
        { onConflict: 'deck_id,scryfall_id' }
      );
    });

    it('should add card without optional card data', async () => {
      const mockChain = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await addCardToDeck('deck-1', 'scry-card', 'Test Card', 2);

      expect(mockChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          deck_id: 'deck-1',
          scryfall_id: 'scry-card',
          card_name: 'Test Card',
          quantity: 2,
        }),
        { onConflict: 'deck_id,scryfall_id' }
      );
    });

    it('should throw error on database error', async () => {
      const mockChain = {
        upsert: vi.fn().mockResolvedValue({
          error: { message: 'Upsert failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await expect(
        addCardToDeck('deck-1', 'scry-card', 'Test Card', 2)
      ).rejects.toThrow();
    });
  });

  describe('removeCardFromDeck', () => {
    it('should remove card from deck', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn((field: string) => {
          if (field === 'deck_id') return mockChain;
          if (field === 'scryfall_id') return { ...mockChain, resolvedValue: { error: null } };
          return mockChain;
        }),
      };

      mockChain.eq = vi.fn((field: string) => {
        if (field === 'scryfall_id') {
          return Promise.resolve({ error: null });
        }
        return mockChain;
      }) as any;

      mockSupabase.from.mockReturnValue(mockChain);

      await removeCardFromDeck('deck-1', 'scry-bolt');

      expect(mockSupabase.from).toHaveBeenCalledWith('deck_cards');
      expect(mockChain.delete).toHaveBeenCalled();
    });
  });

  describe('updateCardQuantity', () => {
    it('should update card quantity', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn((field: string) => {
          if (field === 'scryfall_id') {
            return Promise.resolve({ error: null });
          }
          return mockChain;
        }) as any,
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await updateCardQuantity('deck-1', 'scry-bolt', 3);

      expect(mockSupabase.from).toHaveBeenCalledWith('deck_cards');
      expect(mockChain.update).toHaveBeenCalledWith({ quantity: 3 });
    });

    it('should remove card when quantity is 0', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn((field: string) => {
          if (field === 'scryfall_id') {
            return Promise.resolve({ error: null });
          }
          return mockChain;
        }) as any,
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await updateCardQuantity('deck-1', 'scry-bolt', 0);

      expect(mockSupabase.from).toHaveBeenCalledWith('deck_cards');
      expect(mockChain.delete).toHaveBeenCalled();
    });

    it('should remove card when quantity is negative', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn((field: string) => {
          if (field === 'scryfall_id') {
            return Promise.resolve({ error: null });
          }
          return mockChain;
        }) as any,
      };

      mockSupabase.from.mockReturnValue(mockChain);

      await updateCardQuantity('deck-1', 'scry-bolt', -1);

      expect(mockSupabase.from).toHaveBeenCalledWith('deck_cards');
      expect(mockChain.delete).toHaveBeenCalled();
    });
  });
});
