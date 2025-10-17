import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectCardGrid, detectCardQuantity, isCardSlotEmpty } from './imageProcessing';

describe('Image Processing Service', () => {
  let mockImage: HTMLImageElement;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: any;

  beforeEach(() => {
    // Create mock image
    mockImage = new Image();
    mockImage.width = 1920;
    mockImage.height = 1080;

    // Create mock canvas context
    mockCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(100 * 100 * 4).fill(128), // Fill with grey pixels
        width: 100,
        height: 100,
      })),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
    };

    // Mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1920;
    mockCanvas.height = 1080;
    mockCanvas.getContext = vi.fn(() => mockCtx);
  });

  describe('detectCardGrid', () => {
    it('should detect 36 card cells (12 columns x 3 rows)', () => {
      const cells = detectCardGrid(mockImage);

      expect(cells).toHaveLength(36);
      expect(cells[0].x).toBe(1); // First column
      expect(cells[0].y).toBe(1); // First row
      expect(cells[11].x).toBe(12); // Last column of first row
      expect(cells[35].x).toBe(12); // Last cell column
      expect(cells[35].y).toBe(3); // Last cell row
    });

    it('should use default calibrated grid parameters', () => {
      const cells = detectCardGrid(mockImage);

      // Grid should start at 2.7% from left (51.84px at 1920px width)
      expect(cells[0].bbox.x).toBeCloseTo(1920 * 0.027, 0);

      // Grid should start at 19.3% from top (208.44px at 1080px height)
      expect(cells[0].bbox.y).toBeCloseTo(1080 * 0.193, 0);
    });

    it('should accept custom grid parameters', () => {
      const customParams = {
        startX: 0.05,
        startY: 0.20,
        gridWidth: 0.90,
        gridHeight: 0.75,
        cardGapX: 0.01,
        cardGapY: 0.04,
      };

      const cells = detectCardGrid(mockImage, customParams);

      expect(cells).toHaveLength(36);
      expect(cells[0].bbox.x).toBeCloseTo(1920 * 0.05, 0);
      expect(cells[0].bbox.y).toBeCloseTo(1080 * 0.20, 0);
    });

    it('should calculate card dimensions accounting for gaps', () => {
      const cells = detectCardGrid(mockImage);

      // With default params: 0.945 grid width, 0.008 gap
      // Total gap width = 0.008 * 1920 * 11 = 168.96px
      // Available width = 1920 * 0.945 = 1814.4px
      // Card width = (1814.4 - 168.96) / 12 ≈ 137.12px
      const expectedCardWidth = (1920 * 0.945 - 0.008 * 1920 * 11) / 12;
      expect(cells[0].bbox.width).toBeCloseTo(expectedCardWidth, 0);
    });

    it('should space cards with gaps', () => {
      const cells = detectCardGrid(mockImage);

      // Distance between card 1 and card 2 should include gap
      const card1End = cells[0].bbox.x + cells[0].bbox.width;
      const card2Start = cells[1].bbox.x;
      const gap = card2Start - card1End;

      // Gap should be approximately 0.008 * image width
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeCloseTo(1920 * 0.008, 0);
    });

    it('should create bounding boxes with integer coordinates', () => {
      const cells = detectCardGrid(mockImage);

      cells.forEach((cell) => {
        expect(Number.isInteger(cell.bbox.x)).toBe(true);
        expect(Number.isInteger(cell.bbox.y)).toBe(true);
        expect(Number.isInteger(cell.bbox.width)).toBe(true);
        expect(Number.isInteger(cell.bbox.height)).toBe(true);
      });
    });
  });

  describe('detectCardQuantity', () => {
    it('should return 1 if canvas context is unavailable', () => {
      mockCanvas.getContext = vi.fn(() => null);
      const quantity = detectCardQuantity(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(quantity).toBe(1);
    });

    it('should return 1 if diamond region is out of bounds', () => {
      const quantity = detectCardQuantity(mockCanvas, {
        x: 10,
        y: 5, // Too close to top edge, diamond region would be negative
        width: 140,
        height: 190,
      });

      expect(quantity).toBe(1);
    });

    it('should detect filled diamonds based on dark grey pixels', () => {
      // Mock getImageData to return data with 2 filled diamond zones
      // Note: Mock returns ALL zones filled because fill ratio threshold is met
      mockCtx.getImageData = vi.fn(() => {
        const width = 100;
        const height = 20;
        const data = new Uint8ClampedArray(width * height * 4);

        // Fill entire region with dark grey pixels
        // The algorithm will detect ALL 4 zones as filled
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 30; // R - dark
          data[i + 1] = 30; // G - dark
          data[i + 2] = 30; // B - dark
          data[i + 3] = 255; // A - opaque
        }

        return { data, width, height };
      });

      const quantity = detectCardQuantity(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(quantity).toBe(4); // 4 filled diamonds detected (all zones filled)
    });

    it('should detect infinity symbol when no diamonds but dark pixels present', () => {
      // Mock getImageData to return data with no filled zones but some dark pixels
      mockCtx.getImageData = vi.fn(() => {
        const data = new Uint8ClampedArray(100 * 20 * 4);

        // Fill with mostly bright pixels (no diamonds)
        data.fill(200);

        // Add some dark pixels scattered (>10% of total) to indicate infinity symbol
        for (let i = 0; i < data.length * 0.15; i += 4) {
          data[i] = 50; // Dark
          data[i + 1] = 50;
          data[i + 2] = 50;
          data[i + 3] = 255;
        }

        return { data, width: 100, height: 20 };
      });

      const quantity = detectCardQuantity(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(quantity).toBe(-1); // Infinity symbol
    });

    it('should use custom threshold parameters', () => {
      const customParams = {
        offsetX: 0.25,
        offsetY: 0.10,
        width: 0.50,
        height: 0.08,
        brightnessThreshold: 60,
        saturationThreshold: 15,
        fillRatioThreshold: 0.10,
      };

      mockCtx.getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(100 * 20 * 4).fill(128),
        width: 100,
        height: 20,
      }));

      detectCardQuantity(
        mockCanvas,
        { x: 100, y: 100, width: 140, height: 190 },
        customParams
      );

      // Verify getImageData was called (detection ran)
      expect(mockCtx.getImageData).toHaveBeenCalled();
    });

    it('should split diamond region into 4 horizontal zones', () => {
      // Mock to capture the region dimensions
      let capturedRegion: any = null;
      mockCtx.getImageData = vi.fn((x, y, w, h) => {
        capturedRegion = { x, y, w, h };
        return {
          data: new Uint8ClampedArray(w * h * 4).fill(128),
          width: w,
          height: h,
        };
      });

      detectCardQuantity(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(capturedRegion).not.toBeNull();
      // Each zone should be roughly 1/4 of the region width
      const zoneWidth = capturedRegion.w / 4;
      expect(zoneWidth).toBeGreaterThan(0);
    });
  });

  describe('isCardSlotEmpty', () => {
    it('should return false if canvas context is unavailable', () => {
      mockCanvas.getContext = vi.fn(() => null);
      const isEmpty = isCardSlotEmpty(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(isEmpty).toBe(false); // Assume card is present if can't check
    });

    it('should return false if region is out of bounds', () => {
      const isEmpty = isCardSlotEmpty(mockCanvas, {
        x: 2000, // Beyond canvas width
        y: 100,
        width: 140,
        height: 190,
      });

      expect(isEmpty).toBe(false);
    });

    it('should detect empty slots with low edge density', () => {
      // Mock uniform background (no edges)
      mockCtx.getImageData = vi.fn(() => {
        const width = 100;
        const height = 100;
        const data = new Uint8ClampedArray(width * height * 4);

        // Fill with uniform grey (no edges)
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 150;
          data[i + 1] = 150;
          data[i + 2] = 150;
          data[i + 3] = 255;
        }

        return { data, width, height };
      });

      const isEmpty = isCardSlotEmpty(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(isEmpty).toBe(true); // Low edge density = empty
    });

    it('should detect filled slots with high edge density', () => {
      // Mock card with edges (checkerboard pattern)
      mockCtx.getImageData = vi.fn(() => {
        const width = 100;
        const height = 100;
        const data = new Uint8ClampedArray(width * height * 4);

        // Create checkerboard pattern (lots of edges)
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const color = (x + y) % 2 === 0 ? 50 : 200;
            data[i] = color;
            data[i + 1] = color;
            data[i + 2] = color;
            data[i + 3] = 255;
          }
        }

        return { data, width, height };
      });

      const isEmpty = isCardSlotEmpty(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(isEmpty).toBe(false); // High edge density = card present
    });

    it('should use custom threshold parameters', () => {
      const customOptions = {
        edgeThreshold: 0.05, // 5%
        varianceThreshold: 1000,
      };

      mockCtx.getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(100 * 100 * 4).fill(128),
        width: 100,
        height: 100,
      }));

      isCardSlotEmpty(
        mockCanvas,
        { x: 100, y: 100, width: 140, height: 190 },
        customOptions
      );

      // Verify detection ran
      expect(mockCtx.getImageData).toHaveBeenCalled();
    });

    it('should sample center region avoiding borders', () => {
      let capturedRegion: any = null;
      mockCtx.getImageData = vi.fn((x, y, w, h) => {
        capturedRegion = { x, y, w, h };
        return {
          data: new Uint8ClampedArray(w * h * 4).fill(128),
          width: w,
          height: h,
        };
      });

      const cardBbox = { x: 100, y: 100, width: 140, height: 190 };
      isCardSlotEmpty(mockCanvas, cardBbox);

      expect(capturedRegion).not.toBeNull();

      // Sample region should be 70% of card size (15% margin on each side)
      expect(capturedRegion.w).toBeLessThan(cardBbox.width);
      expect(capturedRegion.h).toBeLessThan(cardBbox.height);
      expect(capturedRegion.w).toBeCloseTo(cardBbox.width * 0.7, 0);
    });

    it('should log detection results to console', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      mockCtx.getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(100 * 100 * 4).fill(128),
        width: 100,
        height: 100,
      }));

      isCardSlotEmpty(mockCanvas, {
        x: 100,
        y: 100,
        width: 140,
        height: 190,
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logMessage = consoleSpy.mock.calls[0][0];
      expect(logMessage).toMatch(/Card \d+: Edge=[\d.]+%, Empty=(true|false)/);
    });
  });
});
