import { describe, it, expect } from 'vitest';
import { calculateAccuracy } from './accuracyTester';
import type { CardData } from '../types';

describe('OCR Accuracy Testing', () => {
  const groundTruth: CardData[] = [
    { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Lightning Bolt', anzahl: 4 },
    { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
    { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
    { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
    { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
  ];

  describe('calculateAccuracy', () => {
    it('should return 100% accuracy for perfect matches', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Lightning Bolt', anzahl: 4 },
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.exactNameMatches).toBe(5);
      expect(result.quantityMatches).toBe(5);
      expect(result.nameAccuracy).toBe(100);
      expect(result.quantityAccuracy).toBe(100);
      expect(result.overallAccuracy).toBe(100);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect OCR typos with fuzzy matching', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Lightning Boit', anzahl: 4 }, // OCR typo
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.exactNameMatches).toBe(4);
      expect(result.fuzzyNameMatches).toBe(1); // Lightning Boit → Lightning Bolt
      expect(result.nameAccuracy).toBe(100); // Still 100% with fuzzy match
      expect(result.quantityMatches).toBe(5);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect quantity mismatches', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Lightning Bolt', anzahl: 3 }, // Wrong quantity
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.exactNameMatches).toBe(5);
      expect(result.quantityMatches).toBe(4);
      expect(result.quantityAccuracy).toBe(80); // 4/5 = 80%
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        expected: 'Quantity: 4',
        actual: 'Quantity: 3',
        position: { x: 1, y: 1 },
      });
    });

    it('should detect completely wrong card names', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Wrong Card Name', anzahl: 4 },
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.exactNameMatches).toBe(4);
      expect(result.fuzzyNameMatches).toBe(0);
      expect(result.nameAccuracy).toBe(80); // 4/5 = 80%
      expect(result.errors.length).toBeGreaterThan(0);

      const nameError = result.errors.find((e) => e.expected === 'Lightning Bolt');
      expect(nameError).toBeDefined();
      expect(nameError?.actual).toBe('wrong card name');
    });

    it('should handle missing cards at positions', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Lightning Bolt', anzahl: 4 },
        // Missing card at position (2, 1)
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.totalCards).toBe(5);
      expect(result.exactNameMatches).toBe(4);
      expect(result.nameAccuracy).toBe(80);
    });

    it('should handle extra cards at wrong positions', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'Lightning Bolt', anzahl: 4 },
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
        { nummer: 6, positionX: 6, positionY: 1, kartenname: 'Extra Card', anzahl: 1 }, // Not in ground truth
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      // Extra card at position (6,1) should generate 2 errors:
      // 1. Name error: expected N/A, actual 'extra card'
      // 2. Quantity error: expected N/A, actual quantity
      expect(result.errors.length).toBeGreaterThan(0);

      const extraCardError = result.errors.find((e) =>
        e.position.x === 6 && e.position.y === 1 && e.expected === 'N/A'
      );
      expect(extraCardError).toBeDefined();
      expect(extraCardError?.actual.toLowerCase()).toBe('extra card');
    });

    it('should use correctedName over kartenname if available', () => {
      const extracted: CardData[] = [
        {
          nummer: 1,
          positionX: 1,
          positionY: 1,
          kartenname: 'Lightning Boit', // OCR result
          correctedName: 'Lightning Bolt', // AI corrected
          anzahl: 4,
        },
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'Counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'Black Lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'Ancestral Recall', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.exactNameMatches).toBe(5); // AI correction should result in exact match
      expect(result.nameAccuracy).toBe(100);
    });

    it('should be case-insensitive', () => {
      const extracted: CardData[] = [
        { nummer: 1, positionX: 1, positionY: 1, kartenname: 'LIGHTNING BOLT', anzahl: 4 },
        { nummer: 2, positionX: 2, positionY: 1, kartenname: 'counterspell', anzahl: 2 },
        { nummer: 3, positionX: 3, positionY: 1, kartenname: 'Llanowar Elves', anzahl: 4 },
        { nummer: 4, positionX: 4, positionY: 1, kartenname: 'black lotus', anzahl: 1 },
        { nummer: 5, positionX: 5, positionY: 1, kartenname: 'ANCESTRAL RECALL', anzahl: 1 },
      ];

      const result = calculateAccuracy(extracted, groundTruth);

      expect(result.exactNameMatches).toBe(5);
      expect(result.nameAccuracy).toBe(100);
    });
  });
});
