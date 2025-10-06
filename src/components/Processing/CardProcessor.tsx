import React, { useState } from 'react';
import { CardData, ProcessingResult, UploadedImage } from '../../types';
import { initializeOCR, recognizeCardName, terminateOCR, preprocessImage } from '../../services/ocr';
import { detectCardGrid, detectCardQuantity } from '../../services/imageProcessing';
import { correctCardNamesBatch } from '../../services/anthropic';
import { searchCardsBatch } from '../../services/scryfall';

interface CardProcessorProps {
  images: UploadedImage[];
  onProcessingComplete: (results: ProcessingResult[]) => void;
}

export const CardProcessor: React.FC<CardProcessorProps> = ({ images, onProcessingComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

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

        // Preprocess and detect grid
        setCurrentStep(`Detecting card grid in image ${imgIndex + 1}...`);
        const canvas = preprocessImage(img);
        const grid = detectCardGrid(img);

        // Extract cards
        setCurrentStep(`Extracting ${grid.length} cards...`);
        const cards: CardData[] = [];

        for (let i = 0; i < grid.length; i++) {
          const cell = grid[i];

          try {
            // OCR card name
            const { text, confidence } = await recognizeCardName(canvas, cell.bbox);

            // Detect quantity
            const quantity = detectCardQuantity(canvas, cell.bbox);

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

        // AI correction
        setCurrentStep('Correcting card names with AI...');
        const cardNames = cards.map(c => c.kartenname);
        const corrections = await correctCardNamesBatch(cardNames);

        cards.forEach((card, i) => {
          if (corrections[i]) {
            card.correctedName = corrections[i].correctedName;
            card.confidence = (card.confidence || 0) * corrections[i].confidence;
          }
        });

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

        results.push({
          cards,
          totalCards: cards.length,
          processingTime: Date.now() - startTime,
        });
      }

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
    </div>
  );
};
