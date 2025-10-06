import { GridCell } from '../types';

/**
 * Detects the card grid in an MTG Arena collection screenshot
 * Cards are arranged in a 12-column grid
 */
export const detectCardGrid = (
  image: HTMLImageElement
): GridCell[] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  // MTG Arena UI constants (these may need adjustment)
  const COLUMNS = 12;
  const GRID_START_X = image.width * 0.015; // Left margin
  const GRID_START_Y = image.height * 0.23; // Top margin (below UI)
  const GRID_WIDTH = image.width * 0.97;
  const CARD_ASPECT_RATIO = 0.7; // Card height/width ratio

  const cardWidth = GRID_WIDTH / COLUMNS;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // Calculate number of rows visible
  const availableHeight = image.height - GRID_START_Y - (image.height * 0.02);
  const rows = Math.floor(availableHeight / cardHeight);

  const cells: GridCell[] = [];

  // Grid is read from bottom-left to top-right based on CSV data
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const x = GRID_START_X + (col * cardWidth);
      const y = GRID_START_Y + (row * cardHeight);

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
  cardBbox: { x: number; y: number; width: number; height: number }
): number => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return 1; // Default to 1 if detection fails
  }

  // Diamonds are located above the card, centered horizontally
  const diamondRegion = {
    x: cardBbox.x + cardBbox.width * 0.3,
    y: cardBbox.y - cardBbox.height * 0.08, // Slightly above card
    width: cardBbox.width * 0.4,
    height: cardBbox.height * 0.06,
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

  // Count "bright" pixels (filled diamonds are white/bright)
  const data = imageData.data;
  let brightPixels = 0;
  const threshold = 200; // Brightness threshold

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness > threshold) {
      brightPixels++;
    }
  }

  const totalPixels = data.length / 4;
  const brightRatio = brightPixels / totalPixels;

  // Map brightness ratio to quantity (1-4)
  // These thresholds may need tuning based on actual screenshots
  if (brightRatio > 0.25) return 4;
  if (brightRatio > 0.18) return 3;
  if (brightRatio > 0.10) return 2;
  return 1;
};

/**
 * Extracts a region of the canvas as a new canvas
 */
export const extractRegion = (
  sourceCanvas: HTMLCanvasElement,
  bbox: { x: number; y: number; width: number; height: number }
): HTMLCanvasElement => {
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');

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
  const ctx = canvas.getContext('2d');

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
