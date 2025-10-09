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

type CardStatus = 'pending' | 'processing' | 'success' | 'error' | 'empty';

interface ProcessingProgress {
  currentCard: number;
  totalCards: number;
  currentPhase: 'OCR' | 'AI Correction' | 'Card Validation' | 'Complete';
  currentCardName: string;
  currentPosition: { x: number; y: number };
  batchNumber: number;
  totalBatches: number;
  currentPage?: number;
  totalPages?: number;
}

export const CardProcessor: React.FC<CardProcessorProps> = ({ images, onProcessingComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [debugCanvas, setDebugCanvas] = useState<string | null>(null);
  const [processingCanvas, setProcessingCanvas] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

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

  // Reference to progress indicator for auto-scrolling
  const progressIndicatorRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to progress indicator when it appears
  useEffect(() => {
    if (processingProgress && progressIndicatorRef.current) {
      progressIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [processingProgress]);

  // Function to draw card status overlays on canvas
  const drawCardStatusOverlay = (
    img: HTMLImageElement,
    grid: any[],
    cardStatuses: Map<number, CardStatus>
  ): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw status overlays for each card
    grid.forEach((cell, idx) => {
      const status = cardStatuses.get(idx) || 'pending';

      // Define colors based on status
      let borderColor = '';
      let fillColor = '';
      switch (status) {
        case 'processing':
          borderColor = 'rgba(255, 215, 0, 0.9)'; // Yellow/Gold
          fillColor = 'rgba(255, 215, 0, 0.15)';
          break;
        case 'success':
          borderColor = 'rgba(0, 255, 0, 0.7)'; // Green
          fillColor = 'rgba(0, 255, 0, 0.1)';
          break;
        case 'error':
          borderColor = 'rgba(255, 0, 0, 0.8)'; // Red
          fillColor = 'rgba(255, 0, 0, 0.15)';
          break;
        case 'empty':
          borderColor = 'rgba(128, 128, 128, 0.6)'; // Gray
          fillColor = 'rgba(128, 128, 128, 0.1)';
          break;
        default:
          return; // Don't draw anything for 'pending'
      }

      // Draw filled background
      ctx.fillStyle = fillColor;
      ctx.fillRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);

      // Draw border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);

      // Draw card number
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`${idx + 1}`, cell.bbox.x + 8, cell.bbox.y + 25);
    });

    return canvas.toDataURL();
  };

  const processImages = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setProcessingCanvas(null);
    setProcessingProgress({
      currentCard: 0,
      totalCards: 36,
      currentPhase: 'OCR',
      currentCardName: 'Initializing...',
      currentPosition: { x: 0, y: 0 },
      batchNumber: 0,
      totalBatches: 9,
      currentPage: 1,
      totalPages: images.length,
    });
    const startTime = Date.now();

    try {
      // Initialize OCR
      setCurrentStep('Initializing OCR...');
      await initializeOCR();

      const results: ProcessingResult[] = [];

      for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
        const image = images[imgIndex];
        const pageNumber = imgIndex + 1;
        setCurrentStep(`Processing image ${pageNumber}/${images.length}...`);

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

        // Update progress with actual grid size
        setProcessingProgress({
          currentCard: 0,
          totalCards: grid.length,
          currentPhase: 'OCR',
          currentCardName: 'Starting OCR...',
          currentPosition: { x: 0, y: 0 },
          batchNumber: 0,
          totalBatches: Math.ceil(grid.length / 4),
          currentPage: pageNumber,
          totalPages: images.length,
        });

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

        // Extract cards using parallel processing
        setCurrentStep(`Extracting ${grid.length} cards with 4 parallel workers...`);
        const cards: CardData[] = [];
        const ocrStartTime = Date.now();

        // Track card statuses for visual overlay
        const cardStatuses = new Map<number, CardStatus>();

        // Reset quantity detection counter before processing
        (window as any)._cardCounter = 0;

        // Process cards in batches of 4 (parallel)
        const BATCH_SIZE = 4;
        const batches = [];
        for (let i = 0; i < grid.length; i += BATCH_SIZE) {
          batches.push(grid.slice(i, i + BATCH_SIZE));
        }

        console.log(`Processing ${grid.length} cards in ${batches.length} batches of ${BATCH_SIZE}`);

        for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
          const batch = batches[batchIdx];
          const batchStartTime = Date.now();

          // Mark current batch as processing (yellow)
          for (let cellIdx = 0; cellIdx < batch.length; cellIdx++) {
            const cardIndex = batchIdx * BATCH_SIZE + cellIdx;
            cardStatuses.set(cardIndex, 'processing');
          }

          // Update progress indicator for first card in batch
          const firstCardIndex = batchIdx * BATCH_SIZE;
          const firstCell = batch[0];
          setProcessingProgress({
            currentCard: firstCardIndex + 1,
            totalCards: grid.length,
            currentPhase: 'OCR',
            currentCardName: 'Reading...',
            currentPosition: { x: firstCell.x, y: firstCell.y },
            batchNumber: batchIdx + 1,
            totalBatches: batches.length,
            currentPage: pageNumber,
            totalPages: images.length,
          });

          // Update canvas to show processing status
          if (debugMode) {
            const overlayCanvas = drawCardStatusOverlay(img, grid, cardStatuses);
            setProcessingCanvas(overlayCanvas);
          }

          // Process all cards in batch in parallel
          const batchPromises = batch.map(async (cell, cellIdx) => {
            const cardIndex = batchIdx * BATCH_SIZE + cellIdx;
            const cardStartTime = Date.now();

            try {
              // OCR card name with custom region parameters (use preprocessed canvas for OCR)
              const { text, confidence } = await recognizeCardName(
                canvas,
                cell.bbox,
                debugMode,
                { left: ocrLeft, top: ocrTop, width: ocrWidth, height: ocrHeight }
              );

              // Detect quantity with custom parameters (use ORIGINAL canvas for quantity)
              const quantity = detectCardQuantity(originalCanvas, cell.bbox, quantityParams);

              const cardTime = Date.now() - cardStartTime;

              if (text.trim().length > 0) {
                return {
                  nummer: cardIndex + 1,
                  positionX: cell.x,
                  positionY: cell.y,
                  kartenname: text,
                  anzahl: quantity,
                  confidence,
                  cardTime,
                  pageNumber,
                };
              } else {
                return { empty: true, cardTime };
              }
            } catch (error) {
              console.error(`Error processing card at ${cell.x},${cell.y}:`, error);
              return { error: true, cardTime: Date.now() - cardStartTime };
            }
          });

          // Wait for all cards in batch to complete
          const batchResults = await Promise.all(batchPromises);
          const batchTime = Date.now() - batchStartTime;

          // Update card statuses based on results
          let lastSuccessCard: any = null;
          batchResults.forEach((result: any, idx) => {
            const cardIndex = batchIdx * BATCH_SIZE + idx;
            if (result && !result.empty && !result.error) {
              cards.push(result);
              cardStatuses.set(cardIndex, 'success');
              lastSuccessCard = result;

              const displayName = result.kartenname.length > 20
                ? result.kartenname.substring(0, 20) + '...'
                : result.kartenname;
              console.log(`Card ${cardIndex + 1}/${grid.length}: "${displayName}" (${result.cardTime}ms)`);
            } else if (result && result.empty) {
              cardStatuses.set(cardIndex, 'empty');
            } else if (result && result.error) {
              cardStatuses.set(cardIndex, 'error');
            }
          });

          // Update progress with last successful card from batch
          if (lastSuccessCard) {
            setProcessingProgress({
              currentCard: batchIdx * BATCH_SIZE + batchResults.length,
              totalCards: grid.length,
              currentPhase: 'OCR',
              currentCardName: lastSuccessCard.kartenname.length > 25
                ? lastSuccessCard.kartenname.substring(0, 25) + '...'
                : lastSuccessCard.kartenname,
              currentPosition: { x: lastSuccessCard.positionX, y: lastSuccessCard.positionY },
              batchNumber: batchIdx + 1,
              totalBatches: batches.length,
              currentPage: pageNumber,
              totalPages: images.length,
            });
          }

          // Update canvas to show completed batch
          if (debugMode) {
            const overlayCanvas = drawCardStatusOverlay(img, grid, cardStatuses);
            setProcessingCanvas(overlayCanvas);
          }

          // Update progress
          const processed = Math.min((batchIdx + 1) * BATCH_SIZE, grid.length);
          setProgress(Math.round((processed / grid.length) * 50));
          setCurrentStep(`Processed batch ${batchIdx + 1}/${batches.length} (${batchTime}ms) - ${cards.length} cards found`);
        }

        const ocrTotalTime = ((Date.now() - ocrStartTime) / 1000).toFixed(1);
        console.log(`Parallel OCR completed in ${ocrTotalTime}s - Extracted ${cards.length} cards`);

        // AI correction (skip if no cards extracted)
        if (cards.length > 0) {
          const aiStartTime = Date.now();
          setCurrentStep(`Correcting ${cards.length} card names with AI...`);

          // Update progress to AI phase
          setProcessingProgress({
            currentCard: cards.length,
            totalCards: grid.length,
            currentPhase: 'AI Correction',
            currentCardName: `Processing ${cards.length} cards...`,
            currentPosition: { x: 0, y: 0 },
            batchNumber: batches.length,
            totalBatches: batches.length,
            currentPage: pageNumber,
            totalPages: images.length,
          });

          const cardNames = cards.map(c => c.kartenname);
          const corrections = await correctCardNamesBatch(cardNames);

          let correctionCount = 0;
          cards.forEach((card, i) => {
            if (corrections[i] && corrections[i].correctedName !== card.kartenname) {
              card.correctedName = corrections[i].correctedName;
              card.confidence = (card.confidence || 0) * corrections[i].confidence;
              correctionCount++;
            }
          });

          const aiTime = ((Date.now() - aiStartTime) / 1000).toFixed(1);
          console.log(`AI correction completed in ${aiTime}s - ${correctionCount} cards corrected`);
          setCurrentStep(`AI correction complete (${aiTime}s, ${correctionCount} corrections)`);
        } else {
          console.log('Skipping AI correction - no cards extracted');
          setCurrentStep('Skipping AI correction (no cards found)');
        }

        setProgress(75);

        // Validate with Scryfall
        const scryfallStartTime = Date.now();
        setCurrentStep(`Validating ${cards.length} cards with Scryfall...`);

        // Update progress to Scryfall phase
        setProcessingProgress({
          currentCard: cards.length,
          totalCards: grid.length,
          currentPhase: 'Card Validation',
          currentCardName: `Validating ${cards.length} cards...`,
          currentPosition: { x: 0, y: 0 },
          batchNumber: batches.length,
          totalBatches: batches.length,
          currentPage: pageNumber,
          totalPages: images.length,
        });

        const correctedNames = cards.map(c => c.correctedName || c.kartenname);
        const scryfallResults = await searchCardsBatch(correctedNames);

        let scryfallMatches = 0;
        cards.forEach((card, i) => {
          if (scryfallResults[i]) {
            card.scryfallMatch = scryfallResults[i] || undefined;
            // Use Scryfall name as final correction if found
            if (scryfallResults[i]) {
              card.correctedName = scryfallResults[i]!.name;
              scryfallMatches++;
            }
          }
        });

        const scryfallTime = ((Date.now() - scryfallStartTime) / 1000).toFixed(1);
        console.log(`Scryfall validation completed in ${scryfallTime}s - ${scryfallMatches}/${cards.length} matches`);

        setProgress(100);

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Processing complete in ${totalTime}s - ${cards.length} cards extracted`);
        setCurrentStep(`Complete! Processed ${cards.length} cards in ${totalTime}s`);

        // Update progress to complete
        setProcessingProgress({
          currentCard: cards.length,
          totalCards: grid.length,
          currentPhase: 'Complete',
          currentCardName: `${cards.length} cards processed`,
          currentPosition: { x: 0, y: 0 },
          batchNumber: batches.length,
          totalBatches: batches.length,
          currentPage: pageNumber,
          totalPages: images.length,
        });

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
      // Keep progress visible for a moment, then clear it
      setTimeout(() => setProcessingProgress(null), 2000);
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

      {processingProgress && (
        <div className="mt-4" ref={progressIndicatorRef}>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">
                    Processing Cards: {processingProgress.currentCard}/{processingProgress.totalCards}
                  </span>
                  <span className="text-sm text-gray-400">
                    {Math.round((processingProgress.currentCard / processingProgress.totalCards) * 100)}%
                  </span>
                </div>
                <div
                  className="w-full rounded-full mb-3"
                  style={{
                    backgroundColor: '#374151',
                    height: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(2, (processingProgress.currentCard / processingProgress.totalCards) * 100)}%`,
                      backgroundColor: '#3b82f6',
                      height: '12px',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease-in-out',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                </div>
                <div className="space-y-1">
                  {processingProgress.totalPages && processingProgress.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Page:</span>
                      <span className="text-xs font-medium text-green-400">
                        {processingProgress.currentPage}/{processingProgress.totalPages}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Current Phase:</span>
                    <span className="text-xs font-medium text-blue-400">
                      {processingProgress.currentPhase}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Batch:</span>
                    <span className="text-xs text-gray-300">
                      {processingProgress.batchNumber}/{processingProgress.totalBatches}
                    </span>
                  </div>
                  {processingProgress.currentCardName && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Card:</span>
                      <span className="text-xs text-gray-300 font-mono">
                        "{processingProgress.currentCardName}" (Row {processingProgress.currentPosition.y}, Col {processingProgress.currentPosition.x})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {processingCanvas && debugMode && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">Processing Visualization</h3>
          <p className="text-sm text-gray-400 mb-2">
            🟡 Yellow = Processing | 🟢 Green = Success | 🔴 Red = Error | ⚪ Gray = Empty
          </p>
          <img src={processingCanvas} alt="Processing visualization" className="w-full border border-gray-700 rounded" />
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
