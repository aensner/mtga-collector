import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeckOptimization } from './DeckOptimization';
import type { CardData } from '../../types';
import * as deckOptimizationService from '../../services/deckOptimization';

// Mock the deck optimization service
vi.mock('../../services/deckOptimization', () => ({
  analyzeDeck: vi.fn(),
  findSubstitutes: vi.fn(),
}));

describe('DeckOptimization', () => {
  const createMockCard = (overrides: Partial<CardData> = {}): CardData => ({
    nummer: 1,
    positionX: 1,
    positionY: 1,
    kartenname: 'Test Card',
    anzahl: 1,
    scryfallMatch: {
      id: 'test-id',
      name: 'Test Card',
      set: 'TST',
      set_name: 'Test Set',
      rarity: 'common',
      collector_number: '1',
      colors: ['R'],
      mana_cost: '{R}',
      cmc: 1,
      type_line: 'Creature',
      image_uris: { small: '', normal: '', large: '' },
    },
    ...overrides,
  });

  const mockDeckCards = [
    { card: createMockCard({ scryfallMatch: { ...createMockCard().scryfallMatch!, name: 'Lightning Bolt' } }), count: 4 },
    { card: createMockCard({ scryfallMatch: { ...createMockCard().scryfallMatch!, name: 'Mountain' } }), count: 20 },
  ];

  const mockAvailableCards = [
    createMockCard({ scryfallMatch: { ...createMockCard().scryfallMatch!, name: 'Shock' } }),
    createMockCard({ scryfallMatch: { ...createMockCard().scryfallMatch!, name: 'Embercleave' } }),
  ];

  const mockAnalysisResult = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the optimization panel with controls', () => {
      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      expect(screen.getByText('AI Deck Optimization')).toBeInTheDocument();
      expect(screen.getByText('Format:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analyze Deck/i })).toBeInTheDocument();
    });

    it('should show empty state when no deck cards', () => {
      render(<DeckOptimization deckCards={[]} availableCards={mockAvailableCards} />);

      expect(screen.getByText('Add cards to your deck to get started')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analyze Deck/i })).toBeDisabled();
    });

    it('should render format selector with options', () => {
      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5);
      expect(screen.getByRole('option', { name: 'Standard' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Historic' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Explorer' })).toBeInTheDocument();
    });
  });

  describe('Deck Analysis', () => {
    it('should call analyzeDeck when Analyze button is clicked', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(deckOptimizationService.analyzeDeck).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Lightning Bolt', count: 4 }),
            expect.objectContaining({ name: 'Mountain', count: 20 }),
          ]),
          expect.any(Array),
          'Standard'
        );
      });
    });

    it('should display loading state during analysis', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAnalysisResult), 100))
      );

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
      expect(analyzeButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
      });
    });

    it('should display analysis results after successful analysis', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('Aggro')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText('80/100')).toBeInTheDocument();
        expect(screen.getByText('92% confidence')).toBeInTheDocument();
      });
    });

    it('should display error message on analysis failure', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockRejectedValueOnce(
        new Error('API Credits Low')
      );

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('API Credits Low')).toBeInTheDocument();
      });
    });

    it('should use selected format in analysis', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Historic' } });

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(deckOptimizationService.analyzeDeck).toHaveBeenCalledWith(
          expect.any(Array),
          expect.any(Array),
          'Historic'
        );
      });
    });
  });

  describe('Strengths and Weaknesses Display', () => {
    it('should display all strengths', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('Fast mana curve')).toBeInTheDocument();
        expect(screen.getByText('High creature density')).toBeInTheDocument();
        expect(screen.getByText('Good removal')).toBeInTheDocument();
      });
    });

    it('should display all weaknesses', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('No card draw')).toBeInTheDocument();
        expect(screen.getByText('Weak to board wipes')).toBeInTheDocument();
      });
    });
  });

  describe('Suggested Changes', () => {
    it('should display cards to add with ownership status', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('2x Embercleave')).toBeInTheDocument();
        expect(screen.getByText('Owned: 1')).toBeInTheDocument();
        expect(screen.getByText('Increases win rate against control')).toBeInTheDocument();
        expect(screen.getByText('Impact: +8% win rate')).toBeInTheDocument();
      });
    });

    it('should display cards to remove', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('2x Phoenix of Ash')).toBeInTheDocument();
        expect(screen.getByText('Too slow for aggro plan')).toBeInTheDocument();
      });
    });

    it('should show optimized message when no changes recommended', async () => {
      const optimizedResult = {
        ...mockAnalysisResult,
        suggestedChanges: { add: [], remove: [] }
      };

      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(optimizedResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('🎯 Deck looks optimized!')).toBeInTheDocument();
        expect(screen.getByText('No major changes recommended at this time.')).toBeInTheDocument();
      });
    });

    it('should disable Apply button for unowned cards', async () => {
      const resultWithUnownedCard = {
        ...mockAnalysisResult,
        suggestedChanges: {
          add: [
            {
              cardName: 'Rare Card',
              count: 2,
              reason: 'Powerful effect',
              impactEstimate: '+5% win rate',
              owned: 0
            }
          ],
          remove: []
        }
      };

      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(resultWithUnownedCard);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('Not Owned')).toBeInTheDocument();
        const applyButtons = screen.getAllByRole('button', { name: /Apply/i });
        expect(applyButtons[0]).toBeDisabled();
      });
    });
  });

  describe('Apply Changes', () => {
    it('should call onApplyChange when Add button is clicked', async () => {
      const onApplyChange = vi.fn();
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(
        <DeckOptimization
          deckCards={mockDeckCards}
          availableCards={mockAvailableCards}
          onApplyChange={onApplyChange}
        />
      );

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('2x Embercleave')).toBeInTheDocument();
      });

      const applyButtons = screen.getAllByRole('button', { name: /Apply/i });
      fireEvent.click(applyButtons[0]);

      expect(onApplyChange).toHaveBeenCalledWith({
        type: 'add',
        cardName: 'Embercleave',
        count: 2
      });
    });

    it('should call onApplyChange when Remove button is clicked', async () => {
      const onApplyChange = vi.fn();
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(
        <DeckOptimization
          deckCards={mockDeckCards}
          availableCards={mockAvailableCards}
          onApplyChange={onApplyChange}
        />
      );

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('2x Phoenix of Ash')).toBeInTheDocument();
      });

      const applyButtons = screen.getAllByRole('button', { name: /Apply/i });
      fireEvent.click(applyButtons[1]); // Second Apply button is for remove

      expect(onApplyChange).toHaveBeenCalledWith({
        type: 'remove',
        cardName: 'Phoenix of Ash',
        count: 2
      });
    });
  });

  describe('Data Format Conversion', () => {
    it('should convert CardData to DeckCard format correctly', async () => {
      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={mockDeckCards} availableCards={mockAvailableCards} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(deckOptimizationService.analyzeDeck).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Lightning Bolt',
              count: 4,
              type: 'Creature',
              cmc: 1,
              colors: ['R'],
              owned: 4
            })
          ]),
          expect.any(Array),
          expect.any(String)
        );
      });
    });

    it('should handle cards without scryfall match', async () => {
      const cardsWithoutMatch = [
        {
          card: {
            nummer: 1,
            positionX: 1,
            positionY: 1,
            kartenname: 'Unknown Card',
            anzahl: 1,
          },
          count: 1
        }
      ];

      vi.mocked(deckOptimizationService.analyzeDeck).mockResolvedValueOnce(mockAnalysisResult);

      render(<DeckOptimization deckCards={cardsWithoutMatch} availableCards={[]} />);

      const analyzeButton = screen.getByRole('button', { name: /Analyze Deck/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(deckOptimizationService.analyzeDeck).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Unknown Card',
              count: 1
            })
          ]),
          expect.any(Array),
          expect.any(String)
        );
      });
    });
  });
});
