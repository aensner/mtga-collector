import type { GridCell } from '../types';

/**
 * Detects the card grid in an MTG Arena collection screenshot
 * Cards are arranged in a 12-column grid
 */
export const detectCardGrid = (
  image: HTMLImageElement,
  gridParams?: {
    startX: number;
    startY: number;
    gridWidth: number;
    gridHeight: number;
    cardGapX: number;
    cardGapY: number;
  }
): GridCell[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  // MTG Arena UI constants (these may need adjustment)
  const COLUMNS = 12;
  const ROWS = 3;
  const params = gridParams || {
    startX: 0.027,
    startY: 0.193,
    gridWidth: 0.945,
    gridHeight: 0.788,
    cardGapX: 0.008,
    cardGapY: 0.036,
  };

  const GRID_START_X = image.width * params.startX;
  const GRID_START_Y = image.height * params.startY;
  const GRID_WIDTH = image.width * params.gridWidth;
  const GRID_HEIGHT = image.height * params.gridHeight;

  // Calculate individual card dimensions accounting for gaps
  const totalGapX = params.cardGapX * image.width * (COLUMNS - 1);
  const totalGapY = params.cardGapY * image.height * (ROWS - 1);
  const cardWidth = (GRID_WIDTH - totalGapX) / COLUMNS;
  const cardHeight = (GRID_HEIGHT - totalGapY) / ROWS;

  const cells: GridCell[] = [];

  // Grid is read from bottom-left to top-right based on CSV data
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const x = GRID_START_X + col * (cardWidth + params.cardGapX * image.width);
      const y = GRID_START_Y + row * (cardHeight + params.cardGapY * image.height);

      cells.push({
        x: col + 1, // 1-indexed
        y: row + 1, // 1-indexed (1 is bottom row in CSV)
        bbox: {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(cardWidth),
          height: Math.round(cardHeight),
        },
      });
    }
  }

  return cells;
};

/**
 * Detects the quantity of a card by counting filled diamonds above it
 * Diamonds are typically white/filled vs outlined
 */
export const detectCardQuantity = (
  canvas: HTMLCanvasElement,
  cardBbox: { x: number; y: number; width: number; height: number },
  params?: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    brightnessThreshold: number;
    saturationThreshold: number;
    fillRatioThreshold: number;
  }
): number => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return 1; // Default to 1 if detection fails
  }

  // Use provided params or calibrated defaults
  const p = params || {
    offsetX: 0.28,
    offsetY: 0.08,
    width: 0.44,
    height: 0.07,
    brightnessThreshold: 50,
    saturationThreshold: 10,
    fillRatioThreshold: 0.05,
  };

  // Diamonds are located above the card, centered horizontally
  const diamondRegion = {
    x: cardBbox.x + cardBbox.width * p.offsetX,
    y: cardBbox.y - cardBbox.height * p.offsetY, // Slightly above card
    width: cardBbox.width * p.width,
    height: cardBbox.height * p.height,
  };

  // Ensure region is within canvas bounds
  if (diamondRegion.y < 0 || diamondRegion.x < 0) {
    return 1;
  }

  const imageData = ctx.getImageData(
    Math.round(diamondRegion.x),
    Math.round(diamondRegion.y),
    Math.round(diamondRegion.width),
    Math.round(diamondRegion.height)
  );

  // Split into 4 horizontal zones (one for each diamond)
  const data = imageData.data;
  const regionWidth = Math.round(diamondRegion.width);
  const regionHeight = Math.round(diamondRegion.height);
  const zoneWidth = regionWidth / 4;

  let filledCount = 0;
  const zoneStats = [];

  // Analyze each zone
  for (let zone = 0; zone < 4; zone++) {
    const zoneStartX = Math.floor(zone * zoneWidth);
    const zoneEndX = Math.floor((zone + 1) * zoneWidth);
    let darkGreyPixels = 0;
    let totalZonePixels = 0;

    for (let y = 0; y < regionHeight; y++) {
      for (let x = zoneStartX; x < zoneEndX; x++) {
        const i = (y * regionWidth + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate brightness and saturation
        const brightness = (r + g + b) / 3;
        const maxChannel = Math.max(r, g, b);
        const minChannel = Math.min(r, g, b);
        const saturation = maxChannel - minChannel;

        // Filled diamond: dark AND low saturation (grey/neutral)
        const isDarkGrey =
          brightness < p.brightnessThreshold && // Dark enough
          saturation < p.saturationThreshold; // Not colorful (grey/neutral)

        if (isDarkGrey) {
          darkGreyPixels++;
        }
        totalZonePixels++;
      }
    }

    const fillRatio = darkGreyPixels / totalZonePixels;
    const isFilled = fillRatio > p.fillRatioThreshold;
    if (isFilled) {
      filledCount++;
    }
    zoneStats.push({ zone: zone + 1, fillRatio: (fillRatio * 100).toFixed(1) + '%', isFilled });
  }

  // Debug: log for card #2 (position 2,1)
  // Card number is tracked externally, so we'll log the first few cards
  // Store in a global counter to track which card this is
  if (typeof (window as any)._cardCounter === 'undefined') {
    (window as any)._cardCounter = 0;
  }
  (window as any)._cardCounter++;

  if ((window as any)._cardCounter === 2) {
    console.log('Quantity detection for card #2 (position 2,1):', {
      cardBbox,
      diamondRegion,
      filledCount,
      zoneStats,
      params: p,
    });
  }

  return filledCount;
};

/**
 * Extracts a region of the canvas as a new canvas
 */
export const extractRegion = (
  sourceCanvas: HTMLCanvasElement,
  bbox: { x: number; y: number; width: number; height: number }
): HTMLCanvasElement => {
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  newCanvas.width = bbox.width;
  newCanvas.height = bbox.height;

  ctx.drawImage(
    sourceCanvas,
    bbox.x,
    bbox.y,
    bbox.width,
    bbox.height,
    0,
    0,
    bbox.width,
    bbox.height
  );

  return newCanvas;
};

/**
 * Draws debug overlays on the image showing detected grid
 */
export const drawGridOverlay = (
  image: HTMLImageElement,
  cells: GridCell[]
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  // Draw grid cells
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 2;

  cells.forEach((cell) => {
    ctx.strokeRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);

    // Draw position label
    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText(`${cell.x},${cell.y}`, cell.bbox.x + 5, cell.bbox.y + 20);
  });

  return canvas;
};
