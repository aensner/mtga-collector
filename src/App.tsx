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

const IconSun = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconMoon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const IconUpload = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// Theme Hook
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
};

const MainApp: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const getStatusInfo = () => {
    if (loadStatus === 'loading') return { text: 'Loading...', type: 'loading' };
    if (saveStatus === 'saving') return { text: 'Saving...', type: 'loading' };
    if (saveStatus === 'saved') return { text: 'Saved', type: 'success' };
    if (isDemoMode) return { text: 'Demo Mode', type: 'demo' };
    return { text: 'Online', type: 'online' };
  };

  const status = getStatusInfo();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">M</div>
            <div className="logo-text">
              <span className="logo-title">MTG Collector</span>
              <span className="logo-subtitle">Arena Scanner</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav custom-scrollbar">
          <button
            onClick={() => setActiveTab('mydecks')}
            className={`nav-item ${activeTab === 'mydecks' ? 'active' : ''}`}
          >
            <IconHome />
            <span>My Decks</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('build');
              setSelectedDeckId(undefined);
            }}
            className={`nav-item ${activeTab === 'build' ? 'active' : ''}`}
          >
            <IconDeck />
            <span>Build Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className={`nav-item ${activeTab === 'collection' ? 'active' : ''}`}
          >
            <IconScan />
            <span>Collection Scanner</span>
          </button>

          <div className="nav-divider" />

          <button
            onClick={() => setSettingsOpen(true)}
            className="nav-item"
          >
            <IconSettings />
            <span>Settings</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.email || 'User'}</p>
              <p className="user-status">
                <span className={`status-dot ${status.type === 'demo' ? 'demo' : ''}`} />
                {status.text}
              </p>
            </div>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost w-full mt-3">
            <IconLogout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <div className="page-header">
            <div className="page-header-content">
              <h1 className="page-title">
                {activeTab === 'mydecks' && 'My Decks'}
                {activeTab === 'build' && 'Deck Builder'}
                {activeTab === 'collection' && 'Collection Scanner'}
              </h1>
              <p className="page-description">
                {activeTab === 'mydecks' && 'Manage your deck collection'}
                {activeTab === 'build' && 'Create and optimize your decks'}
                {activeTab === 'collection' && 'Scan MTG Arena screenshots to build your collection'}
              </p>
            </div>

            <div className="page-actions">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <div className="theme-toggle-thumb">
                  {theme === 'light' ? <IconSun /> : <IconMoon />}
                </div>
              </button>

              {/* Action Buttons */}
              {activeTab === 'collection' && (
                <>
                  <button onClick={handleLoadTestData} className="btn btn-secondary btn-sm">
                    Load Test Data
                  </button>
                  <button
                    onClick={handleResetCollection}
                    className="btn btn-danger btn-sm"
                    disabled={saveStatus === 'saving'}
                  >
                    Reset Collection
                  </button>
                </>
              )}

              {activeTab === 'mydecks' && (
                <button
                  onClick={() => {
                    setSelectedDeckId(undefined);
                    setActiveTab('build');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  + New Deck
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="main-body custom-scrollbar">
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
            <div className="animate-fade-in space-y-6">
              {/* Upload & Process Section - Combined */}
              <section className="card">
                <div className="card-body space-y-4">
                  {/* Dropzone - compact when images already uploaded */}
                  <ImageDropzone onImagesUploaded={handleImagesUploaded} compact={images.length > 0} />

                  {/* Uploaded Images Preview - compact horizontal strip */}
                  {images.length > 0 && (
                    <ImagePreview images={images} onRemove={handleRemoveImage} />
                  )}

                  {/* Process Controls - directly after images */}
                  {images.length > 0 && (
                    <div className="pt-2">
                      <CardProcessor images={images} onProcessingComplete={handleProcessingComplete} />
                    </div>
                  )}
                </div>
              </section>

              {/* Unmatched Cards Section */}
              {unmatchedCards.length > 0 && (
                <section className="card">
                  <div className="card-body">
                    <UnmatchedCards unmatchedCards={unmatchedCards} onCardsMatched={handleCardsMatched} />
                  </div>
                </section>
              )}

              {/* Results Section */}
              {cards.length > 0 && (
                <>
                  <section className="card">
                    <div className="card-body">
                      <CollectionSummary cards={cards} />
                    </div>
                  </section>
                  <section className="card">
                    <div className="card-body">
                      <ResultsTable cards={cards} onCardUpdate={handleCardUpdate} />
                    </div>
                  </section>
                  <section className="card">
                    <div className="card-body">
                      <ExportButtons cards={cards} />
                    </div>
                  </section>
                </>
              )}

              {/* Accuracy Section */}
              {accuracy && (
                <section className="card">
                  <div className="card-body">
                    <AccuracyMetrics metrics={accuracy} />
                  </div>
                </section>
              )}

              {/* Empty State */}
              {cards.length === 0 && images.length === 0 && (
                <section className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <IconUpload />
                    </div>
                    <h3 className="empty-state-title">Start Scanning</h3>
                    <p className="empty-state-description">
                      Upload MTG Arena collection screenshots to extract card data automatically using OCR and AI.
                    </p>
                    <div className="space-y-3 text-left max-w-xs mx-auto">
                      {[
                        'Upload collection screenshots',
                        'Process with OCR + AI',
                        'Review and edit results',
                        'Export to CSV or JSON'
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="badge badge-primary text-xs">{i + 1}</span>
                          <span className="text-small">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
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
