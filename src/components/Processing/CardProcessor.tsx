import React, { useState, useEffect, useRef } from 'react';
import type { CardData, ProcessingResult, UploadedImage } from '../../types';
import { initializeOCR, recognizeCardName, terminateOCR, preprocessImage } from '../../services/ocr';
import { detectCardGrid, detectCardQuantity } from '../../services/imageProcessing';
import { correctCardNamesBatch } from '../../services/anthropic';
import { searchCardsBatch } from '../../services/scryfall';
import { GridCalibrator } from './GridCalibrator';
import { QuantityCalibrator } from './QuantityCalibrator';

interface CardProcessorProps {
  images: UploadedImage[];
  onProcessingComplete: (results: ProcessingResult[]) => void;
}

export const CardProcessor: React.FC<CardProcessorProps> = ({ images, onProcessingComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [debugCanvas, setDebugCanvas] = useState<string | null>(null);

  // Load calibration from localStorage or use defaults
  const loadCalibration = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // OCR region calibration parameters
  const [ocrLeft, setOcrLeft] = useState(() => loadCalibration('ocrLeft', 0.05));
  const [ocrTop, setOcrTop] = useState(() => loadCalibration('ocrTop', 0.043));
  const [ocrWidth, setOcrWidth] = useState(() => loadCalibration('ocrWidth', 0.80));
  const [ocrHeight, setOcrHeight] = useState(() => loadCalibration('ocrHeight', 0.075));

  // Grid calibration parameters (from GridCalibrator)
  const [gridParams, setGridParams] = useState(() =>
    loadCalibration('gridParams', {
      startX: 0.027,
      startY: 0.193,
      gridWidth: 0.945,
      gridHeight: 0.788,
      cardGapX: 0.008,
      cardGapY: 0.036,
    })
  );

  // Quantity calibration parameters
  const [quantityParams, setQuantityParams] = useState(() => {
    const saved = localStorage.getItem('quantityParams');

    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        console.log('🔍 Found saved quantity params:', parsedSaved);

        // Validate that saved params have the correct structure
        if ('saturationThreshold' in parsedSaved && 'fillRatioThreshold' in parsedSaved) {
          console.log('✅ Using saved quantity params:', parsedSaved);
          return parsedSaved;
        }
      } catch (e) {
        console.error('Failed to parse saved quantity params:', e);
      }
    }

    // Use calibrated defaults
    console.log('🔄 No valid saved params - using calibrated defaults');
    const newDefaults = {
      offsetX: 0.28,
      offsetY: 0.08,
      width: 0.44,
      height: 0.07,
      brightnessThreshold: 50,
      saturationThreshold: 10,
      fillRatioThreshold: 0.05,
    };
    localStorage.setItem('quantityParams', JSON.stringify(newDefaults));
    console.log('💾 Saved calibrated defaults to localStorage:', newDefaults);
    return newDefaults;
  });

  // Preview canvas for real-time visualization
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);

  // Update preview when sliders change
  useEffect(() => {
    if (!debugMode || !previewImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = previewImage.width;
    canvas.height = previewImage.height;

    // Draw the image
    ctx.drawImage(previewImage, 0, 0);

    // Detect grid and draw overlay with custom parameters
    const grid = detectCardGrid(previewImage, gridParams);

    // Draw only first few cards to avoid clutter
    const cardsToShow = Math.min(grid.length, 12); // First row

    for (let i = 0; i < cardsToShow; i++) {
      const cell = grid[i];

      // Draw full card bbox in blue
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);

      // Draw OCR name region in red
      const nameRegion = {
        left: cell.bbox.x + cell.bbox.width * ocrLeft,
        top: cell.bbox.y + cell.bbox.height * ocrTop,
        width: cell.bbox.width * ocrWidth,
        height: cell.bbox.height * ocrHeight,
      };

      ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(nameRegion.left, nameRegion.top, nameRegion.width, nameRegion.height);
    }
  }, [debugMode, ocrLeft, ocrTop, ocrWidth, ocrHeight, previewImage, gridParams]);

  // Save calibration values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ocrLeft', JSON.stringify(ocrLeft));
  }, [ocrLeft]);

  useEffect(() => {
    localStorage.setItem('ocrTop', JSON.stringify(ocrTop));
  }, [ocrTop]);

  useEffect(() => {
    localStorage.setItem('ocrWidth', JSON.stringify(ocrWidth));
  }, [ocrWidth]);

  useEffect(() => {
    localStorage.setItem('ocrHeight', JSON.stringify(ocrHeight));
  }, [ocrHeight]);

  useEffect(() => {
    localStorage.setItem('gridParams', JSON.stringify(gridParams));
  }, [gridParams]);

  useEffect(() => {
    localStorage.setItem('quantityParams', JSON.stringify(quantityParams));
  }, [quantityParams]);

  // Load preview image when first image is uploaded
  useEffect(() => {
    if (images.length > 0 && !previewImage) {
      const img = new Image();
      img.onload = () => setPreviewImage(img);
      img.src = images[0].preview;
    }
  }, [images, previewImage]);

  const processImages = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    setProgress(0);
    const startTime = Date.now();

    try {
      // Initialize OCR
      setCurrentStep('Initializing OCR...');
      await initializeOCR();

      const results: ProcessingResult[] = [];

      for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
        const image = images[imgIndex];
        setCurrentStep(`Processing image ${imgIndex + 1}/${images.length}...`);

        // Load image
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = image.preview;
        });

        // Preprocess and detect grid with custom parameters
        setCurrentStep(`Detecting card grid in image ${imgIndex + 1}...`);
        const canvas = preprocessImage(img);
        const grid = detectCardGrid(img, gridParams);

        console.log(`Detected ${grid.length} card positions in grid`);

        // Create a separate canvas from the ORIGINAL image for quantity detection
        // (preprocessing changes pixel values which breaks quantity detection)
        const originalCanvas = document.createElement('canvas');
        const originalCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
        if (!originalCtx) {
          throw new Error('Could not get canvas context for quantity detection');
        }
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCtx.drawImage(img, 0, 0);

        // Extract cards
        setCurrentStep(`Extracting ${grid.length} cards...`);
        const cards: CardData[] = [];

        // Reset quantity detection counter before processing
        (window as any)._cardCounter = 0;

        for (let i = 0; i < grid.length; i++) {
          const cell = grid[i];

          try {
            // OCR card name with custom region parameters (use preprocessed canvas for OCR)
            const { text, confidence } = await recognizeCardName(
              canvas,
              cell.bbox,
              debugMode,
              { left: ocrLeft, top: ocrTop, width: ocrWidth, height: ocrHeight }
            );

            // Detect quantity with custom parameters (use ORIGINAL canvas for quantity)
            if (i === 0) {
              console.log('Processing with quantityParams:', quantityParams);
            }
            const quantity = detectCardQuantity(originalCanvas, cell.bbox, quantityParams);

            if (text.trim().length > 0) {
              cards.push({
                nummer: i + 1,
                positionX: cell.x,
                positionY: cell.y,
                kartenname: text,
                anzahl: quantity,
                confidence,
              });
            }

            setProgress(Math.round(((i + 1) / grid.length) * 50));
          } catch (error) {
            console.error(`Error processing card at ${cell.x},${cell.y}:`, error);
          }
        }

        // AI correction (skip if no API key or credits)
        if (cards.length > 0) {
          setCurrentStep('Correcting card names with AI...');
          const cardNames = cards.map(c => c.kartenname);
          const corrections = await correctCardNamesBatch(cardNames);

          cards.forEach((card, i) => {
            if (corrections[i] && corrections[i].correctedName !== card.kartenname) {
              card.correctedName = corrections[i].correctedName;
              card.confidence = (card.confidence || 0) * corrections[i].confidence;
            }
          });
        }

        setProgress(75);

        // Validate with Scryfall
        setCurrentStep('Validating with Scryfall database...');
        const correctedNames = cards.map(c => c.correctedName || c.kartenname);
        const scryfallResults = await searchCardsBatch(correctedNames);

        cards.forEach((card, i) => {
          if (scryfallResults[i]) {
            card.scryfallMatch = scryfallResults[i] || undefined;
            // Use Scryfall name as final correction if found
            if (scryfallResults[i]) {
              card.correctedName = scryfallResults[i]!.name;
            }
          }
        });

        setProgress(100);

        console.log(`Extracted ${cards.length} cards successfully`);

        // Save debug canvas if in debug mode
        if (debugMode) {
          setDebugCanvas(canvas.toDataURL());
        }

        results.push({
          cards,
          totalCards: cards.length,
          processingTime: Date.now() - startTime,
        });
      }

      console.log('Processing complete. Total results:', results);

      onProcessingComplete(results);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Check console for details.');
    } finally {
      await terminateOCR();
      setProcessing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <label className="flex items-center space-x-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
          />
          <span>Debug Mode (visualize OCR regions)</span>
        </label>
      </div>

      {debugMode && images.length > 0 && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white mb-2">1. Grid Calibration</h2>
          </div>
          <GridCalibrator
            imageUrl={images[0].preview}
            onGridParamsChange={setGridParams}
            initialGridParams={gridParams}
            ocrParams={{
              left: ocrLeft,
              top: ocrTop,
              width: ocrWidth,
              height: ocrHeight,
            }}
          />

          <hr className="my-4 border-gray-600" />

          <div className="mb-4">
            <h2 className="text-lg font-bold text-white mb-2">2. OCR Name Region</h2>
          </div>
          <h3 className="text-sm font-semibold text-white mb-3">OCR Name Region (Red Boxes)</h3>
          <p className="text-xs text-gray-400 mb-3">
            Adjust where OCR reads the card names within each card.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Left Offset ({(ocrLeft * 100).toFixed(1)}%)</label>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.01"
                value={ocrLeft}
                onChange={(e) => setOcrLeft(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Top Offset ({(ocrTop * 100).toFixed(1)}%)</label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                value={ocrTop}
                onChange={(e) => setOcrTop(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Width ({(ocrWidth * 100).toFixed(1)}%)</label>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.01"
                value={ocrWidth}
                onChange={(e) => setOcrWidth(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Height ({(ocrHeight * 100).toFixed(1)}%)</label>
              <input
                type="range"
                min="0.02"
                max="0.15"
                step="0.001"
                value={ocrHeight}
                onChange={(e) => setOcrHeight(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <hr className="my-4 border-gray-600" />

          <div className="mb-4">
            <h2 className="text-lg font-bold text-white mb-2">3. Quantity Detection</h2>
          </div>
          <QuantityCalibrator
            imageUrl={images[0].preview}
            gridParams={gridParams}
            onQuantityParamsChange={setQuantityParams}
            initialQuantityParams={quantityParams}
          />
        </div>
      )}

      <button
        onClick={processImages}
        disabled={processing || images.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? `Processing... ${progress}%` : `Process ${images.length} Image(s)`}
      </button>

      {processing && (
        <div className="mt-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">{currentStep}</span>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {debugCanvas && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">Debug Visualization</h3>
          <p className="text-sm text-gray-400 mb-2">
            Blue boxes = detected card areas | Red boxes = OCR reading regions
          </p>
          <img src={debugCanvas} alt="Debug visualization" className="w-full border border-gray-700 rounded" />
        </div>
      )}
    </div>
  );
};
