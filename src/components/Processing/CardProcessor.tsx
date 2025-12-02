import React, { useState, useEffect, useRef } from 'react';
import type { CardData, ProcessingResult, UploadedImage, CalibrationSettings } from '../../types';
import { initializeOCR, recognizeCardName, terminateOCR, preprocessImage } from '../../services/ocr';
import { detectCardGrid, detectCardQuantity, isCardSlotEmpty } from '../../services/imageProcessing';
import { searchCardsBatch } from '../../services/scryfall';
import { loadCalibrationSettings, saveCalibrationSettings } from '../../services/database';
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
  currentPhase: 'OCR' | 'Card Validation' | 'Complete';
  currentCardName: string;
  currentPosition: { x: number; y: number };
  batchNumber: number;
  totalBatches: number;
  currentPage?: number;
  totalPages?: number;
  overallCardsProcessed?: number;
  overallTotalCards?: number;
}

export const CardProcessor: React.FC<CardProcessorProps> = ({ images, onProcessingComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [debugCanvas, setDebugCanvas] = useState<string | null>(null);
  const [processingCanvas, setProcessingCanvas] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const loadCalibration = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [ocrLeft, setOcrLeft] = useState(() => loadCalibration('ocrLeft', 0.05));
  const [ocrTop, setOcrTop] = useState(() => loadCalibration('ocrTop', 0.043));
  const [ocrWidth, setOcrWidth] = useState(() => loadCalibration('ocrWidth', 0.80));
  const [ocrHeight, setOcrHeight] = useState(() => loadCalibration('ocrHeight', 0.075));

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

  const [quantityParams, setQuantityParams] = useState(() => {
    const saved = localStorage.getItem('quantityParams');
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved);
        if ('saturationThreshold' in parsedSaved && 'fillRatioThreshold' in parsedSaved) {
          return parsedSaved;
        }
      } catch (e) {
        console.error('Failed to parse saved quantity params:', e);
      }
    }
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
    return newDefaults;
  });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);
  const progressIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const settings = await loadCalibrationSettings();
        if (settings) {
          setOcrLeft(settings.ocrLeft);
          setOcrTop(settings.ocrTop);
          setOcrWidth(settings.ocrWidth);
          setOcrHeight(settings.ocrHeight);
          setGridParams({
            startX: settings.startX,
            startY: settings.startY,
            gridWidth: settings.gridWidth,
            gridHeight: settings.gridHeight,
            cardGapX: settings.cardGapX,
            cardGapY: settings.cardGapY,
          });
          setQuantityParams({
            offsetX: settings.quantityOffsetX,
            offsetY: settings.quantityOffsetY,
            width: settings.quantityWidth,
            height: settings.quantityHeight,
            brightnessThreshold: settings.brightnessThreshold,
            saturationThreshold: settings.saturationThreshold,
            fillRatioThreshold: settings.fillRatioThreshold,
          });
        }
      } catch (error) {
        console.error('Failed to load calibration from database:', error);
      }
    };
    loadFromDatabase();
  }, []);

  useEffect(() => {
    if (!debugMode || !previewImage || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = previewImage.width;
    canvas.height = previewImage.height;
    ctx.drawImage(previewImage, 0, 0);
    const grid = detectCardGrid(previewImage, gridParams);
    const cardsToShow = Math.min(grid.length, 12);
    for (let i = 0; i < cardsToShow; i++) {
      const cell = grid[i];
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);
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

  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      const settings: CalibrationSettings = {
        startX: gridParams.startX,
        startY: gridParams.startY,
        gridWidth: gridParams.gridWidth,
        gridHeight: gridParams.gridHeight,
        cardGapX: gridParams.cardGapX,
        cardGapY: gridParams.cardGapY,
        ocrLeft,
        ocrTop,
        ocrWidth,
        ocrHeight,
        quantityOffsetX: quantityParams.offsetX,
        quantityOffsetY: quantityParams.offsetY,
        quantityWidth: quantityParams.width,
        quantityHeight: quantityParams.height,
        brightnessThreshold: quantityParams.brightnessThreshold,
        saturationThreshold: quantityParams.saturationThreshold,
        fillRatioThreshold: quantityParams.fillRatioThreshold,
      };
      try {
        await saveCalibrationSettings(settings);
        localStorage.setItem('ocrLeft', JSON.stringify(ocrLeft));
        localStorage.setItem('ocrTop', JSON.stringify(ocrTop));
        localStorage.setItem('ocrWidth', JSON.stringify(ocrWidth));
        localStorage.setItem('ocrHeight', JSON.stringify(ocrHeight));
        localStorage.setItem('gridParams', JSON.stringify(gridParams));
        localStorage.setItem('quantityParams', JSON.stringify(quantityParams));
      } catch (error) {
        console.error('Failed to save calibration to database:', error);
      }
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [ocrLeft, ocrTop, ocrWidth, ocrHeight, gridParams, quantityParams]);

  useEffect(() => {
    if (images.length > 0 && !previewImage) {
      const img = new Image();
      img.onload = () => setPreviewImage(img);
      img.src = images[0].preview;
    }
  }, [images, previewImage]);

  useEffect(() => {
    if (processingProgress && progressIndicatorRef.current) {
      progressIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [processingProgress]);

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
    ctx.drawImage(img, 0, 0);
    grid.forEach((cell, idx) => {
      const status = cardStatuses.get(idx) || 'pending';
      let borderColor = '';
      let fillColor = '';
      switch (status) {
        case 'processing':
          borderColor = 'rgba(255, 215, 0, 0.9)';
          fillColor = 'rgba(255, 215, 0, 0.15)';
          break;
        case 'success':
          borderColor = 'rgba(0, 255, 0, 0.7)';
          fillColor = 'rgba(0, 255, 0, 0.1)';
          break;
        case 'error':
          borderColor = 'rgba(255, 0, 0, 0.8)';
          fillColor = 'rgba(255, 0, 0, 0.15)';
          break;
        case 'empty':
          borderColor = 'rgba(128, 128, 128, 0.6)';
          fillColor = 'rgba(128, 128, 128, 0.1)';
          break;
        default:
          return;
      }
      ctx.fillStyle = fillColor;
      ctx.fillRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(cell.bbox.x, cell.bbox.y, cell.bbox.width, cell.bbox.height);
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

    const estimatedCardsPerPage = 36;
    const estimatedTotalCards = images.length * estimatedCardsPerPage;

    const calculateTotalCards = (results: ProcessingResult[], currentGridLength: number, remainingImages: number) => {
      return results.reduce((sum, r) => sum + r.totalCards, 0) + currentGridLength + remainingImages * estimatedCardsPerPage;
    };

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
      overallCardsProcessed: 0,
      overallTotalCards: estimatedTotalCards,
    });
    const startTime = Date.now();

    try {
      await initializeOCR();

      const results: ProcessingResult[] = [];
      let overallCardsProcessed = 0;

      for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
        const image = images[imgIndex];
        const pageNumber = imgIndex + 1;

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = image.preview;
        });

        const canvas = preprocessImage(img);
        const grid = detectCardGrid(img, gridParams);

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
          overallCardsProcessed,
          overallTotalCards: calculateTotalCards(results, grid.length, images.length - imgIndex - 1),
        });

        const originalCanvas = document.createElement('canvas');
        const originalCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
        if (!originalCtx) {
          throw new Error('Could not get canvas context for quantity detection');
        }
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCtx.drawImage(img, 0, 0);

        const cards: CardData[] = [];
        const ocrStartTime = Date.now();
        const cardStatuses = new Map<number, CardStatus>();

        (window as any)._cardCounter = 0;
        (window as any)._emptyCheckCounter = 0;

        const BATCH_SIZE = 4;
        const batches = [];
        for (let i = 0; i < grid.length; i += BATCH_SIZE) {
          batches.push(grid.slice(i, i + BATCH_SIZE));
        }

        for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
          const batch = batches[batchIdx];

          for (let cellIdx = 0; cellIdx < batch.length; cellIdx++) {
            const cardIndex = batchIdx * BATCH_SIZE + cellIdx;
            cardStatuses.set(cardIndex, 'processing');
          }

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
            overallCardsProcessed: overallCardsProcessed + firstCardIndex + 1,
            overallTotalCards: calculateTotalCards(results, grid.length, images.length - imgIndex - 1),
          });

          if (debugMode) {
            const overlayCanvas = drawCardStatusOverlay(img, grid, cardStatuses);
            setProcessingCanvas(overlayCanvas);
          }

          const batchPromises = batch.map(async (cell, cellIdx) => {
            const cardIndex = batchIdx * BATCH_SIZE + cellIdx;
            const cardStartTime = Date.now();

            try {
              const isEmpty = isCardSlotEmpty(originalCanvas, cell.bbox);
              if (isEmpty) {
                const cardTime = Date.now() - cardStartTime;
                return { empty: true, cardTime };
              }

              const { text, confidence } = await recognizeCardName(
                canvas,
                cell.bbox,
                debugMode,
                { left: ocrLeft, top: ocrTop, width: ocrWidth, height: ocrHeight }
              );

              const quantity = detectCardQuantity(originalCanvas, cell.bbox, quantityParams);
              const cardTime = Date.now() - cardStartTime;

              const ocrRegion = {
                x: Math.round(cell.bbox.x + cell.bbox.width * ocrLeft),
                y: Math.round(cell.bbox.y + cell.bbox.height * ocrTop),
                width: Math.round(cell.bbox.width * ocrWidth),
                height: Math.round(cell.bbox.height * ocrHeight),
              };

              const ocrCanvas = document.createElement('canvas');
              ocrCanvas.width = ocrRegion.width;
              ocrCanvas.height = ocrRegion.height;
              const ocrCtx = ocrCanvas.getContext('2d');
              if (ocrCtx) {
                ocrCtx.drawImage(
                  canvas,
                  ocrRegion.x, ocrRegion.y, ocrRegion.width, ocrRegion.height,
                  0, 0, ocrRegion.width, ocrRegion.height
                );
              }
              const ocrRegionImage = ocrCanvas.toDataURL('image/png');
              const cardName = text.trim().length > 0 ? text : `[OCR Failed - Position ${cell.x},${cell.y}]`;

              return {
                nummer: cardIndex + 1,
                positionX: cell.x,
                positionY: cell.y,
                kartenname: cardName,
                anzahl: quantity,
                confidence,
                cardTime,
                pageNumber,
                screenshotFilename: image.file.name,
                ocrRegion,
                ocrRegionImage,
              };
            } catch (error) {
              console.error(`Error processing card at ${cell.x},${cell.y}:`, error);
              return { error: true, cardTime: Date.now() - cardStartTime };
            }
          });

          const batchResults = await Promise.all(batchPromises);

          let lastSuccessCard: any = null;
          batchResults.forEach((result: any, idx) => {
            const cardIndex = batchIdx * BATCH_SIZE + idx;
            if (result && !result.empty && !result.error) {
              cards.push(result);
              cardStatuses.set(cardIndex, 'success');
              lastSuccessCard = result;
            } else if (result && result.empty) {
              cardStatuses.set(cardIndex, 'empty');
            } else if (result && result.error) {
              cardStatuses.set(cardIndex, 'error');
            }
          });

          if (lastSuccessCard) {
            const currentCardInPage = batchIdx * BATCH_SIZE + batchResults.length;
            setProcessingProgress({
              currentCard: currentCardInPage,
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
              overallCardsProcessed: overallCardsProcessed + currentCardInPage,
              overallTotalCards: calculateTotalCards(results, grid.length, images.length - imgIndex - 1),
            });
          }

          if (debugMode) {
            const overlayCanvas = drawCardStatusOverlay(img, grid, cardStatuses);
            setProcessingCanvas(overlayCanvas);
          }

          const processed = Math.min((batchIdx + 1) * BATCH_SIZE, grid.length);
          setProgress(Math.round((processed / grid.length) * 50));
        }

        const ocrTotalTime = ((Date.now() - ocrStartTime) / 1000).toFixed(1);
        console.log(`Parallel OCR completed in ${ocrTotalTime}s - Extracted ${cards.length} cards`);

        setProgress(75);

        const scryfallStartTime = Date.now();

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
          overallCardsProcessed: overallCardsProcessed + grid.length,
          overallTotalCards: calculateTotalCards(results, grid.length, images.length - imgIndex - 1),
        });

        const cardNames = cards.map(c => c.kartenname);
        const scryfallResults = await searchCardsBatch(cardNames);

        let scryfallMatches = 0;
        let unmatchedCards: string[] = [];

        cards.forEach((card, i) => {
          if (scryfallResults[i]) {
            card.scryfallMatch = scryfallResults[i] || undefined;
            card.correctedName = scryfallResults[i]!.name;
            scryfallMatches++;
          } else {
            card.scryfallMatch = undefined;
            unmatchedCards.push(card.kartenname);
          }
        });

        const scryfallTime = ((Date.now() - scryfallStartTime) / 1000).toFixed(1);
        console.log(`Scryfall validation completed in ${scryfallTime}s - ${scryfallMatches}/${cards.length} matches`);

        if (unmatchedCards.length > 0) {
          console.warn(`${unmatchedCards.length} cards not found in Scryfall:`, unmatchedCards);
        }

        setProgress(100);

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Processing complete in ${totalTime}s - ${cards.length} cards extracted`);

        overallCardsProcessed += grid.length;

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
          overallCardsProcessed,
          overallTotalCards: calculateTotalCards(results, grid.length, images.length - imgIndex - 1),
        });

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
      setTimeout(() => setProcessingProgress(null), 2000);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'OCR': return 'var(--accent-primary)';
      case 'Card Validation': return 'var(--accent-secondary)';
      case 'Complete': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Mode Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors"
               style={{
                 background: debugMode ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                 borderColor: debugMode ? 'var(--accent-primary)' : 'var(--border-primary)',
                 border: '1px solid'
               }}>
            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform bg-white shadow-sm"
                 style={{ transform: debugMode ? 'translateX(16px)' : 'translateX(0)' }} />
          </div>
        </div>
        <span className="text-small">Debug Mode (visualize OCR regions)</span>
      </label>

      {/* Debug Calibration Panel */}
      {debugMode && images.length > 0 && (
        <div className="card">
          <div className="card-body space-y-6">
            {/* Grid Calibration */}
            <div>
              <h3 className="heading-sm mb-4">1. Grid Calibration</h3>
              <GridCalibrator
                imageUrl={images[0].preview}
                onGridParamsChange={setGridParams}
                initialGridParams={gridParams}
                ocrParams={{ left: ocrLeft, top: ocrTop, width: ocrWidth, height: ocrHeight }}
              />
            </div>

            <hr style={{ borderColor: 'var(--border-primary)' }} />

            {/* OCR Region */}
            <div>
              <h3 className="heading-sm mb-2">2. OCR Name Region</h3>
              <p className="text-caption mb-4">Adjust where OCR reads the card names within each card.</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Left Offset ({(ocrLeft * 100).toFixed(1)}%)</label>
                  <input type="range" min="0" max="0.3" step="0.01" value={ocrLeft}
                         onChange={(e) => setOcrLeft(parseFloat(e.target.value))}
                         className="w-full accent-[var(--accent-primary)]" />
                </div>
                <div className="form-group">
                  <label className="form-label">Top Offset ({(ocrTop * 100).toFixed(1)}%)</label>
                  <input type="range" min="0" max="0.1" step="0.001" value={ocrTop}
                         onChange={(e) => setOcrTop(parseFloat(e.target.value))}
                         className="w-full accent-[var(--accent-primary)]" />
                </div>
                <div className="form-group">
                  <label className="form-label">Width ({(ocrWidth * 100).toFixed(1)}%)</label>
                  <input type="range" min="0.4" max="0.95" step="0.01" value={ocrWidth}
                         onChange={(e) => setOcrWidth(parseFloat(e.target.value))}
                         className="w-full accent-[var(--accent-primary)]" />
                </div>
                <div className="form-group">
                  <label className="form-label">Height ({(ocrHeight * 100).toFixed(1)}%)</label>
                  <input type="range" min="0.02" max="0.15" step="0.001" value={ocrHeight}
                         onChange={(e) => setOcrHeight(parseFloat(e.target.value))}
                         className="w-full accent-[var(--accent-primary)]" />
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-primary)' }} />

            {/* Quantity Detection */}
            <div>
              <h3 className="heading-sm mb-4">3. Quantity Detection</h3>
              <QuantityCalibrator
                imageUrl={images[0].preview}
                gridParams={gridParams}
                onQuantityParamsChange={setQuantityParams}
                initialQuantityParams={quantityParams}
              />
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      <button
        onClick={processImages}
        disabled={processing || images.length === 0}
        className="btn btn-primary w-full py-3"
      >
        {processing ? `Processing... ${progress}%` : `Process ${images.length} Image(s)`}
      </button>

      {/* Progress Indicator */}
      {processingProgress && (
        <div ref={progressIndicatorRef} className="animate-fade-in py-8">
          {/* Centered Circular Progress */}
          <div className="flex flex-col items-center justify-center">
            {/* Circular Progress Ring */}
            <div className="relative mb-6" style={{ width: '120px', height: '120px' }}>
              <svg width="120" height="120" className="transform -rotate-90 absolute inset-0">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={getPhaseColor(processingProgress.currentPhase)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - (
                    processingProgress.overallTotalCards && processingProgress.totalPages && processingProgress.totalPages > 1
                      ? processingProgress.overallCardsProcessed! / processingProgress.overallTotalCards
                      : processingProgress.currentCard / processingProgress.totalCards
                  ))}`}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease',
                    filter: `drop-shadow(0 0 6px ${getPhaseColor(processingProgress.currentPhase)})`
                  }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: getPhaseColor(processingProgress.currentPhase) }}>
                  {processingProgress.overallTotalCards && processingProgress.totalPages && processingProgress.totalPages > 1
                    ? Math.round((processingProgress.overallCardsProcessed! / processingProgress.overallTotalCards) * 100)
                    : Math.round((processingProgress.currentCard / processingProgress.totalCards) * 100)}%
                </span>
              </div>
            </div>

            {/* Phase Label */}
            <div className="text-center mb-4">
              <span className="text-body font-medium" style={{ color: getPhaseColor(processingProgress.currentPhase) }}>
                {processingProgress.currentPhase}
              </span>
              {processingProgress.totalPages && processingProgress.totalPages > 1 && (
                <span className="text-caption ml-2" style={{ color: 'var(--text-muted)' }}>
                  · Page {processingProgress.currentPage}/{processingProgress.totalPages}
                </span>
              )}
            </div>

            {/* Minimal Stats */}
            <div className="flex items-center gap-4 text-caption" style={{ color: 'var(--text-muted)' }}>
              <span>{processingProgress.currentCard}/{processingProgress.totalCards} cards</span>
              <span>·</span>
              <span>Batch {processingProgress.batchNumber}/{processingProgress.totalBatches}</span>
            </div>

            {/* Current Card Name (subtle) */}
            {processingProgress.currentCardName && processingProgress.currentPhase !== 'Complete' && (
              <p className="mt-3 text-caption font-mono truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                {processingProgress.currentCardName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Debug Visualization */}
      {processingCanvas && debugMode && (
        <div className="card">
          <div className="card-header">
            <h3 className="heading-sm">Processing Visualization</h3>
          </div>
          <div className="card-body">
            <div className="flex gap-4 mb-3">
              <span className="badge badge-warning">Processing</span>
              <span className="badge badge-success">Success</span>
              <span className="badge badge-error">Error</span>
              <span className="badge badge-neutral">Empty</span>
            </div>
            <img src={processingCanvas} alt="Processing visualization"
                 className="w-full rounded-lg" style={{ border: '1px solid var(--border-primary)' }} />
          </div>
        </div>
      )}

      {debugCanvas && (
        <div className="card">
          <div className="card-header">
            <h3 className="heading-sm">Debug Visualization</h3>
          </div>
          <div className="card-body">
            <p className="text-caption mb-3">
              Blue boxes = detected card areas | Red boxes = OCR reading regions
            </p>
            <img src={debugCanvas} alt="Debug visualization"
                 className="w-full rounded-lg" style={{ border: '1px solid var(--border-primary)' }} />
          </div>
        </div>
      )}
    </div>
  );
};
