import React, { useState, useEffect } from 'react';
import { AuthProvider } from './components/Auth/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
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

// Icon Components
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconDeck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const IconScan = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MainApp: React.FC = () => {
  const { user, isDemoMode } = useAuth();
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
        console.log(`Loaded ${loadedCards.length} cards from collection`);
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

    console.log(`Processing complete: ${validatedCards.length} validated, ${unmatchedCardsFound.length} unmatched`);

    if (unmatchedCardsFound.length > 0) {
      console.warn('Unmatched cards:', unmatchedCardsFound.map(c => c.kartenname));
    }

    setCards(validatedCards);
    setUnmatchedCards(unmatchedCardsFound);
    setImages(images.map((img) => ({ ...img, processed: true })));

    if (validatedCards.length > 0 && user && !isDemoMode) {
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

    if (correctedCards.length > 0 && user && !isDemoMode) {
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

  const handleCardUpdate = (index: number, field: keyof CardData, value: unknown) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  const handleLoadTestData = async () => {
    try {
      const response = await fetch('/example/MTG Arena Collection Page 10 - Test data - Tabellenblatt1.csv');
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
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
      'Are you sure you want to reset your entire collection?\n\nThis will permanently delete all cards. This action cannot be undone.'
    );

    if (!confirmed) return;

    setSaveStatus('saving');
    try {
      await resetCollection();
      setCards([]);
      setUnmatchedCards([]);
      setSaveStatus('saved');
      alert('Collection has been reset successfully');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to reset collection:', error);
      setSaveStatus('error');
      alert('Failed to reset collection. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const accuracy = testMode && groundTruth.length > 0 && cards.length > 0
    ? calculateAccuracy(cards, groundTruth)
    : null;

  const getStatusText = () => {
    if (loadStatus === 'loading') return 'Loading collection...';
    if (saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'saved') return 'Saved';
    if (isDemoMode) return 'Demo Mode';
    return 'Online';
  };

  const getStatusColor = () => {
    if (loadStatus === 'loading' || saveStatus === 'saving') return 'text-warning';
    if (saveStatus === 'saved') return 'text-success';
    if (isDemoMode) return 'text-secondary';
    return 'text-success';
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Mesh Gradient Overlay */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      {/* Sidebar */}
      <aside className="sidebar w-72 flex flex-col z-10">
        {/* Logo */}
        <div className="p-6 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-magic flex items-center justify-center shadow-glow-sm shadow-primary/50">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">MTG Collector</h1>
              <p className="text-xs text-text-muted">Arena Scanner</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('mydecks')}
            className={`sidebar-item w-full ${activeTab === 'mydecks' ? 'active' : ''}`}
          >
            <IconHome />
            <span>My Decks</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('build');
              setSelectedDeckId(undefined);
            }}
            className={`sidebar-item w-full ${activeTab === 'build' ? 'active' : ''}`}
          >
            <IconDeck />
            <span>Build Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className={`sidebar-item w-full ${activeTab === 'collection' ? 'active' : ''}`}
          >
            <IconScan />
            <span>Collection Scanner</span>
          </button>

          <div className="pt-4 mt-4 border-t border-glass-border">
            <button
              onClick={() => setSettingsOpen(true)}
              className="sidebar-item w-full"
            >
              <IconSettings />
              <span>Settings</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-glass-border">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-ocean flex items-center justify-center text-white font-bold shadow-glow-sm shadow-secondary/50">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email || 'User'}
                </p>
                <p className={`text-xs ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary w-full text-sm"
            >
              <IconLogout />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden z-10">
        {/* Header */}
        <header className="px-8 py-4 border-b border-glass-border backdrop-blur-xl bg-dark-900/50">
          <div className="flex items-center justify-between">
            {/* Page Title */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {activeTab === 'mydecks' && 'My Decks'}
                {activeTab === 'build' && 'Deck Builder'}
                {activeTab === 'collection' && 'Collection Scanner'}
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                {activeTab === 'mydecks' && 'Manage your deck collection'}
                {activeTab === 'build' && 'Create and optimize your decks'}
                {activeTab === 'collection' && 'Scan MTG Arena screenshots'}
              </p>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <IconSearch />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <IconSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search cards..."
                  className="search-input w-64 pl-10"
                />
              </div>

              {/* Action Buttons */}
              {activeTab === 'collection' && (
                <div className="flex items-center gap-2">
                  <button onClick={handleLoadTestData} className="btn btn-secondary text-sm">
                    Load Test Data
                  </button>
                  <button
                    onClick={handleResetCollection}
                    className="btn btn-danger text-sm"
                    disabled={saveStatus === 'saving'}
                  >
                    Reset Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8">
            {/* My Decks Tab */}
            {activeTab === 'mydecks' && (
              <div className="animate-fade-in">
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
              </div>
            )}

            {/* Build Deck Tab */}
            {activeTab === 'build' && (
              <div className="animate-fade-in">
                <DeckBuilder collection={cards} deckId={selectedDeckId} />
              </div>
            )}

            {/* Collection Scanner Tab */}
            {activeTab === 'collection' && (
              <div className="space-y-8 animate-fade-in">
                {/* Upload Section */}
                <section className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Upload Screenshots
                  </h3>
                  <ImageDropzone onImagesUploaded={handleImagesUploaded} />
                  {images.length > 0 && (
                    <div className="mt-6">
                      <ImagePreview images={images} onRemove={handleRemoveImage} />
                    </div>
                  )}
                </section>

                {/* Processing Section */}
                {images.length > 0 && (
                  <section className="glass-card p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Process Images
                    </h3>
                    <CardProcessor images={images} onProcessingComplete={handleProcessingComplete} />
                  </section>
                )}

                {/* Unmatched Cards Section */}
                {unmatchedCards.length > 0 && (
                  <section className="glass-card p-6">
                    <UnmatchedCards unmatchedCards={unmatchedCards} onCardsMatched={handleCardsMatched} />
                  </section>
                )}

                {/* Results Section */}
                {cards.length > 0 && (
                  <section className="space-y-6">
                    <div className="glass-card p-6">
                      <CollectionSummary cards={cards} />
                    </div>
                    <div className="glass-card p-6">
                      <ResultsTable cards={cards} onCardUpdate={handleCardUpdate} />
                    </div>
                    <div className="glass-card p-6">
                      <ExportButtons cards={cards} />
                    </div>
                  </section>
                )}

                {/* Accuracy Section */}
                {accuracy && (
                  <section className="glass-card p-6">
                    <AccuracyMetrics metrics={accuracy} />
                  </section>
                )}

                {/* Empty State */}
                {cards.length === 0 && images.length === 0 && (
                  <section className="premium-card max-w-2xl mx-auto">
                    <div className="premium-card-content text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-magic flex items-center justify-center shadow-glow-lg shadow-primary/30">
                        <IconScan />
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary mb-2">
                        How It Works
                      </h3>
                      <p className="text-text-secondary mb-8 max-w-md mx-auto">
                        Scan your MTG Arena collection screenshots and extract card data automatically.
                      </p>
                      <ol className="text-left space-y-4 max-w-md mx-auto">
                        {[
                          'Upload MTG Arena collection screenshots',
                          'Process images with OCR + AI',
                          'Review and edit results',
                          'Export to CSV or JSON'
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="text-text-secondary pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-8 pt-6 border-t border-glass-border">
                        <p className="text-xs text-text-muted">
                          Powered by Tesseract.js, Anthropic Claude, and Scryfall API
                        </p>
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
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
