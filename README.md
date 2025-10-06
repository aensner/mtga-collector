# MTG Arena Collector

A web application that uses OCR and AI to scan MTG Arena collection screenshots and extract card names and quantities.

## Features

- 📸 **Screenshot Upload**: Drag-and-drop interface for uploading collection screenshots
- 🔍 **OCR Processing**: Extracts card names using Tesseract.js
- 🤖 **AI Enhancement**: Uses Anthropic Claude API to correct OCR errors
- ✅ **Card Validation**: Verifies card names against Scryfall database
- 💎 **Quantity Detection**: Automatically detects card quantities from filled diamonds
- 📊 **Accuracy Testing**: Compare results against test data
- 📥 **Export**: Export results to CSV or JSON
- 🔐 **Authentication**: Secure login with Supabase

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **OCR**: Tesseract.js
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Card Database**: Scryfall API
- **Authentication**: Supabase
- **File Handling**: react-dropzone, papaparse

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### Getting API Keys:

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon/public key

**Anthropic:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and get your API key
3. Note: The app uses `dangerouslyAllowBrowser: true` for demo purposes. In production, use a backend proxy.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Sign Up/Login**: Create an account or sign in with email/password
2. **Upload Screenshots**: Drag and drop MTG Arena collection screenshots
3. **Process Images**: Click "Process" to extract card data
4. **Review Results**: Check the extracted card names and quantities in the table
5. **Manual Corrections**: Click on any cell to edit card names or quantities
6. **Test Accuracy**: Click "Load Test Data" to compare against the example data
7. **Export**: Download results as CSV or JSON

## Test Data

The `example/` directory contains:
- `MGTArena Collection Page 10.jpg` - Sample screenshot
- `MTG Arena Collection Page 10 - Test data.csv` - Ground truth data for accuracy testing

Use the "Load Test Data" button to compare your results against known correct values.

## How It Works

### Image Processing Pipeline

1. **Upload**: User uploads MTG Arena collection screenshot(s)
2. **Grid Detection**: Detects the 12-column card grid layout
3. **OCR**: Extracts text from each card position using Tesseract.js
4. **Quantity Detection**: Counts filled diamonds above each card (1-4)
5. **AI Correction**: Sends OCR results to Claude API for error correction
6. **Validation**: Verifies card names against Scryfall database
7. **Results**: Displays interactive table with confidence scores

### Grid Detection

Cards are arranged in a 12-column grid. The system:
- Calculates grid dimensions based on image size
- Accounts for UI margins and card spacing
- Reads cards from bottom-left to top-right (matching CSV order)

### Quantity Detection

Filled diamonds above cards indicate quantity (1-4):
- Extracts region above each card
- Counts bright/white pixels (filled diamonds)
- Maps brightness ratio to quantity

## Project Structure

```
src/
├── components/
│   ├── Auth/              # Authentication components
│   ├── Upload/            # Image upload UI
│   ├── Processing/        # OCR and processing logic
│   └── Results/           # Results display and export
├── services/
│   ├── supabase.ts        # Supabase client
│   ├── anthropic.ts       # Claude API integration
│   ├── scryfall.ts        # Scryfall API integration
│   ├── ocr.ts             # Tesseract.js wrapper
│   └── imageProcessing.ts # Grid detection & quantity detection
├── utils/
│   ├── csvParser.ts       # CSV import/export
│   └── accuracyTester.ts  # Accuracy calculation
├── types/
│   └── index.ts           # TypeScript definitions
└── App.tsx                # Main application
```

## Known Limitations

1. **OCR Accuracy**: Depends on image quality, resolution, and contrast
2. **Grid Detection**: Assumes standard MTG Arena UI layout
3. **Quantity Detection**: May need tuning for different screen resolutions
4. **API Costs**: Anthropic API calls incur costs (use wisely)
5. **Browser-based API**: Claude API runs in browser (not recommended for production)

## Future Enhancements

- Backend proxy for API calls
- Batch processing optimization
- Collection tracking over time
- Price tracking integration
- Mobile app version
- Deck builder integration
- Advanced image preprocessing
- Custom grid detection calibration

## License

MIT

## Credits

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [Anthropic Claude](https://www.anthropic.com/) - AI text correction
- [Scryfall](https://scryfall.com/) - MTG card database
- [Supabase](https://supabase.com/) - Authentication
