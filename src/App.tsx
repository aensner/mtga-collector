import React, { useState, useEffect } from 'react';
import { AuthProvider } from './components/Auth/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { ImageDropzone } from './components/Upload/ImageDropzone';
import { ImagePreview } from './components/Upload/ImagePreview';
import { CardProcessor } from './components/Processing/CardProcessor';
import { ResultsTable } from './components/Results/ResultsTable';
import { ExportButtons } from './components/Results/ExportButtons';
import { AccuracyMetrics } from './components/Results/AccuracyMetrics';
import { CollectionSummary } from './components/Results/CollectionSummary';
import { UnmatchedCards } from './components/Results/UnmatchedCards';
import type { CardData, ProcessingResult, UploadedImage, SaveStatus, LoadStatus } from './types';
import { signOut } from './services/supabase';
import { loadCollection, saveCards, resetCollection, saveScanHistory } from './services/database';
import { parseCSV } from './utils/csvParser';
import { calculateAccuracy } from './utils/accuracyTester';
import { useAuth } from './components/Auth/AuthContext';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [unmatchedCards, setUnmatchedCards] = useState<CardData[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [groundTruth, setGroundTruth] = useState<CardData[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Load collection on mount
  useEffect(() => {
    const loadUserCollection = async () => {
      if (!user) {
        setCards([]);
        setLoadStatus('idle');
        return;
      }

      setLoadStatus('loading');
      try {
        const loadedCards = await loadCollection();
        setCards(loadedCards);
        setLoadStatus('loaded');
        console.log(`📦 Loaded ${loadedCards.length} cards from collection`);
      } catch (error) {
        console.error('Failed to load collection:', error);
        setLoadStatus('error');
      }
    };

    loadUserCollection();
  }, [user?.id]); // Only re-run when user ID changes, not the entire user object

  const handleImagesUploaded = (newImages: UploadedImage[]) => {
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleProcessingComplete = async (results: ProcessingResult[]) => {

    // Combine all cards from all results
    const allCards = results.flatMap((r) => r.cards);

    // Separate validated and unmatched cards
    const validatedCards = allCards.filter(card => card.scryfallMatch !== undefined && card.scryfallMatch !== null);
    const unmatchedCardsFound = allCards.filter(card => card.scryfallMatch === undefined || card.scryfallMatch === null);

    console.log(`Processing complete: ${validatedCards.length} validated, ${unmatchedCardsFound.length} unmatched (total: ${allCards.length})`);

    if (unmatchedCardsFound.length > 0) {
      console.warn('⚠️ Unmatched cards (these may need AI correction):', unmatchedCardsFound.map(c => c.kartenname));
    }

    setCards(validatedCards);
    setUnmatchedCards(unmatchedCardsFound);

    // Mark images as processed
    setImages(images.map((img) => ({ ...img, processed: true })));

    // Auto-save validated cards to database
    if (validatedCards.length > 0 && user) {
      setSaveStatus('saving');
      try {
        await saveCards(validatedCards);
        await saveScanHistory(validatedCards.length, results.length);
        setSaveStatus('saved');

        // Reset save status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Failed to auto-save cards:', error);
        setSaveStatus('error');
      }
    }
  };

  const handleCardsMatched = async (correctedCards: CardData[]) => {
    // Add corrected cards to the main collection
    const updatedCards = [...cards, ...correctedCards];
    setCards(updatedCards);

    // Remove them from unmatched
    const remainingUnmatched = unmatchedCards.filter(
      unmatched => !correctedCards.some(corrected => corrected.nummer === unmatched.nummer)
    );
    setUnmatchedCards(remainingUnmatched);

    console.log(`Added ${correctedCards.length} corrected cards to collection`);

    // Auto-save corrected cards
    if (correctedCards.length > 0 && user) {
      setSaveStatus('saving');
      try {
        await saveCards(correctedCards);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Failed to save corrected cards:', error);
        setSaveStatus('error');
      }
    }
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

  const handleResetCollection = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to reset your entire collection?\n\nThis will permanently delete all cards from your collection. This action cannot be undone.'
    );

    if (!confirmed) return;

    setSaveStatus('saving');
    try {
      await resetCollection();
      setCards([]);
      setUnmatchedCards([]);
      setSaveStatus('saved');
      alert('✅ Collection has been reset successfully');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to reset collection:', error);
      setSaveStatus('error');
      alert('❌ Failed to reset collection. Please try again.');
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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">MTG Arena Collector</h1>

            {/* Status Indicators */}
            {loadStatus === 'loading' && (
              <span className="text-sm text-blue-400">📦 Loading collection...</span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-sm text-blue-400">💾 Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-400">✅ Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-400">❌ Save failed</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleLoadTestData}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Load Test Data
            </button>
            <button
              onClick={handleResetCollection}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-200"
              disabled={saveStatus === 'saving'}
            >
              Reset Collection
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

          {/* Unmatched Cards Section */}
          <UnmatchedCards unmatchedCards={unmatchedCards} onCardsMatched={handleCardsMatched} />

          {/* Results Section */}
          {cards.length > 0 && (
            <section className="mt-8">
              <CollectionSummary cards={cards} />
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
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
