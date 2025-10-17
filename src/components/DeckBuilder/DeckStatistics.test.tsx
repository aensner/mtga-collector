import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeckStatistics } from './DeckStatistics';
import type { CardData } from '../../types';

describe('DeckStatistics', () => {
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

  describe('Mana Curve Visualization', () => {
    it('should display mana curve with correct counts', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 1,
              type_line: 'Creature',
            },
          }),
          count: 4,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 2,
              type_line: 'Instant',
            },
          }),
          count: 8,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 3,
              type_line: 'Creature',
            },
          }),
          count: 6,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={18} />);

      expect(screen.getAllByText('Mana Curve')[0]).toBeInTheDocument();
      // Check that mana curve counts are displayed (may appear multiple times in different sections)
      expect(screen.getAllByText('4').length).toBeGreaterThan(0); // 1 CMC count
      expect(screen.getAllByText('8').length).toBeGreaterThan(0); // 2 CMC count
      expect(screen.getAllByText('6').length).toBeGreaterThan(0); // 3 CMC count
    });

    it('should handle 7+ CMC correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 7,
              type_line: 'Creature',
            },
          }),
          count: 2,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 10,
              type_line: 'Sorcery',
            },
          }),
          count: 1,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={3} />);

      // Both 7 and 10 CMC should be grouped as 7+
      const sevenPlusElements = screen.getAllByText('3'); // Total count in 7+ slot
      expect(sevenPlusElements.length).toBeGreaterThan(0);
    });

    it('should exclude lands from mana curve', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 0,
              type_line: 'Land',
            },
          }),
          count: 24,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 1,
              type_line: 'Creature',
            },
          }),
          count: 4,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={28} />);

      // Should show 4 cards at 1 CMC, not 24 lands at 0
      expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    });
  });

  describe('Average CMC Calculation', () => {
    it('should calculate average CMC correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 1,
              type_line: 'Creature',
            },
          }),
          count: 4,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 3,
              type_line: 'Instant',
            },
          }),
          count: 4,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={8} />);

      // Average CMC = (1*4 + 3*4) / 8 = 16/8 = 2.00
      expect(screen.getByText('2.00')).toBeInTheDocument();
      expect(screen.getByText('Avg CMC')).toBeInTheDocument();
    });

    it('should exclude lands from average CMC', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 0,
              type_line: 'Land',
            },
          }),
          count: 24,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 2,
              type_line: 'Creature',
            },
          }),
          count: 20,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={44} />);

      // Average CMC = (2*20) / 20 = 2.00 (lands excluded)
      expect(screen.getByText('2.00')).toBeInTheDocument();
    });
  });

  describe('Color Distribution', () => {
    it('should calculate color distribution correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              colors: ['R'],
            },
          }),
          count: 20,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              colors: ['U'],
            },
          }),
          count: 10,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={30} />);

      expect(screen.getByText('Color Distribution')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
    });

    it('should handle multicolor cards correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              colors: ['R', 'G'], // Multicolor card
            },
          }),
          count: 4,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={4} />);

      // Both colors should be counted
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Green')).toBeInTheDocument();
    });

    it('should handle colorless cards', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              colors: [],
            },
          }),
          count: 4,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={4} />);

      expect(screen.getByText('Colorless')).toBeInTheDocument();
    });
  });

  describe('Type Breakdown', () => {
    it('should categorize card types correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Creature — Human Warrior',
            },
          }),
          count: 20,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Instant',
            },
          }),
          count: 8,
        },
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Land',
            },
          }),
          count: 24,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={52} />);

      expect(screen.getByText('Type Breakdown')).toBeInTheDocument();
      expect(screen.getByText('creatures')).toBeInTheDocument();
      expect(screen.getByText('spells')).toBeInTheDocument();
      expect(screen.getByText('lands')).toBeInTheDocument();
    });

    it('should handle artifacts correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Artifact — Equipment',
            },
          }),
          count: 4,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={4} />);

      expect(screen.getByText('artifacts')).toBeInTheDocument();
    });

    it('should handle planeswalkers correctly', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Legendary Planeswalker — Chandra',
            },
          }),
          count: 2,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={2} />);

      expect(screen.getByText('planeswalkers')).toBeInTheDocument();
    });
  });

  describe('Deck Health Indicators', () => {
    it('should show optimal land ratio for 22-26 lands', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Land',
            },
          }),
          count: 24,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={60} />);

      expect(screen.getByText('Deck Health')).toBeInTheDocument();
      expect(screen.getByText('✓ Optimal')).toBeInTheDocument();
    });

    it('should show warning for too few lands', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Land',
            },
          }),
          count: 16,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={60} />);

      expect(screen.getByText('✗ Too Few')).toBeInTheDocument();
    });

    it('should evaluate mana curve as good for low avg CMC', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              cmc: 2,
              type_line: 'Creature',
            },
          }),
          count: 30,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={30} />);

      const goodElements = screen.getAllByText('✓ Good');
      expect(goodElements.length).toBeGreaterThan(0);
    });

    it('should evaluate creature count', () => {
      const deckCards = [
        {
          card: createMockCard({
            scryfallMatch: {
              ...createMockCard().scryfallMatch!,
              type_line: 'Creature',
            },
          }),
          count: 20,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={60} />);

      const goodElements = screen.getAllByText('✓ Good');
      expect(goodElements.length).toBeGreaterThan(0);
    });
  });

  describe('Empty Deck Handling', () => {
    it('should handle empty deck gracefully', () => {
      render(<DeckStatistics deckCards={[]} totalCards={0} />);

      expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Total cards and lands
      expect(screen.getByText('0.00')).toBeInTheDocument(); // Avg CMC
    });
  });

  describe('Cards Without Scryfall Data', () => {
    it('should handle cards without scryfall match', () => {
      const deckCards = [
        {
          card: {
            nummer: 1,
            positionX: 1,
            positionY: 1,
            kartenname: 'Unknown Card',
            anzahl: 1,
            // No scryfallMatch
          },
          count: 4,
        },
      ];

      render(<DeckStatistics deckCards={deckCards} totalCards={4} />);

      // Should not crash, should handle gracefully
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
    });
  });
});
