import React, { useEffect, useState } from 'react';
import type { CardData, DeckSummary } from '../../types';
import { loadDeckSummaries, deleteDeck } from '../../services/deckDatabase';

interface MyDecksProps {
  collection: CardData[];
  onCreateDeck: () => void;
  onEditDeck: (deckId: string) => void;
}

export const MyDecks: React.FC<MyDecksProps> = ({ collection, onCreateDeck, onEditDeck }) => {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, [collection]);

  const loadDecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedDecks = await loadDeckSummaries(collection);
      setDecks(loadedDecks);
    } catch (err) {
      console.error('Failed to load decks:', err);
      setError('Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deckId: string, deckName: string) => {
    if (!window.confirm(`Delete "${deckName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteDeck(deckId);
      setDecks(decks.filter(d => d.id !== deckId));
    } catch (err) {
      console.error('Failed to delete deck:', err);
      alert('Failed to delete deck');
    }
  };

  const getColorSymbols = (colors: string[]) => {
    const colorMap: Record<string, string> = {
      W: '⚪', // White
      U: '🔵', // Blue
      B: '⚫', // Black
      R: '🔴', // Red
      G: '🟢', // Green
    };

    if (colors.length === 0) return '◯'; // Colorless

    return colors.map(c => colorMap[c] || c).join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-fg-muted">Loading decks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-fg-primary">My Decks</h2>
          <p className="text-sm text-fg-muted mt-1">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            {collection.length > 0 && ` • ${collection.length} cards in collection`}
          </p>
        </div>
        <button
          onClick={onCreateDeck}
          className="button ok flex items-center gap-2"
        >
          <span>+</span>
          <span>New Deck</span>
        </button>
      </div>

      {/* Empty State */}
      {decks.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🎴</div>
          <h3 className="text-xl font-semibold text-fg-primary mb-2">
            No decks yet
          </h3>
          <p className="text-fg-muted mb-6 max-w-md mx-auto">
            Create your first deck to start building competitive strategies with your collection.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={onCreateDeck} className="button ok">
              Create Deck
            </button>
          </div>
        </div>
      )}

      {/* Deck Grid */}
      {decks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {decks.map(deck => (
            <div
              key={deck.id}
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => onEditDeck(deck.id)}
            >
              {/* Deck Header */}
              <div className="card-header">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-fg-primary truncate group-hover:text-accent transition-colors">
                      {deck.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-fg-muted">
                      <span className="capitalize">{deck.format}</span>
                      {deck.archetype && (
                        <>
                          <span>•</span>
                          <span>{deck.archetype}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl flex-shrink-0">
                    {getColorSymbols(deck.colors)}
                  </div>
                </div>
              </div>

              {/* Deck Body */}
              <div className="card-body space-y-3">
                {/* Card Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted">Cards:</span>
                  <span className={`font-semibold ${deck.isValid ? 'text-ok' : 'text-warn'}`}>
                    {deck.totalCards} / 60
                  </span>
                </div>

                {/* Ownership Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-fg-muted">Owned:</span>
                    <span className="text-sm font-semibold text-fg-primary">
                      {deck.ownedPercentage}%
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      className={`bar ${
                        deck.ownedPercentage === 100
                          ? '!bg-ok'
                          : deck.ownedPercentage >= 75
                          ? '!bg-info'
                          : deck.ownedPercentage >= 50
                          ? '!bg-warn'
                          : '!bg-error'
                      }`}
                      style={{ width: `${deck.ownedPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Primary Type */}
                {deck.primaryType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-fg-muted">Type:</span>
                    <span className="text-sm text-fg-secondary">{deck.primaryType}</span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  {deck.isValid && (
                    <span className="badge ok text-xs">Valid</span>
                  )}
                  {deck.ownedPercentage === 100 && (
                    <span className="badge info text-xs">Complete</span>
                  )}
                  {deck.ownedPercentage < 100 && deck.ownedPercentage > 0 && (
                    <span className="badge warn text-xs">
                      {60 - Math.ceil((deck.totalCards * deck.ownedPercentage) / 100)} missing
                    </span>
                  )}
                </div>
              </div>

              {/* Deck Actions */}
              <div className="card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDeck(deck.id);
                  }}
                  className="button ok text-sm flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Export functionality
                    alert('Export feature coming soon!');
                  }}
                  className="button ghost text-sm flex-1"
                  title="Export deck"
                >
                  Export
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(deck.id, deck.name);
                  }}
                  className="button danger text-sm px-3"
                  title="Delete deck"
                >
                  ×
                </button>
              </div>

              {/* Updated timestamp */}
              <div className="px-4 pb-3">
                <div className="text-xs text-fg-muted">
                  Updated {new Date(deck.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {decks.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="font-semibold text-fg-primary">Quick Stats</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-accent">
                  {decks.length}
                </div>
                <div className="text-sm text-fg-muted">Total Decks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ok">
                  {decks.filter(d => d.isValid).length}
                </div>
                <div className="text-sm text-fg-muted">Valid Decks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-info">
                  {decks.filter(d => d.ownedPercentage === 100).length}
                </div>
                <div className="text-sm text-fg-muted">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-fg-primary">
                  {collection.length}
                </div>
                <div className="text-sm text-fg-muted">Collection Cards</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
