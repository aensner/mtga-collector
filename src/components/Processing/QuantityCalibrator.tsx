import React, { useRef, useState, useEffect } from 'react';

interface QuantityCalibratorProps {
  imageUrl: string;
  gridParams: {
    startX: number;
    startY: number;
    gridWidth: number;
    gridHeight: number;
    cardGapX: number;
    cardGapY: number;
  };
  onQuantityParamsChange: (params: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    brightnessThreshold: number;
    saturationThreshold: number;
    fillRatioThreshold: number;
  }) => void;
  initialQuantityParams?: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    brightnessThreshold: number;
    saturationThreshold: number;
    fillRatioThreshold: number;
  };
}

export const QuantityCalibrator: React.FC<QuantityCalibratorProps> = ({
  imageUrl,
  gridParams,
  onQuantityParamsChange,
  initialQuantityParams,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showDebugView, setShowDebugView] = useState(true);
  const lastEmittedParams = useRef<string>('');

  // Quantity detection parameters
  const [offsetX, setOffsetX] = useState(initialQuantityParams?.offsetX || 0.0);
  const [offsetY, setOffsetY] = useState(initialQuantityParams?.offsetY || 0.08);
  const [width, setWidth] = useState(initialQuantityParams?.width || 1.0);
  const [height, setHeight] = useState(initialQuantityParams?.height || 0.06);
  const [brightnessThreshold, setBrightnessThreshold] = useState(
    initialQuantityParams?.brightnessThreshold || 100
  );
  const [saturationThreshold, setSaturationThreshold] = useState(
    initialQuantityParams?.saturationThreshold || 50
  );
  const [fillRatioThreshold, setFillRatioThreshold] = useState(
    initialQuantityParams?.fillRatioThreshold || 0.15
  );

  const [selectedCard, setSelectedCard] = useState(0); // Which card to preview
  const [detectionStats, setDetectionStats] = useState({
    detectedQuantity: 1,
    diamondStats: [
      { filled: false, fillRatio: 0 },
      { filled: false, fillRatio: 0 },
      { filled: false, fillRatio: 0 },
      { filled: false, fillRatio: 0 },
    ],
  });

  const COLUMNS = 12;
  const ROWS = 3;

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate grid cells
  const calculateGridCells = (img: HTMLImageElement) => {
    const startX = img.width * gridParams.startX;
    const startY = img.height * gridParams.startY;
    const totalWidth = img.width * gridParams.gridWidth;
    const totalHeight = img.height * gridParams.gridHeight;

    const availableWidth = totalWidth - gridParams.cardGapX * img.width * (COLUMNS - 1);
    const availableHeight = totalHeight - gridParams.cardGapY * img.height * (ROWS - 1);
    const cardWidth = availableWidth / COLUMNS;
    const cardHeight = availableHeight / ROWS;

    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const x = startX + col * (cardWidth + gridParams.cardGapX * img.width);
        const y = startY + row * (cardHeight + gridParams.cardGapY * img.height);
        cells.push({ x, y, width: cardWidth, height: cardHeight });
      }
    }
    return cells;
  };

  // Analyze quantity for a specific card
  const analyzeQuantity = (
    ctx: CanvasRenderingContext2D,
    cardBbox: { x: number; y: number; width: number; height: number }
  ) => {
    const diamondRegion = {
      x: cardBbox.x + cardBbox.width * offsetX,
      y: cardBbox.y - cardBbox.height * offsetY,
      width: cardBbox.width * width,
      height: cardBbox.height * height,
    };

    if (diamondRegion.y < 0 || diamondRegion.x < 0) {
      return { goldRatio: 0, detectedQuantity: 1, goldPixels: 0, totalPixels: 0 };
    }

    const imageData = ctx.getImageData(
      Math.round(diamondRegion.x),
      Math.round(diamondRegion.y),
      Math.round(diamondRegion.width),
      Math.round(diamondRegion.height)
    );

    const data = imageData.data;
    const regionWidth = Math.round(diamondRegion.width);
    const regionHeight = Math.round(diamondRegion.height);

    // Split into 4 horizontal zones (one for each diamond)
    const zoneWidth = regionWidth / 4;
    const diamondStats = [
      { filled: false, fillRatio: 0 },
      { filled: false, fillRatio: 0 },
      { filled: false, fillRatio: 0 },
      { filled: false, fillRatio: 0 },
    ];

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
            brightness < brightnessThreshold && // Dark enough
            saturation < saturationThreshold; // Not colorful (grey/neutral)

          if (isDarkGrey) {
            darkGreyPixels++;
          }
          totalZonePixels++;
        }
      }

      const fillRatio = darkGreyPixels / totalZonePixels;
      diamondStats[zone] = {
        filled: fillRatio > fillRatioThreshold,
        fillRatio,
      };
    }

    // Count filled diamonds
    const detectedQuantity = diamondStats.filter((d) => d.filled).length;

    return { detectedQuantity, diamondStats };
  };

  // Draw the calibration overlay
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // Create a separate canvas for the original image (no overlays)
    const originalCanvas = document.createElement('canvas');
    const originalCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
    if (!originalCtx) return;

    originalCanvas.width = image.width;
    originalCanvas.height = image.height;
    originalCtx.drawImage(image, 0, 0);

    // Draw to display canvas with overlays
    ctx.drawImage(image, 0, 0);

    const cells = calculateGridCells(image);

    // Draw all cards lightly
    cells.forEach((cell, idx) => {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    });

    // Highlight selected card
    const selectedCell = cells[selectedCard];
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(selectedCell.x, selectedCell.y, selectedCell.width, selectedCell.height);

    // Draw diamond region in yellow
    const diamondRegion = {
      x: selectedCell.x + selectedCell.width * offsetX,
      y: selectedCell.y - selectedCell.height * offsetY,
      width: selectedCell.width * width,
      height: selectedCell.height * height,
    };

    ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(diamondRegion.x, diamondRegion.y, diamondRegion.width, diamondRegion.height);

    // Analyze using the ORIGINAL image without overlays
    const stats = analyzeQuantity(originalCtx, selectedCell);
    setDetectionStats(stats);

    // Draw debug view showing detected gold pixels from ORIGINAL image
    if (showDebugView && debugCanvasRef.current) {
      const debugCanvas = debugCanvasRef.current;
      const debugCtx = debugCanvas.getContext('2d', { willReadFrequently: true });
      if (debugCtx) {
        const regionWidth = Math.round(diamondRegion.width);
        const regionHeight = Math.round(diamondRegion.height);

        // Set canvas size to actual pixel dimensions
        debugCanvas.width = regionWidth;
        debugCanvas.height = regionHeight;

        // Get the diamond region from ORIGINAL image (no overlays)
        const regionData = originalCtx.getImageData(
          Math.round(diamondRegion.x),
          Math.round(diamondRegion.y),
          regionWidth,
          regionHeight
        );

        const data = regionData.data;
        const debugData = debugCtx.createImageData(regionWidth, regionHeight);

        // Visualize detection: show zone divisions and detected dark-grey pixels
        const zoneWidth = regionWidth / 4;

        for (let y = 0; y < regionHeight; y++) {
          for (let x = 0; x < regionWidth; x++) {
            const i = (y * regionWidth + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const brightness = (r + g + b) / 3;
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            const isDarkGrey =
              brightness < brightnessThreshold &&
              saturation < saturationThreshold;

            // Determine which zone this pixel is in
            const zone = Math.floor(x / zoneWidth);
            const isZoneBorder = x % Math.floor(zoneWidth) < 2;

            if (isZoneBorder) {
              // Yellow vertical lines for zone divisions
              debugData.data[i] = 255;
              debugData.data[i + 1] = 255;
              debugData.data[i + 2] = 0;
              debugData.data[i + 3] = 255;
            } else if (isDarkGrey) {
              // Bright green for detected dark-grey pixels (filled diamond)
              debugData.data[i] = 0;
              debugData.data[i + 1] = 255;
              debugData.data[i + 2] = 0;
              debugData.data[i + 3] = 255;
            } else {
              // Show original pixel dimmed
              debugData.data[i] = r * 0.3;
              debugData.data[i + 1] = g * 0.3;
              debugData.data[i + 2] = b * 0.3;
              debugData.data[i + 3] = 255;
            }
          }
        }

        debugCtx.putImageData(debugData, 0, 0);
      }
    }

    // Display quantity on card
    ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(
      `Q: ${stats.detectedQuantity}`,
      selectedCell.x + 5,
      selectedCell.y + selectedCell.height - 10
    );

    // Emit parameters only if they changed
    const currentParams = JSON.stringify({
      offsetX,
      offsetY,
      width,
      height,
      brightnessThreshold,
      saturationThreshold,
      fillRatioThreshold,
    });

    if (currentParams !== lastEmittedParams.current) {
      lastEmittedParams.current = currentParams;
      onQuantityParamsChange({
        offsetX,
        offsetY,
        width,
        height,
        brightnessThreshold,
        saturationThreshold,
        fillRatioThreshold,
      });
    }
  }, [
    image,
    selectedCard,
    offsetX,
    offsetY,
    width,
    height,
    brightnessThreshold,
    saturationThreshold,
    fillRatioThreshold,
    gridParams,
    onQuantityParamsChange,
    showDebugView,
  ]);

  return (
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white mb-2">Quantity Detection Calibration</h3>
        <p className="text-xs text-gray-400 mb-2">
          • Yellow box shows the diamond region being analyzed
          <br />• Algorithm splits region into 4 zones and looks for dark-grey pixels (filled diamonds)
          <br />• Filled diamonds = dark + low saturation (grey), Empty = transparent showing background
        </p>
        <button
          onClick={() => {
            console.log('Resetting quantity params to defaults');
            setOffsetX(0.0);
            setOffsetY(0.08);
            setWidth(1.0);
            setHeight(0.06);
            setBrightnessThreshold(100);
            setSaturationThreshold(50);
            setFillRatioThreshold(0.15);
            // Force save to localStorage immediately
            const newDefaults = {
              offsetX: 0.0,
              offsetY: 0.08,
              width: 1.0,
              height: 0.06,
              brightnessThreshold: 100,
              saturationThreshold: 50,
              fillRatioThreshold: 0.15,
            };
            localStorage.setItem('quantityParams', JSON.stringify(newDefaults));
            console.log('Saved new defaults to localStorage:', newDefaults);
          }}
          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
        >
          Reset to Default Values
        </button>
      </div>

      <div className="border border-gray-600 rounded overflow-auto max-h-[500px] mb-4">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      {/* Debug view showing detected gold pixels */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
          <input
            type="checkbox"
            checked={showDebugView}
            onChange={(e) => setShowDebugView(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700"
          />
          <span>Show Gold Pixel Detection (green = detected as gold)</span>
        </label>
        {showDebugView && (
          <div className="border border-green-500 rounded p-2 bg-black">
            <p className="text-xs text-gray-400 mb-2">
              Zoomed view split into 4 zones. Green = dark-grey pixels (filled diamond), Yellow lines = zone divisions.
            </p>
            <div className="flex justify-center overflow-auto">
              <canvas
                ref={debugCanvasRef}
                style={{
                  imageRendering: 'pixelated',
                  minHeight: '150px',
                  maxHeight: '300px',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Selector */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold text-white mb-2">Preview Card (1-36)</h4>
        <input
          type="range"
          min="0"
          max="35"
          value={selectedCard}
          onChange={(e) => setSelectedCard(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-300 mt-1">
          Card {selectedCard + 1} - Position: ({(selectedCard % COLUMNS) + 1},{' '}
          {Math.floor(selectedCard / COLUMNS) + 1})
        </div>
      </div>

      {/* Detection Stats */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold text-white mb-2">Detection Stats</h4>
        <div className="text-sm font-bold text-white mb-2">
          Detected Quantity: {detectionStats.detectedQuantity}
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-300">
          {detectionStats.diamondStats.map((stat, idx) => (
            <div key={idx} className={stat.filled ? 'text-green-400' : 'text-red-400'}>
              <div>Diamond {idx + 1}</div>
              <div>{stat.filled ? '✓ Filled' : '✗ Empty'}</div>
              <div>{(stat.fillRatio * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Region Position & Size */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold text-white mb-2">Diamond Region (Yellow Box)</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">
              Horizontal Offset (from left: {(offsetX * 100).toFixed(1)}%)
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={offsetX}
              onChange={(e) => setOffsetX(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">
              Vertical Offset (above card: {(offsetY * 100).toFixed(1)}%)
            </label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={offsetY}
              onChange={(e) => setOffsetY(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Width ({(width * 100).toFixed(1)}%)</label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.01"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Height ({(height * 100).toFixed(1)}%)</label>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Detection Thresholds */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold text-white mb-2">Detection Thresholds</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">
              Max Brightness ({brightnessThreshold}) - Pixels darker than this
            </label>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={brightnessThreshold}
              onChange={(e) => setBrightnessThreshold(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">
              Max Saturation ({saturationThreshold}) - How "grey" pixels must be
            </label>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={saturationThreshold}
              onChange={(e) => setSaturationThreshold(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">
              Fill Ratio Threshold ({(fillRatioThreshold * 100).toFixed(1)}%) - % of zone to be "filled"
            </label>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.01"
              value={fillRatioThreshold}
              onChange={(e) => setFillRatioThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Debug: Show localStorage value */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold text-white mb-2">Saved Parameters (localStorage)</h4>
        <div className="space-x-2">
          <button
            onClick={() => {
              const saved = localStorage.getItem('quantityParams');
              alert('Saved quantityParams:\n\n' + saved);
              console.log('quantityParams from localStorage:', saved);
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
          >
            Show Saved Values
          </button>
          <button
            onClick={() => {
              console.log('FORCE CLEARING localStorage and reloading page...');
              localStorage.removeItem('quantityParams');
              window.location.reload();
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            Clear & Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};
