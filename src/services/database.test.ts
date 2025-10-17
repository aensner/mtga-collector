import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadCollection,
  saveCards,
  resetCollection,
  loadCalibrationSettings,
  saveCalibrationSettings,
} from './database';
import type { CardData, CalibrationSettings } from '../types';

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

describe('Database Service', () => {
  const mockUser = { id: 'test-user-123', email: 'test@example.com' };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Default: user is authenticated
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadCollection', () => {
    it('should load collection cards for authenticated user', async () => {
      const mockDbCards = [
        {
          id: 1,
          user_id: mockUser.id,
          card_name: 'Lightning Bolt',
          quantity: 4,
          scryfall_id: 'scry-123',
          scryfall_name: 'Lightning Bolt',
          set_code: 'M21',
          position_x: 1,
          position_y: 1,
          page_number: 1,
          confidence: 0.95,
          colors: ['R'],
          mana_cost: '{R}',
          cmc: 1,
          type_line: 'Instant',
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockDbCards,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await loadCollection();

      expect(mockSupabase.from).toHaveBeenCalledWith('collection_cards');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(result).toHaveLength(1);
      expect(result[0].kartenname).toBe('Lightning Bolt');
      expect(result[0].anzahl).toBe(4);
      expect(result[0].scryfallMatch?.id).toBe('scry-123');
    });

    it('should return empty array when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await loadCollection();

      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array on database error', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await loadCollection();

      expect(result).toEqual([]);
    });

    it('should convert database format to CardData format correctly', async () => {
      const mockDbCards = [
        {
          id: 1,
          user_id: mockUser.id,
          card_name: 'Black Lotus',
          quantity: 1,
          scryfall_id: 'scry-lotus',
          scryfall_name: 'Black Lotus',
          set_code: 'LEA',
          rarity: 'rare',
          collector_number: '4',
          position_x: 5,
          position_y: 2,
          page_number: 3,
          confidence: 0.98,
          colors: [],
          color_identity: [],
          mana_cost: '{0}',
          cmc: 0,
          type_line: 'Artifact',
          oracle_text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
          image_small: 'https://example.com/small.jpg',
          image_normal: 'https://example.com/normal.jpg',
          image_large: 'https://example.com/large.jpg',
          image_art_crop: 'https://example.com/art.jpg',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDbCards, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await loadCollection();

      expect(result[0]).toMatchObject({
        kartenname: 'Black Lotus',
        anzahl: 1,
        positionX: 5,
        positionY: 2,
        pageNumber: 3,
        confidence: 0.98,
        scryfallMatch: {
          id: 'scry-lotus',
          name: 'Black Lotus',
          set: 'LEA',
          rarity: 'rare',
          collector_number: '4',
          colors: [],
          mana_cost: '{0}',
          cmc: 0,
          type_line: 'Artifact',
          image_uris: {
            small: 'https://example.com/small.jpg',
            normal: 'https://example.com/normal.jpg',
            large: 'https://example.com/large.jpg',
            art_crop: 'https://example.com/art.jpg',
          },
        },
      });
    });
  });

  describe('saveCards', () => {
    it('should save cards to database for authenticated user', async () => {
      const cardsToSave: CardData[] = [
        {
          nummer: 1,
          positionX: 1,
          positionY: 1,
          kartenname: 'Counterspell',
          anzahl: 4,
          scryfallMatch: {
            id: 'scry-counter',
            name: 'Counterspell',
            set: 'M21',
            set_name: 'Core Set 2021',
            rarity: 'common',
            collector_number: '55',
            colors: ['U'],
            mana_cost: '{U}{U}',
            cmc: 2,
            type_line: 'Instant',
            image_uris: {
              small: '',
              normal: 'https://example.com/counter.jpg',
              large: '',
            },
          },
        },
      ];

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockCollectionFrom = vi.fn().mockReturnValue({
        upsert: mockUpsert,
      });

      const mockUserCollectionUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockUserCollectionFrom = vi.fn().mockReturnValue({
        upsert: mockUserCollectionUpsert,
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'collection_cards') {
          return mockCollectionFrom(table);
        } else if (table === 'user_collections') {
          return mockUserCollectionFrom(table);
        }
      });

      await saveCards(cardsToSave);

      expect(mockSupabase.from).toHaveBeenCalledWith('collection_cards');
      expect(mockUpsert).toHaveBeenCalled();

      // Verify card data conversion
      const savedData = mockUpsert.mock.calls[0][0][0];
      expect(savedData).toMatchObject({
        user_id: mockUser.id,
        card_name: 'Counterspell',
        quantity: 4,
        scryfall_id: 'scry-counter',
        mana_cost: '{U}{U}',
        cmc: 2,
      });

      // Verify user_collections timestamp was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('user_collections');
      expect(mockUserCollectionUpsert).toHaveBeenCalled();
    });

    it('should throw error when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const cardsToSave: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Test', anzahl: 1 },
      ];

      await expect(saveCards(cardsToSave)).rejects.toThrow('User not authenticated');
    });

    it('should handle database errors gracefully', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({
        error: { message: 'Constraint violation' },
      });

      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
      });

      const cardsToSave: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Test', anzahl: 1 },
      ];

      await expect(saveCards(cardsToSave)).rejects.toThrow();
    });
  });

  describe('resetCollection', () => {
    it('should delete all cards for authenticated user', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      });

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      await resetCollection();

      expect(mockSupabase.from).toHaveBeenCalledWith('collection_cards');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('should throw error when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(resetCollection()).rejects.toThrow('User not authenticated');
    });
  });

  describe('loadCalibrationSettings', () => {
    it('should load calibration settings for authenticated user', async () => {
      const mockDbSettings = {
        user_id: mockUser.id,
        start_x: 0.027,
        start_y: 0.193,
        grid_width: 0.945,
        grid_height: 0.788,
        card_gap_x: 0.008,
        card_gap_y: 0.036,
        ocr_left: 0.05,
        ocr_top: 0.043,
        ocr_width: 0.80,
        ocr_height: 0.075,
        quantity_offset_x: 0.28,
        quantity_offset_y: 0.08,
        quantity_width: 0.44,
        quantity_height: 0.07,
        brightness_threshold: 50,
        saturation_threshold: 10,
        fill_ratio_threshold: 0.05,
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbSettings, error: null }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await loadCalibrationSettings();

      expect(result).not.toBeNull();
      expect(result?.startX).toBe(0.027);
      expect(result?.gridWidth).toBe(0.945);
      expect(result?.brightnessThreshold).toBe(50);
    });

    it('should return null when no settings found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found error
        }),
      };

      mockSupabase.from.mockReturnValue(mockChain);

      const result = await loadCalibrationSettings();

      expect(result).toBeNull();
    });

    it('should return null when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await loadCalibrationSettings();

      expect(result).toBeNull();
    });
  });

  describe('saveCalibrationSettings', () => {
    it('should save calibration settings to database', async () => {
      const settingsToSave: CalibrationSettings = {
        startX: 0.03,
        startY: 0.20,
        gridWidth: 0.95,
        gridHeight: 0.80,
        cardGapX: 0.01,
        cardGapY: 0.04,
        ocrLeft: 0.06,
        ocrTop: 0.05,
        ocrWidth: 0.85,
        ocrHeight: 0.08,
        quantityOffsetX: 0.30,
        quantityOffsetY: 0.10,
        quantityWidth: 0.45,
        quantityHeight: 0.08,
        brightnessThreshold: 55,
        saturationThreshold: 12,
        fillRatioThreshold: 0.06,
      };

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from.mockReturnValue({
        upsert: mockUpsert,
      });

      await saveCalibrationSettings(settingsToSave);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_calibration_settings');
      expect(mockUpsert).toHaveBeenCalled();

      // Verify settings data conversion
      const savedData = mockUpsert.mock.calls[0][0];
      expect(savedData).toMatchObject({
        user_id: mockUser.id,
        start_x: 0.03,
        start_y: 0.20,
        brightness_threshold: 55,
      });
    });

    it('should throw error when no user is logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const settingsToSave: CalibrationSettings = {
        startX: 0.03,
        startY: 0.20,
        gridWidth: 0.95,
        gridHeight: 0.80,
        cardGapX: 0.01,
        cardGapY: 0.04,
        ocrLeft: 0.06,
        ocrTop: 0.05,
        ocrWidth: 0.85,
        ocrHeight: 0.08,
        quantityOffsetX: 0.30,
        quantityOffsetY: 0.10,
        quantityWidth: 0.45,
        quantityHeight: 0.08,
        brightnessThreshold: 55,
        saturationThreshold: 12,
        fillRatioThreshold: 0.06,
      };

      await expect(saveCalibrationSettings(settingsToSave)).rejects.toThrow(
        'User not authenticated'
      );
    });
  });
});
