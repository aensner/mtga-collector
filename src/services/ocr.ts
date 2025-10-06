import Tesseract, { Worker } from 'tesseract.js';
import { OCRResult } from '../types';

let worker: Worker | null = null;

export const initializeOCR = async (): Promise<void> => {
  if (worker) return;

  worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  // Configure for better card name recognition
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\' -,',
  });
};

export const terminateOCR = async (): Promise<void> => {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
};

export const recognizeText = async (
  imageData: string | HTMLCanvasElement | HTMLImageElement,
  rectangle?: { left: number; top: number; width: number; height: number }
): Promise<OCRResult> => {
  if (!worker) {
    await initializeOCR();
  }

  if (!worker) {
    throw new Error('OCR worker not initialized');
  }

  const { data } = await worker.recognize(imageData, rectangle ? { rectangle } : undefined);

  return {
    text: data.text.trim(),
    confidence: data.confidence,
    bbox: {
      x0: data.bbox.x0,
      y0: data.bbox.y0,
      x1: data.bbox.x1,
      y1: data.bbox.y1,
    },
  };
};

export const recognizeCardName = async (
  canvas: HTMLCanvasElement,
  cardBbox: { x: number; y: number; width: number; height: number }
): Promise<{ text: string; confidence: number }> => {
  // Card name is typically in the top-left area of the card
  // Adjust these percentages based on the actual MTG Arena UI
  const nameRegion = {
    left: cardBbox.x + cardBbox.width * 0.05,
    top: cardBbox.y + cardBbox.height * 0.05,
    width: cardBbox.width * 0.6,
    height: cardBbox.height * 0.12,
  };

  const result = await recognizeText(canvas, nameRegion);
  return {
    text: result.text,
    confidence: result.confidence,
  };
};

export const preprocessImage = (
  image: HTMLImageElement,
  enhanceContrast: boolean = true
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  if (enhanceContrast) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple contrast enhancement
    const factor = 1.5;
    const intercept = 128 * (1 - factor);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept));     // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept)); // B
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
};
