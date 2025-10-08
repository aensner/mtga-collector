# MTG Arena Collection Scanner

A web application for scanning and digitizing Magic: The Gathering Arena collection screenshots using OCR and AI.

## Features

- 📸 **Screenshot Upload** - Drag and drop your MTG Arena collection screenshots
- 🔍 **OCR Processing** - Automatic card name extraction using Tesseract.js
- 🤖 **AI Correction** - Claude AI corrects OCR errors for accurate card names
- ✅ **Card Validation** - Validates against Scryfall database
- 🎯 **Quantity Detection** - Automatically detects card quantities (1-4)
- 🎚️ **Interactive Calibration** - Drag-and-resize grid overlay with live preview
- 📊 **Interactive Results** - Edit and review extracted data
- 📈 **Accuracy Testing** - Compare results against test data
- 💾 **Export** - Export to CSV or JSON format

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file (optional, for AI features)
cp .env.example .env
# Add your Anthropic API key to .env

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### Basic Workflow

1. **Upload Screenshot** - Take a screenshot of your MTG Arena collection page and upload it
2. **Process** - Click "Process" to extract card data
3. **Review** - Check the results and make manual corrections if needed
4. **Export** - Download as CSV or JSON

### Calibration (Optional)

If the default settings don't work well with your screenshots:

1. Enable **Debug Mode** checkbox
2. **Adjust the Grid**:
   - Drag the green outline to position the grid
   - Drag green corner handles to resize
   - Use sliders to adjust card spacing
3. **Adjust OCR Regions**:
   - Use sliders to position the red boxes over card names
   - See live preview on all 36 cards
4. Settings are automatically saved to your browser

### Accuracy Testing

1. Click **Load Test Data** to import ground truth
2. Process your screenshot
3. View accuracy metrics comparing extracted vs. expected data

## How It Works

### Image Processing Pipeline

1. **Upload**: User uploads MTG Arena collection screenshot(s)
2. **Grid Detection**: Detects the 12-column x 3-row card grid layout (36 cards)
3. **OCR**: Extracts text from each card name region using Tesseract.js
4. **Quantity Detection**: Counts filled diamonds above each card (1-4)
5. **AI Correction**: Sends OCR results to Claude API for error correction
6. **Validation**: Verifies card names against Scryfall database
7. **Results**: Displays interactive table with confidence scores

### Grid Detection

Cards are arranged in a 12-column x 3-row grid (36 cards per screenshot). The system:
- Calculates grid dimensions based on image size and calibration
- Accounts for UI margins and card spacing/gaps
- Reads cards from top-left to bottom-right
- Handles variable spacing between cards

### Quantity Detection

Filled diamonds above cards indicate quantity (1-4):
- Extracts region above each card
- Counts bright/white pixels (filled diamonds)
- Maps brightness ratio to quantity

## Configuration

### Environment Variables

```env
# Optional: Anthropic API for AI-powered name correction
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional: Supabase (currently disabled)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Getting API Keys:

**Anthropic:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and get your API key
3. Note: The app uses `dangerouslyAllowBrowser: true` for demo purposes. In production, use a backend proxy.

**Supabase (optional):**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon/public key

### Default Calibration Values

Grid and OCR calibration values are stored in localStorage and persist across sessions.

**Grid Parameters (all as % of image dimensions):**
- Start X: 1.5% from left
- Start Y: 23% from top
- Grid Width: 97% of image
- Grid Height: 65% of image
- Card Gap X: 0.5% horizontal spacing
- Card Gap Y: 1% vertical spacing

**OCR Region Parameters (as % of card dimensions):**
- Left Offset: 14% from card left edge
- Top Offset: 1.2% from card top edge
- Width: 74% of card width
- Height: 5.8% of card height

## Project Structure

```
src/
├── components/
│   ├── Auth/              # Supabase authentication
│   ├── Processing/
│   │   ├── CardProcessor.tsx      # Main processing logic
│   │   └── GridCalibrator.tsx     # Interactive calibration UI
│   ├── Results/           # Results display and export
│   └── Upload/            # File upload
├── services/
│   ├── ocr.ts            # Tesseract.js OCR
│   ├── anthropic.ts      # Claude AI correction
│   ├── scryfall.ts       # Card validation
│   └── imageProcessing.ts # Grid detection & quantity
├── utils/
│   ├── csvParser.ts      # CSV import/export
│   └── accuracyTester.ts # Accuracy testing
└── types.ts              # TypeScript interfaces

example/
└── MTG Arena Collection Page 10 - Test data - Tabellenblatt1.csv
```

## Tips for Best Results

- Use high-resolution screenshots (1920x1080 or higher)
- Ensure good contrast and lighting in screenshots
- Calibrate grid if card positions don't align
- Use AI correction for better accuracy (requires API key)
- Review and manually correct any errors

## Data Format

Exports include the following fields:

| Field | Description |
|-------|-------------|
| Nummer | Card number (1-36) |
| Position X | Column position (1-12) |
| Position Y | Row position (1-3) |
| Kartenname | Card name |
| Anzahl | Quantity owned (1-4) |

## Tech Stack

- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Tesseract.js** - OCR engine
- **Anthropic Claude** (Sonnet 4.5) - AI name correction
- **Scryfall API** - Card validation
- **Supabase** - Authentication (optional)

## Known Issues & Limitations

- Authentication is currently disabled for development
- Quantity detection accuracy could be improved
- OCR accuracy depends on image quality and resolution
- Currently optimized for English card names
- Anthropic API calls incur costs

## Future Enhancements

- Backend proxy for API calls
- Improved quantity detection algorithm
- Collection tracking over time
- Price tracking integration
- Multi-language support
- Mobile app version
- Deck builder integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Acknowledgments

- [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR
- [Scryfall](https://scryfall.com/) for card database
- [Anthropic](https://www.anthropic.com/) for Claude AI
- [Supabase](https://supabase.com/) for authentication
