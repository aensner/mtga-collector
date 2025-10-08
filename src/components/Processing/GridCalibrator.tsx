import React, { useRef, useState, useEffect } from 'react';

interface GridCalibratorProps {
  imageUrl: string;
  onGridParamsChange: (params: {
    startX: number;
    startY: number;
    gridWidth: number;
    gridHeight: number;
    cardGapX: number;
    cardGapY: number;
  }) => void;
  ocrParams: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  initialGridParams?: {
    startX: number;
    startY: number;
    gridWidth: number;
    gridHeight: number;
    cardGapX: number;
    cardGapY: number;
  };
}

export const GridCalibrator: React.FC<GridCalibratorProps> = ({ imageUrl, onGridParamsChange, ocrParams, initialGridParams }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const lastEmittedParams = useRef<string>('');

  // Grid parameters (in percentage of image dimensions) - initialize from props or defaults
  const [gridX, setGridX] = useState(initialGridParams?.startX || 0.027);
  const [gridY, setGridY] = useState(initialGridParams?.startY || 0.193);
  const [gridWidth, setGridWidth] = useState(initialGridParams?.gridWidth || 0.945);
  const [gridHeight, setGridHeight] = useState(initialGridParams?.gridHeight || 0.788);
  const [cardGapX, setCardGapX] = useState(initialGridParams?.cardGapX || 0.008); // Gap between cards horizontally (0.8%)
  const [cardGapY, setCardGapY] = useState(initialGridParams?.cardGapY || 0.036); // Gap between cards vertically (3.6%)

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const COLUMNS = 12;
  const ROWS = 3;

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw the grid overlay
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Calculate grid dimensions in pixels
    const startX = image.width * gridX;
    const startY = image.height * gridY;
    const totalWidth = image.width * gridWidth;
    const totalHeight = image.height * gridHeight;

    // Draw grid outline (draggable/resizable boundary)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, totalWidth, totalHeight);

    // Draw resize handles
    const handleSize = 12;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';

    // Corner handles
    ctx.fillRect(startX - handleSize / 2, startY - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(startX + totalWidth - handleSize / 2, startY - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(startX - handleSize / 2, startY + totalHeight - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(startX + totalWidth - handleSize / 2, startY + totalHeight - handleSize / 2, handleSize, handleSize);

    // Calculate individual card dimensions with gaps
    const availableWidth = totalWidth - (cardGapX * image.width * (COLUMNS - 1));
    const availableHeight = totalHeight - (cardGapY * image.height * (ROWS - 1));
    const cardWidth = availableWidth / COLUMNS;
    const cardHeight = availableHeight / ROWS;

    // Draw all card slots
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const x = startX + col * (cardWidth + cardGapX * image.width);
        const y = startY + row * (cardHeight + cardGapY * image.height);

        // Draw card boundary in blue
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        // Draw OCR name region in red
        const nameRegion = {
          left: x + cardWidth * ocrParams.left,
          top: y + cardHeight * ocrParams.top,
          width: cardWidth * ocrParams.width,
          height: cardHeight * ocrParams.height,
        };

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.lineWidth = 3;
        ctx.strokeRect(nameRegion.left, nameRegion.top, nameRegion.width, nameRegion.height);

        // Draw card number
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.font = '14px Arial';
        const cardNum = row * COLUMNS + col + 1;
        ctx.fillText(`${cardNum}`, x + 5, y + 20);
      }
    }

    // Emit parameters only if they changed
    const currentParams = JSON.stringify({
      startX: gridX,
      startY: gridY,
      gridWidth,
      gridHeight,
      cardGapX,
      cardGapY,
    });

    if (currentParams !== lastEmittedParams.current) {
      lastEmittedParams.current = currentParams;
      onGridParamsChange({
        startX: gridX,
        startY: gridY,
        gridWidth,
        gridHeight,
        cardGapX,
        cardGapY,
      });
    }
  }, [image, gridX, gridY, gridWidth, gridHeight, cardGapX, cardGapY, ocrParams, onGridParamsChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const startX = image.width * gridX;
    const startY = image.height * gridY;
    const totalWidth = image.width * gridWidth;
    const totalHeight = image.height * gridHeight;

    const handleSize = 12;

    // Check if clicking on resize handles
    if (Math.abs(mouseX - startX) < handleSize && Math.abs(mouseY - startY) < handleSize) {
      setIsResizing(true);
      setResizeHandle('top-left');
    } else if (Math.abs(mouseX - (startX + totalWidth)) < handleSize && Math.abs(mouseY - startY) < handleSize) {
      setIsResizing(true);
      setResizeHandle('top-right');
    } else if (Math.abs(mouseX - startX) < handleSize && Math.abs(mouseY - (startY + totalHeight)) < handleSize) {
      setIsResizing(true);
      setResizeHandle('bottom-left');
    } else if (Math.abs(mouseX - (startX + totalWidth)) < handleSize && Math.abs(mouseY - (startY + totalHeight)) < handleSize) {
      setIsResizing(true);
      setResizeHandle('bottom-right');
    } else if (mouseX >= startX && mouseX <= startX + totalWidth && mouseY >= startY && mouseY <= startY + totalHeight) {
      // Inside grid - start dragging
      setIsDragging(true);
      setDragStart({ x: mouseX - startX, y: mouseY - startY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = image.width / rect.width;
    const scaleY = image.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (isDragging) {
      // Move the entire grid
      const newX = (mouseX - dragStart.x) / image.width;
      const newY = (mouseY - dragStart.y) / image.height;
      setGridX(Math.max(0, Math.min(1 - gridWidth, newX)));
      setGridY(Math.max(0, Math.min(1 - gridHeight, newY)));
    } else if (isResizing && resizeHandle) {
      const startX = image.width * gridX;
      const startY = image.height * gridY;

      if (resizeHandle === 'top-left') {
        const newWidth = gridWidth - (mouseX - startX) / image.width;
        const newHeight = gridHeight - (mouseY - startY) / image.height;
        if (newWidth > 0.1) {
          setGridX(mouseX / image.width);
          setGridWidth(newWidth);
        }
        if (newHeight > 0.1) {
          setGridY(mouseY / image.height);
          setGridHeight(newHeight);
        }
      } else if (resizeHandle === 'top-right') {
        const newWidth = (mouseX - startX) / image.width;
        const newHeight = gridHeight - (mouseY - startY) / image.height;
        if (newWidth > 0.1) setGridWidth(newWidth);
        if (newHeight > 0.1) {
          setGridY(mouseY / image.height);
          setGridHeight(newHeight);
        }
      } else if (resizeHandle === 'bottom-left') {
        const newWidth = gridWidth - (mouseX - startX) / image.width;
        const newHeight = (mouseY - startY) / image.height;
        if (newWidth > 0.1) {
          setGridX(mouseX / image.width);
          setGridWidth(newWidth);
        }
        if (newHeight > 0.1) setGridHeight(newHeight);
      } else if (resizeHandle === 'bottom-right') {
        const newWidth = (mouseX - startX) / image.width;
        const newHeight = (mouseY - startY) / image.height;
        if (newWidth > 0.1) setGridWidth(newWidth);
        if (newHeight > 0.1) setGridHeight(newHeight);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white mb-2">Interactive Grid Calibration</h3>
        <p className="text-xs text-gray-400 mb-2">
          • Drag the green outline to move the grid<br />
          • Drag the green corners to resize<br />
          • Use sliders below to adjust card spacing
        </p>
      </div>

      <div className="border border-gray-600 rounded overflow-auto max-h-[500px] mb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full cursor-move"
        />
      </div>

      {/* Display current grid position and size */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-xs font-semibold text-white mb-2">Grid Position & Size (Green Box)</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div>Start X: {(gridX * 100).toFixed(1)}%</div>
          <div>Start Y: {(gridY * 100).toFixed(1)}%</div>
          <div>Width: {(gridWidth * 100).toFixed(1)}%</div>
          <div>Height: {(gridHeight * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-400">Card Gap X (Horizontal: {(cardGapX * 100).toFixed(1)}%)</label>
          <input
            type="range"
            min="0"
            max="0.02"
            step="0.001"
            value={cardGapX}
            onChange={(e) => setCardGapX(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Card Gap Y (Vertical: {(cardGapY * 100).toFixed(1)}%)</label>
          <input
            type="range"
            min="0"
            max="0.10"
            step="0.001"
            value={cardGapY}
            onChange={(e) => setCardGapY(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
