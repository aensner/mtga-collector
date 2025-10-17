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
import { DeckBuilder } from './components/DeckBuilder/DeckBuilder';
import { MyDecks } from './components/Decks/MyDecks';
import { SettingsModal } from './components/Settings/SettingsModal';
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
  const [activeTab, setActiveTab] = useState<'mydecks' | 'build' | 'collection'>('mydecks');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>(undefined);

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
  }, [user?.id]);

  const handleImagesUploaded = (newImages: UploadedImage[]) => {
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleProcessingComplete = async (results: ProcessingResult[]) => {
    const allCards = results.flatMap((r) => r.cards);
    const validatedCards = allCards.filter(card => card.scryfallMatch !== undefined && card.scryfallMatch !== null);
    const unmatchedCardsFound = allCards.filter(card => card.scryfallMatch === undefined || card.scryfallMatch === null);

    console.log(`Processing complete: ${validatedCards.length} validated, ${unmatchedCardsFound.length} unmatched (total: ${allCards.length})`);

    if (unmatchedCardsFound.length > 0) {
      console.warn('⚠️ Unmatched cards (these may need AI correction):', unmatchedCardsFound.map(c => c.kartenname));
    }

    setCards(validatedCards);
    setUnmatchedCards(unmatchedCardsFound);
    setImages(images.map((img) => ({ ...img, processed: true })));

    if (validatedCards.length > 0 && user) {
      setSaveStatus('saving');
      try {
        await saveCards(validatedCards);
        await saveScanHistory(validatedCards.length, results.length);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Failed to auto-save cards:', error);
        setSaveStatus('error');
      }
    }
  };

  const handleCardsMatched = async (correctedCards: CardData[]) => {
    const updatedCards = [...cards, ...correctedCards];
    setCards(updatedCards);

    const remainingUnmatched = unmatchedCards.filter(
      unmatched => !correctedCards.some(corrected => corrected.nummer === unmatched.nummer)
    );
    setUnmatchedCards(remainingUnmatched);

    console.log(`Added ${correctedCards.length} corrected cards to collection`);

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
    <div className="flex h-screen bg-bg-base text-fg-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-sidebar flex flex-col border-r border-border">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold">MTG Collector</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 custom-scrollbar overflow-y-auto">
          <div className="space-y-1 px-3">
            <button
              onClick={() => setActiveTab('mydecks')}
              className={`sidebar-item w-full ${activeTab === 'mydecks' ? 'active bg-bg-highlight' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">My Decks</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('build');
                setSelectedDeckId(undefined);
              }}
              className={`sidebar-item w-full ${activeTab === 'build' ? 'active bg-bg-highlight' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">Build Deck</span>
            </button>

            <button
              onClick={() => setActiveTab('collection')}
              className={`sidebar-item w-full ${activeTab === 'collection' ? 'active bg-bg-highlight' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-medium">Collection Scanner</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 border-t border-border"></div>

          {/* Utility Links */}
          <div className="space-y-1 px-3">
            <button
              onClick={() => setSettingsOpen(true)}
              className="sidebar-item w-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black font-bold">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
              <p className="text-xs text-fg-muted">
                {loadStatus === 'loading' && '📦 Loading...'}
                {saveStatus === 'saving' && '💾 Saving...'}
                {saveStatus === 'saved' && '✅ Saved'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full btn-secondary text-sm py-2"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-bg-sidebar border-b border-border px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search cards..."
                className="search-input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {activeTab === 'collection' && (
                <>
                  <button
                    onClick={handleLoadTestData}
                    className="btn-ghost text-xs"
                  >
                    Load Test Data
                  </button>
                  <button
                    onClick={handleResetCollection}
                    className="btn-ghost text-xs text-error"
                    disabled={saveStatus === 'saving'}
                  >
                    Reset Collection
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-bg-base to-bg-elevated">
          <div className="px-8 py-6">
            {/* My Decks Tab */}
            {activeTab === 'mydecks' && (
              <MyDecks
                collection={cards}
                onCreateDeck={() => {
                  setSelectedDeckId(undefined);
                  setActiveTab('build');
                }}
                onEditDeck={(deckId) => {
                  setSelectedDeckId(deckId);
                  setActiveTab('build');
                }}
              />
            )}

            {/* Build Deck Tab */}
            {activeTab === 'build' && (
              <DeckBuilder collection={cards} deckId={selectedDeckId} />
            )}

            {/* Collection Scanner Tab */}
            {activeTab === 'collection' && (
              <div className="space-y-8">
                {/* Upload Section */}
                <section>
                  <h2 className="text-2xl font-bold mb-4">Upload Screenshots</h2>
                  <ImageDropzone onImagesUploaded={handleImagesUploaded} />
                  <ImagePreview images={images} onRemove={handleRemoveImage} />
                </section>

                {/* Processing Section */}
                {images.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-4">Process Images</h2>
                    <CardProcessor images={images} onProcessingComplete={handleProcessingComplete} />
                  </section>
                )}

                {/* Unmatched Cards Section */}
                <UnmatchedCards unmatchedCards={unmatchedCards} onCardsMatched={handleCardsMatched} />

                {/* Results Section */}
                {cards.length > 0 && (
                  <section>
                    <CollectionSummary cards={cards} />
                    <ResultsTable cards={cards} onCardUpdate={handleCardUpdate} />
                    <ExportButtons cards={cards} />
                  </section>
                )}

                {/* Accuracy Section */}
                {accuracy && (
                  <section>
                    <AccuracyMetrics metrics={accuracy} />
                  </section>
                )}

                {/* Empty State */}
                {cards.length === 0 && images.length === 0 && (
                  <section className="mt-12 text-center">
                    <div className="spotify-card max-w-2xl mx-auto p-8">
                      <h3 className="text-2xl font-bold mb-4">How It Works</h3>
                      <ol className="text-left text-fg-secondary space-y-2">
                        <li>1. Upload one or more MTG Arena collection screenshots</li>
                        <li>2. Click "Process" to extract card names and quantities using OCR + AI</li>
                        <li>3. Review and edit the results in the interactive table</li>
                        <li>4. Export to CSV or JSON format</li>
                        <li>5. (Optional) Load test data to check accuracy against known results</li>
                      </ol>
                      <div className="mt-6 text-sm text-fg-muted">
                        <p>Powered by Tesseract.js, Anthropic Claude, and Scryfall API</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
