import React, { useState } from 'react';
import { AuthProvider } from './components/Auth/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { ImageDropzone } from './components/Upload/ImageDropzone';
import { ImagePreview } from './components/Upload/ImagePreview';
import { CardProcessor } from './components/Processing/CardProcessor';
import { ResultsTable } from './components/Results/ResultsTable';
import { ExportButtons } from './components/Results/ExportButtons';
import { AccuracyMetrics } from './components/Results/AccuracyMetrics';
import type { CardData, ProcessingResult, UploadedImage } from './types';
import { signOut } from './services/supabase';
import { parseCSV } from './utils/csvParser';
import { calculateAccuracy } from './utils/accuracyTester';
import { useAuth } from './components/Auth/AuthContext';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [groundTruth, setGroundTruth] = useState<CardData[]>([]);

  const handleImagesUploaded = (newImages: UploadedImage[]) => {
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleProcessingComplete = (results: ProcessingResult[]) => {
    setProcessingResults(results);

    // Combine all cards from all results
    const allCards = results.flatMap((r) => r.cards);
    setCards(allCards);

    // Mark images as processed
    setImages(images.map((img) => ({ ...img, processed: true })));
  };

  const handleCardUpdate = (index: number, field: keyof CardData, value: any) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  const handleLoadTestData = async () => {
    try {
      const response = await fetch('/example/MTG Arena Collection Page 10 - Test data - Tabellenblatt1.csv');
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
      console.log('Loaded test data:', parsed);
      setGroundTruth(parsed);
      setTestMode(true);
      alert(`Loaded ${parsed.length} cards from test data for comparison`);
    } catch (error) {
      console.error('Error loading test data:', error);
      alert('Error loading test data. Make sure the file exists in /example/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const accuracy = testMode && groundTruth.length > 0 && cards.length > 0
    ? calculateAccuracy(cards, groundTruth)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">MTG Arena Collector</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleLoadTestData}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Load Test Data
            </button>
            <button
              onClick={handleSignOut}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Upload Section */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Upload Screenshots</h2>
            <ImageDropzone onImagesUploaded={handleImagesUploaded} />
            <ImagePreview images={images} onRemove={handleRemoveImage} />
          </section>

          {/* Processing Section */}
          {images.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Process Images</h2>
              <CardProcessor images={images} onProcessingComplete={handleProcessingComplete} />
            </section>
          )}

          {/* Results Section */}
          {cards.length > 0 && (
            <section className="mt-8">
              <ResultsTable cards={cards} onCardUpdate={handleCardUpdate} />
              <ExportButtons cards={cards} />
            </section>
          )}

          {/* Accuracy Section */}
          {accuracy && (
            <section className="mt-8">
              <AccuracyMetrics metrics={accuracy} />
            </section>
          )}

          {/* Info Section */}
          {cards.length === 0 && images.length === 0 && (
            <section className="mt-12 text-center">
              <div className="bg-gray-800/50 rounded-lg p-8 max-w-2xl mx-auto border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
                <ol className="text-left text-gray-300 space-y-2">
                  <li>1. Upload one or more MTG Arena collection screenshots</li>
                  <li>2. Click "Process" to extract card names and quantities using OCR + AI</li>
                  <li>3. Review and edit the results in the interactive table</li>
                  <li>4. Export to CSV or JSON format</li>
                  <li>5. (Optional) Load test data to check accuracy against known results</li>
                </ol>
                <div className="mt-6 text-sm text-gray-500">
                  <p>Powered by Tesseract.js, Anthropic Claude, and Scryfall API</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
