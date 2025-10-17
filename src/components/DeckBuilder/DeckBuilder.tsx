import React, { useState, useEffect } from 'react';
import type { CardData } from '../../types';
import { DeckList } from './DeckList';
import { CollectionView } from './CollectionView';
import { AIAssistant } from './AIAssistant';
import { DeckStatistics } from './DeckStatistics';
import { DeckOptimization } from './DeckOptimization';
import { deckStorage, type SavedDeck } from '../../utils/deckStorage';
import { loadDeck as loadDeckFromDb, createDeck, saveDeckCards, updateDeckMetadata } from '../../services/deckDatabase';

interface DeckCard {
  card: CardData;
  count: number;
}

export const DeckBuilder: React.FC<{ collection: CardData[]; deckId?: string }> = ({ collection, deckId }) => {
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [deckName, setDeckName] = useState('My Deck');
  const [format, setFormat] = useState<'standard' | 'historic' | 'explorer' | 'alchemy' | 'timeless' | 'brawl' | 'casual'>('standard');
  const [currentDeckId, setCurrentDeckId] = useState<string | undefined>(deckId);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>(deckStorage.getAllDecks());
  const [activeTab, setActiveTab] = useState<'builder' | 'statistics' | 'optimization'>('builder');

  // Load deck if deckId prop is provided
  useEffect(() => {
    if (deckId && deckId !== currentDeckId) {
      loadDeckFromDatabase(deckId);
    }
  }, [deckId]);

  const addCardToDeck = (card: CardData, count: number = 1) => {
    setDeckCards(prev => {
      const existing = prev.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
      if (existing) {
        // Check 4-of limit (except basic lands)
        const isBasicLand = card.scryfallMatch?.type_line?.includes('Basic Land');
        const maxCopies = isBasicLand ? 999 : 4;
        const newCount = Math.min(existing.count + count, maxCopies, card.anzahl);

        return prev.map(dc =>
          dc.card.scryfallMatch?.id === card.scryfallMatch?.id
            ? { ...dc, count: newCount }
            : dc
        );
      } else {
        return [...prev, { card, count: Math.min(count, card.anzahl) }];
      }
    });
  };

  const removeCardFromDeck = (card: CardData, count: number = 1) => {
    setDeckCards(prev => {
      const existing = prev.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
      if (!existing) return prev;

      const newCount = existing.count - count;
      if (newCount <= 0) {
        return prev.filter(dc => dc.card.scryfallMatch?.id !== card.scryfallMatch?.id);
      }

      return prev.map(dc =>
        dc.card.scryfallMatch?.id === card.scryfallMatch?.id
          ? { ...dc, count: newCount }
          : dc
      );
    });
  };

  const setCardCount = (card: CardData, count: number) => {
    if (count <= 0) {
      setDeckCards(prev => prev.filter(dc => dc.card.scryfallMatch?.id !== card.scryfallMatch?.id));
    } else {
      const isBasicLand = card.scryfallMatch?.type_line?.includes('Basic Land');
      const maxCopies = isBasicLand ? 999 : 4;
      const clampedCount = Math.min(count, maxCopies, card.anzahl);

      setDeckCards(prev => {
        const existing = prev.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
        if (existing) {
          return prev.map(dc =>
            dc.card.scryfallMatch?.id === card.scryfallMatch?.id
              ? { ...dc, count: clampedCount }
              : dc
          );
        } else {
          return [...prev, { card, count: clampedCount }];
        }
      });
    }
  };

  const clearDeck = () => {
    if (window.confirm('Clear the entire deck?')) {
      setDeckCards([]);
      setCurrentDeckId(undefined);
    }
  };

  const saveDeck = async () => {
    if (!deckName.trim()) {
      alert('Please enter a deck name');
      return;
    }

    try {
      if (currentDeckId) {
        // Update existing deck
        await updateDeckMetadata(currentDeckId, { name: deckName, format });
        await saveDeckCards(
          currentDeckId,
          deckCards.map(dc => ({
            scryfallId: dc.card.scryfallMatch?.id || '',
            cardName: dc.card.scryfallMatch?.name || dc.card.kartenname,
            quantity: dc.count,
            manaCost: dc.card.scryfallMatch?.mana_cost,
            cmc: dc.card.scryfallMatch?.cmc,
            typeLine: dc.card.scryfallMatch?.type_line,
            colors: dc.card.scryfallMatch?.colors,
            rarity: dc.card.scryfallMatch?.rarity,
            setCode: dc.card.scryfallMatch?.set
          }))
        );
        alert(`✅ Deck "${deckName}" updated!`);
      } else {
        // Create new deck
        const newDeck = await createDeck(deckName, format);
        setCurrentDeckId(newDeck.id);

        // Save cards
        await saveDeckCards(
          newDeck.id,
          deckCards.map(dc => ({
            scryfallId: dc.card.scryfallMatch?.id || '',
            cardName: dc.card.scryfallMatch?.name || dc.card.kartenname,
            quantity: dc.count,
            manaCost: dc.card.scryfallMatch?.mana_cost,
            cmc: dc.card.scryfallMatch?.cmc,
            typeLine: dc.card.scryfallMatch?.type_line,
            colors: dc.card.scryfallMatch?.colors,
            rarity: dc.card.scryfallMatch?.rarity,
            setCode: dc.card.scryfallMatch?.set
          }))
        );
        alert(`✅ Deck "${deckName}" created!`);
      }

      // Also save to localStorage as backup
      deckStorage.saveDeck(deckName, format, deckCards, currentDeckId);
      setSavedDecks(deckStorage.getAllDecks());
    } catch (error) {
      console.error('Failed to save deck:', error);
      alert('❌ Failed to save deck. Please try again.');
    }
  };

  const loadDeckFromDatabase = async (deckId: string) => {
    try {
      const deck = await loadDeckFromDb(deckId);
      if (!deck) {
        alert('Failed to load deck');
        return;
      }

      // Convert deck cards to DeckCard format
      const restoredCards: DeckCard[] = [];
      let missingCount = 0;

      for (const deckCard of deck.cards) {
        // Find card in collection
        const collectionCard = collection.find(c => c.scryfallMatch?.id === deckCard.scryfallId);

        if (collectionCard) {
          restoredCards.push({
            card: collectionCard,
            count: deckCard.quantity
          });
        } else {
          missingCount++;
          console.warn(`Card not found in collection: ${deckCard.cardName}`);
        }
      }

      setDeckCards(restoredCards);
      setDeckName(deck.name);
      setFormat(deck.format);
      setCurrentDeckId(deck.id);
      setShowSaveLoad(false);

      if (missingCount > 0) {
        alert(`⚠️ Loaded deck but ${missingCount} cards were not found in your collection`);
      } else {
        alert(`✅ Loaded "${deck.name}"!`);
      }
    } catch (error) {
      console.error('Failed to load deck:', error);
      alert('❌ Failed to load deck. Please try again.');
    }
  };

  // Keep localStorage loadDeck for backward compatibility
  const loadDeck = (deckId: string) => {
    const restored = deckStorage.restoreDeck(deckId, collection);
    if (!restored) {
      alert('Failed to load deck');
      return;
    }

    const deck = deckStorage.getDeck(deckId);
    if (!deck) return;

    setDeckCards(restored);
    setDeckName(deck.name);
    setFormat(deck.format as any);
    setCurrentDeckId(deckId);
    setShowSaveLoad(false);

    const missingCount = deck.cards.length - restored.length;
    if (missingCount > 0) {
      alert(`⚠️ Loaded deck but ${missingCount} cards were not found in your collection`);
    } else {
      alert(`✅ Loaded "${deck.name}"!`);
    }
  };

  const deleteSavedDeck = (deckId: string) => {
    const deck = deckStorage.getDeck(deckId);
    if (!deck) return;

    if (window.confirm(`Delete "${deck.name}"?`)) {
      deckStorage.deleteDeck(deckId);
      setSavedDecks(deckStorage.getAllDecks());
      if (currentDeckId === deckId) {
        setCurrentDeckId(undefined);
      }
    }
  };

  const createNewDeck = () => {
    if (deckCards.length > 0 && !window.confirm('Start a new deck? Current deck will be cleared.')) {
      return;
    }
    setDeckCards([]);
    setDeckName('My Deck');
    setFormat('standard');
    setCurrentDeckId(undefined);
    setShowSaveLoad(false);
  };

  const handleApplyOptimization = (change: { type: 'add' | 'remove'; cardName: string; count: number }) => {
    if (change.type === 'add') {
      const card = collection.find(c => c.scryfallMatch?.name === change.cardName);
      if (card) {
        addCardToDeck(card, change.count);
      }
    } else {
      const deckCard = deckCards.find(dc => dc.card.scryfallMatch?.name === change.cardName);
      if (deckCard) {
        removeCardFromDeck(deckCard.card, change.count);
      }
    }
  };

  const totalCards = deckCards.reduce((sum, dc) => sum + dc.count, 0);
  const isValidDeck = totalCards >= 60;

  // Calculate mana curve
  const manaCurve = Array.from({ length: 8 }, (_, i) => ({
    cmc: i,
    count: deckCards
      .filter(dc => {
        const cmc = dc.card.scryfallMatch?.cmc || 0;
        return i === 7 ? cmc >= 7 : cmc === i;
      })
      .reduce((sum, dc) => sum + dc.count, 0)
  }));

  return (
    <div className="mt-8">
      <div className="card mb-4">
        <div className="card-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="input text-xl font-bold"
                placeholder="Deck Name"
              />
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="select"
              >
                <option value="standard">Standard</option>
                <option value="historic">Historic</option>
                <option value="explorer">Explorer</option>
                <option value="casual">Casual</option>
              </select>

              {/* Save/Load Buttons */}
              <div className="flex gap-2">
                <button onClick={createNewDeck} className="button ghost text-sm" title="New Deck">
                  📄 New
                </button>
                <button onClick={saveDeck} className="button ok text-sm" disabled={totalCards === 0} title="Save Deck">
                  💾 Save
                </button>
                <button
                  onClick={() => setShowSaveLoad(!showSaveLoad)}
                  className="button ghost text-sm"
                  title="Load Saved Deck"
                >
                  📂 Load ({savedDecks.length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${isValidDeck ? 'text-ok' : 'text-warn'}`}>
                {totalCards} / 60
              </span>
              {isValidDeck && <span className="badge ok text-sm">✓ Valid Deck</span>}
              {!isValidDeck && totalCards > 0 && <span className="badge warn text-sm">Incomplete</span>}
              {currentDeckId && <span className="badge info text-xs">💾 Saved</span>}
            </div>
          </div>
        </div>

        {/* Save/Load Panel */}
        {showSaveLoad && (
          <div className="card-body border-t border-border-separator animate-slideInUp">
            <h4 className="text-sm font-semibold text-fg-secondary mb-3">Saved Decks</h4>
            {savedDecks.length === 0 ? (
              <div className="text-center text-fg-muted py-8">
                No saved decks yet
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedDecks.map(deck => (
                  <div
                    key={deck.id}
                    className={`flex items-center gap-3 p-3 rounded border transition-fast ${
                      currentDeckId === deck.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border-subtle hover:bg-bg-muted/40'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-fg-primary truncate">{deck.name}</div>
                      <div className="text-xs text-fg-muted flex items-center gap-2">
                        <span className="capitalize">{deck.format}</span>
                        <span>•</span>
                        <span>{deck.totalCards} cards</span>
                        <span>•</span>
                        <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => loadDeck(deck.id)}
                        className="button ok text-xs px-3"
                        title="Load this deck"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedDeck(deck.id)}
                        className="button danger text-xs px-2"
                        title="Delete this deck"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Navigation - Sticky */}
      <div className="card mb-4 sticky top-0 z-10 bg-bg-base">
        <div className="card-body p-0">
          <div className="flex border-b border-border-separator">
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                activeTab === 'builder'
                  ? 'text-accent border-b-4 border-accent bg-accent/10'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-muted/40 border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('builder')}
            >
              🎯 Deck Builder
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                activeTab === 'statistics'
                  ? 'text-accent border-b-4 border-accent bg-accent/10'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-muted/40 border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('statistics')}
            >
              📊 Statistics
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                activeTab === 'optimization'
                  ? 'text-accent border-b-4 border-accent bg-accent/10'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-bg-muted/40 border-b-2 border-transparent'
              }`}
              onClick={() => setActiveTab('optimization')}
            >
              ✨ AI Optimization
            </button>
          </div>
        </div>
      </div>

      {/* Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
          {/* Deck List - Left Side (Compact) */}
          <div className="md:col-span-1 xl:col-span-3">
            <DeckList
              deckCards={deckCards}
              deckName={deckName}
              format={format}
              manaCurve={manaCurve}
              totalCards={totalCards}
              onRemoveCard={removeCardFromDeck}
              onSetCardCount={setCardCount}
              onClearDeck={clearDeck}
            />
          </div>

          {/* Collection View - Middle (Wider) */}
          <div className="md:col-span-1 xl:col-span-5">
            <CollectionView
              collection={collection}
              deckCards={deckCards}
              onAddCard={addCardToDeck}
            />
          </div>

          {/* AI Assistant - Right Side */}
          <div className="md:col-span-2 xl:col-span-4">
            <AIAssistant
              deckCards={deckCards}
              collection={collection}
              format={format}
              onAddSuggestion={addCardToDeck}
              onSaveDeck={(aiDeckName) => {
                // Update deck name from AI suggestion
                setDeckName(aiDeckName);
                // Auto-save after building
                setTimeout(() => {
                  const saved = deckStorage.saveDeck(aiDeckName, format, deckCards, currentDeckId);
                  setCurrentDeckId(saved.id);
                  setSavedDecks(deckStorage.getAllDecks());
                }, 100); // Small delay to let cards be added first
              }}
            />
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
          <div className="md:col-span-1 xl:col-span-8 card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-fg-primary">Deck Statistics</h3>
            </div>
            <div className="card-body">
              <DeckStatistics deckCards={deckCards} totalCards={totalCards} />
            </div>
          </div>
          <div className="md:col-span-1 xl:col-span-4">
            <DeckList
              deckCards={deckCards}
              deckName={deckName}
              format={format}
              manaCurve={manaCurve}
              totalCards={totalCards}
              onRemoveCard={removeCardFromDeck}
              onSetCardCount={setCardCount}
              onClearDeck={clearDeck}
            />
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
          <div className="md:col-span-1 xl:col-span-8">
            <DeckOptimization
              deckCards={deckCards}
              availableCards={collection}
              onApplyChange={handleApplyOptimization}
            />
          </div>
          <div className="md:col-span-1 xl:col-span-4">
            <DeckList
              deckCards={deckCards}
              deckName={deckName}
              format={format}
              manaCurve={manaCurve}
              totalCards={totalCards}
              onRemoveCard={removeCardFromDeck}
              onSetCardCount={setCardCount}
              onClearDeck={clearDeck}
            />
          </div>
        </div>
      )}
    </div>
  );
};
