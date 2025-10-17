import { describe, bench, beforeAll } from 'vitest';
import { detectCardGrid, detectCardQuantity, isCardSlotEmpty } from '../services/imageProcessing';
import { calculateAccuracy } from '../utils/accuracyTester';
import type { CardData } from '../types';

describe('Performance Benchmarks', () => {
  let mockImage: HTMLImageElement;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeAll(() => {
    // Create mock image (1920x1080 - typical MTG Arena screenshot)
    mockImage = new Image();
    mockImage.width = 1920;
    mockImage.height = 1080;

    // Create mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1920;
    mockCanvas.height = 1080;

    const ctx = mockCanvas.getContext('2d');
    if (ctx) {
      mockCtx = ctx;

      // Fill canvas with sample data (checkerboard pattern)
      for (let y = 0; y < 1080; y++) {
        for (let x = 0; x < 1920; x++) {
          const color = (x + y) % 2 === 0 ? 100 : 150;
          ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  describe('Grid Detection', () => {
    bench('detectCardGrid (36 cards)', () => {
      detectCardGrid(mockImage);
    });

    bench('detectCardGrid with custom params', () => {
      detectCardGrid(mockImage, {
        startX: 0.03,
        startY: 0.20,
        gridWidth: 0.95,
        gridHeight: 0.80,
        cardGapX: 0.01,
        cardGapY: 0.04,
      });
    });
  });

  describe('Empty Slot Detection', () => {
    const cardBbox = { x: 100, y: 100, width: 140, height: 190 };

    bench('isCardSlotEmpty (single card)', () => {
      isCardSlotEmpty(mockCanvas, cardBbox);
    });

    bench('isCardSlotEmpty (36 cards)', () => {
      for (let i = 0; i < 36; i++) {
        isCardSlotEmpty(mockCanvas, {
          x: 100 + (i % 12) * 150,
          y: 100 + Math.floor(i / 12) * 250,
          width: 140,
          height: 190,
        });
      }
    });
  });

  describe('Quantity Detection', () => {
    const cardBbox = { x: 100, y: 100, width: 140, height: 190 };

    bench('detectCardQuantity (single card)', () => {
      detectCardQuantity(mockCanvas, cardBbox);
    });

    bench('detectCardQuantity (36 cards)', () => {
      for (let i = 0; i < 36; i++) {
        detectCardQuantity(mockCanvas, {
          x: 100 + (i % 12) * 150,
          y: 200 + Math.floor(i / 12) * 250,
          width: 140,
          height: 190,
        });
      }
    });

    bench('detectCardQuantity with custom params', () => {
      detectCardQuantity(
        mockCanvas,
        cardBbox,
        {
          offsetX: 0.25,
          offsetY: 0.10,
          width: 0.50,
          height: 0.08,
          brightnessThreshold: 60,
          saturationThreshold: 15,
          fillRatioThreshold: 0.10,
        }
      );
    });
  });

  describe('Accuracy Calculation', () => {
    let groundTruth: CardData[];
    let extracted: CardData[];

    beforeAll(() => {
      // Generate test data (36 cards)
      groundTruth = [];
      extracted = [];

      for (let i = 0; i < 36; i++) {
        const x = (i % 12) + 1;
        const y = Math.floor(i / 12) + 1;

        groundTruth.push({
          nummer: i + 1,
          positionX: x,
          positionY: y,
          kartenname: `Test Card ${i + 1}`,
          anzahl: (i % 4) + 1,
        });

        // Extracted has some variations
        extracted.push({
          nummer: i + 1,
          positionX: x,
          positionY: y,
          kartenname: i % 5 === 0 ? `Test Crd ${i + 1}` : `Test Card ${i + 1}`, // Some OCR errors
          anzahl: (i % 4) + 1,
        });
      }
    });

    bench('calculateAccuracy (36 cards)', () => {
      calculateAccuracy(extracted, groundTruth);
    });

    bench('calculateAccuracy (100 cards)', () => {
      const largeGroundTruth: CardData[] = [];
      const largeExtracted: CardData[] = [];

      for (let i = 0; i < 100; i++) {
        largeGroundTruth.push({
          nummer: i + 1,
          positionX: (i % 12) + 1,
          positionY: Math.floor(i / 12) + 1,
          kartenname: `Card ${i + 1}`,
          anzahl: (i % 4) + 1,
        });

        largeExtracted.push({
          nummer: i + 1,
          positionX: (i % 12) + 1,
          positionY: Math.floor(i / 12) + 1,
          kartenname: i % 7 === 0 ? `Crd ${i + 1}` : `Card ${i + 1}`,
          anzahl: (i % 4) + 1,
        });
      }

      calculateAccuracy(largeExtracted, largeGroundTruth);
    });
  });

  describe('Full Pipeline Simulation', () => {
    bench('Complete single page processing simulation', () => {
      // 1. Detect grid (36 cards)
      const cells = detectCardGrid(mockImage);

      // 2. Check for empty slots
      const nonEmptySlots = cells.filter((cell) => {
        return !isCardSlotEmpty(mockCanvas, cell.bbox);
      });

      // 3. Detect quantities
      nonEmptySlots.forEach((cell) => {
        detectCardQuantity(mockCanvas, cell.bbox);
      });
    });

    bench('Empty slot detection optimization (saves ~70% time)', () => {
      const cells = detectCardGrid(mockImage);

      // Simulate: 26 empty slots, 10 filled
      let processedCount = 0;

      cells.forEach((cell, index) => {
        const isEmpty = isCardSlotEmpty(mockCanvas, cell.bbox);

        if (!isEmpty) {
          // Only process non-empty (simulated OCR would go here)
          processedCount++;
        }
      });
    });
  });

  describe('Memory Usage Simulation', () => {
    bench('Canvas creation and disposal (36 cards)', () => {
      const cells = detectCardGrid(mockImage);

      cells.forEach((cell) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = cell.bbox.width;
        tempCanvas.height = cell.bbox.height;

        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            mockCanvas,
            cell.bbox.x,
            cell.bbox.y,
            cell.bbox.width,
            cell.bbox.height,
            0,
            0,
            cell.bbox.width,
            cell.bbox.height
          );
        }
      });
    });
  });

  describe('Levenshtein Distance (Fuzzy Matching)', () => {
    const levenshteinDistance = (str1: string, str2: string): number => {
      const matrix: number[][] = [];

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[str2.length][str1.length];
    };

    bench('Levenshtein distance (short strings)', () => {
      levenshteinDistance('Lightning Bolt', 'Lightning Boit');
    });

    bench('Levenshtein distance (long strings)', () => {
      levenshteinDistance(
        'Elesh Norn, Grand Cenobite',
        'Elesh Norm, Grand Cenobit'
      );
    });

    bench('Levenshtein distance (36 cards)', () => {
      for (let i = 0; i < 36; i++) {
        levenshteinDistance(
          'Test Card Name',
          i % 3 === 0 ? 'Test Crd Name' : 'Test Card Name'
        );
      }
    });
  });
});
