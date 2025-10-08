# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MTGA Arena Collection Scanner** - A full-stack web application for scanning and digitizing Magic: The Gathering Arena collection screenshots using OCR and AI.

## Features

### Core Functionality
- **Screenshot Upload**: Drag-and-drop interface for MTG Arena collection screenshots
- **OCR Processing**: Extracts card names from screenshots using Tesseract.js
- **AI Correction**: Uses Anthropic Claude API (Sonnet 4.5) to correct OCR errors in card names
- **Card Validation**: Validates card names against Scryfall database
- **Quantity Detection**: Automatically detects card quantities from diamond indicators
- **Grid Detection**: Detects 12-column x 3-row card layout (36 cards per page)
- **Interactive Results**: Editable table for manual corrections
- **Export**: CSV and JSON export functionality
- **Accuracy Testing**: Load test data and compare against OCR results

### Calibration System
- **Interactive Grid Calibrator**: Draggable/resizable overlay for positioning the card grid
  - Green outline with corner handles for drag/resize
  - Blue boxes showing all 36 individual card slots
  - Card gap adjustment sliders for horizontal/vertical spacing
- **OCR Region Calibration**: Adjust where OCR reads card names within each card
  - Red boxes show live preview of OCR regions
  - Four sliders: Left Offset, Top Offset, Width, Height
  - Updates in real-time on all 36 cards
- **Persistent Settings**: All calibration values saved to localStorage

### Debug Mode
- Enable via checkbox to access calibration tools
- Live preview canvas showing grid and OCR regions
- Card numbering (1-36) for easy reference

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **OCR**: Tesseract.js
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Card Database**: Scryfall API
- **Authentication**: Supabase Auth (currently disabled for development)

## Data Format

The CSV export format includes:
- **Nummer**: Card number/ID (1-36)
- **Position X**: Column position (1-12)
- **Position Y**: Row position (1-3)
- **Kartenname**: Card name
- **Anzahl**: Quantity owned (1-4)

Cards are arranged in a 12-column x 3-row grid (36 cards per screenshot), with gaps between cards.

## File Structure

```
src/
├── components/
│   ├── Auth/              # Authentication (Supabase)
│   ├── Processing/
│   │   ├── CardProcessor.tsx       # Main processing logic
│   │   ├── GridCalibrator.tsx      # Interactive grid calibration
│   │   └── QuantityCalibrator.tsx  # Interactive quantity calibration
│   ├── Results/           # Results display and export
│   └── Upload/            # Image upload interface
├── services/
│   ├── ocr.ts            # Tesseract.js OCR
│   ├── anthropic.ts      # Claude AI correction
│   ├── scryfall.ts       # Card validation
│   └── imageProcessing.ts # Grid detection & quantity
├── utils/
│   ├── csvParser.ts      # CSV import/export
│   └── accuracyTester.ts # Test data comparison
└── types.ts              # TypeScript interfaces

example/
└── MTG Arena Collection Page 10 - Test data - Tabellenblatt1.csv
```

## Development Setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open: http://localhost:5173

## Environment Variables

Create `.env` file:
```
VITE_ANTHROPIC_API_KEY=your_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Calibration Values (Defaults)

### Grid Parameters (saved to localStorage)
- `startX`: 0.027 (2.7% from left edge)
- `startY`: 0.193 (19.3% from top edge)
- `gridWidth`: 0.945 (94.5% of image width)
- `gridHeight`: 0.788 (78.8% of image height)
- `cardGapX`: 0.008 (0.8% horizontal gap between cards)
- `cardGapY`: 0.036 (3.6% vertical gap between cards)

### OCR Region Parameters (saved to localStorage)
- `ocrLeft`: 0.05 (5% from card left edge)
- `ocrTop`: 0.043 (4.3% from card top edge)
- `ocrWidth`: 0.80 (80% of card width)
- `ocrHeight`: 0.075 (7.5% of card height)

### Quantity Detection Parameters (saved to localStorage)
- `offsetX`: 0.0 (0% - uses full card width)
- `offsetY`: 0.08 (8% above card)
- `width`: 1.0 (100% of card width)
- `height`: 0.06 (6% of card height)
- `brightnessThreshold`: 100 (max brightness for dark pixels)
- `saturationThreshold`: 50 (max saturation for grey/neutral pixels)
- `fillRatioThreshold`: 0.15 (15% - minimum % of zone pixels to count as filled)

**Algorithm**: Splits diamond region into 4 horizontal zones. For each zone, counts pixels that are BOTH dark (brightness < 100) AND grey (saturation < 50). If zone has >15% dark-grey pixels, it's counted as filled. Filled diamonds have near-black filling; empty diamonds are transparent showing background color.

## Usage Workflow

1. Upload MTG Arena collection screenshot
2. (Optional) Enable Debug Mode and calibrate:
   - **Section 1**: Grid positioning and card spacing
   - **Section 2**: OCR name region positioning
   - **Section 3**: Quantity detection calibration with real-time preview
3. Click "Process" to extract card data
4. Review and manually edit results if needed
5. (Optional) Load test data to check accuracy
6. Export to CSV or JSON

## Known Issues

- Authentication is currently disabled (line 154-156 in App.tsx)
- Quantity detection accuracy depends on calibration - use Section 3 in Debug Mode to fine-tune
- OCR works best with high-resolution screenshots
- localStorage migration may require manual clearing if old parameters persist
