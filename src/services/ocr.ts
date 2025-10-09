import Tesseract, { Worker } from 'tesseract.js';
import type { OCRResult } from '../types';

let workers: Worker[] = [];
const WORKER_POOL_SIZE = 4; // Number of parallel OCR workers

export const initializeOCR = async (): Promise<void> => {
  if (workers.length > 0) return;

  console.log(`Initializing ${WORKER_POOL_SIZE} OCR workers...`);
  const workerPromises = [];

  for (let i = 0; i < WORKER_POOL_SIZE; i++) {
    const workerPromise = Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Reduce log spam from multiple workers
          if (m.progress === 0 || m.progress === 1) {
            console.log(`OCR Worker ${i + 1}: ${m.status}`);
          }
        }
      },
    }).then(async (worker) => {
      // Configure for better card name recognition
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\' -,',
      });
      return worker;
    });

    workerPromises.push(workerPromise);
  }

  workers = await Promise.all(workerPromises);
  console.log(`${workers.length} OCR workers initialized`);
};

export const terminateOCR = async (): Promise<void> => {
  if (workers.length > 0) {
    console.log(`Terminating ${workers.length} OCR workers...`);
    await Promise.all(workers.map(w => w.terminate()));
    workers = [];
  }
};

let workerIndex = 0; // Round-robin worker selection

export const recognizeText = async (
  imageData: string | HTMLCanvasElement | HTMLImageElement,
  rectangle?: { left: number; top: number; width: number; height: number },
  workerIdx?: number // Optional: specify which worker to use
): Promise<OCRResult> => {
  if (workers.length === 0) {
    await initializeOCR();
  }

  if (workers.length === 0) {
    throw new Error('OCR workers not initialized');
  }

  // Use specified worker or round-robin selection
  const selectedWorkerIdx = workerIdx !== undefined ? workerIdx : workerIndex;
  const worker = workers[selectedWorkerIdx % workers.length];

  // Increment for next call (round-robin)
  if (workerIdx === undefined) {
    workerIndex = (workerIndex + 1) % workers.length;
  }

  const { data } = await worker.recognize(imageData, rectangle ? { rectangle } : undefined);

  return {
    text: data.text.trim(),
    confidence: data.confidence,
    bbox: {
      x0: data.bbox?.x0 || 0,
      y0: data.bbox?.y0 || 0,
      x1: data.bbox?.x1 || 0,
      y1: data.bbox?.y1 || 0,
    },
  };
};

export const recognizeCardName = async (
  canvas: HTMLCanvasElement,
  cardBbox: { x: number; y: number; width: number; height: number },
  debugVisualize: boolean = false,
  regionParams?: { left: number; top: number; width: number; height: number }
): Promise<{ text: string; confidence: number }> => {
  // Card name is in the top center title bar of the card
  // Use provided parameters or defaults
  const params = regionParams || { left: 0.05, top: 0.043, width: 0.80, height: 0.075 };

  const nameRegion = {
    left: cardBbox.x + cardBbox.width * params.left,
    top: cardBbox.y + cardBbox.height * params.top,
    width: cardBbox.width * params.width,
    height: cardBbox.height * params.height,
  };

  // Debug visualization - draw the region being read
  if (debugVisualize) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(nameRegion.left, nameRegion.top, nameRegion.width, nameRegion.height);

      // Also draw the full card bbox in blue
      ctx.strokeStyle = 'blue';
      ctx.strokeRect(cardBbox.x, cardBbox.y, cardBbox.width, cardBbox.height);
    }
  }

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
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

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
