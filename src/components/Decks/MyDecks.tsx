import React, { useEffect, useState } from 'react';
import type { CardData, DeckSummary } from '../../types';
import { loadDeckSummaries, deleteDeck } from '../../services/deckDatabase';
import { exportDeck } from '../../utils/deckExporter';

interface MyDecksProps {
  collection: CardData[];
  onCreateDeck: () => void;
  onEditDeck: (deckId: string) => void;
}

export const MyDecks: React.FC<MyDecksProps> = ({ collection, onCreateDeck, onEditDeck }) => {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingDeckId, setExportingDeckId] = useState<string | null>(null);

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

  const handleExport = async (deckId: string, format: 'arena' | 'plaintext' | 'json') => {
    try {
      await exportDeck(deckId, format);
      setExportingDeckId(null);
    } catch (err) {
      console.error('Failed to export deck:', err);
      alert('Failed to export deck');
    }
  };

  const getColorSymbols = (colors: string[]) => {
    const colorMap: Record<string, string> = {
      W: '⚪',
      U: '🔵',
      B: '⚫',
      R: '🔴',
      G: '🟢',
    };

    if (colors.length === 0) return '◯';
    return colors.map(c => colorMap[c] || c).join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-small">Loading decks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-small" style={{ color: 'var(--error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="section-header mb-6">
        <div>
          <h2 className="section-title">My Decks</h2>
          <p className="section-description">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            {collection.length > 0 && ` • ${collection.length} cards in collection`}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {decks.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="empty-state-title">No decks yet</h3>
            <p className="empty-state-description">
              Create your first deck to start building competitive strategies with your collection.
            </p>
            <button onClick={onCreateDeck} className="btn btn-primary">
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
              className="card card-interactive"
              onClick={() => onEditDeck(deck.id)}
            >
              {/* Deck Header */}
              <div className="card-header">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-sm truncate">{deck.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-caption">
                      <span className="capitalize">{deck.format}</span>
                      {deck.archetype && (
                        <>
                          <span>•</span>
                          <span>{deck.archetype}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xl flex-shrink-0">
                    {getColorSymbols(deck.colors)}
                  </div>
                </div>
              </div>

              {/* Deck Body */}
              <div className="card-body space-y-4">
                {/* Card Count */}
                <div className="flex items-center justify-between">
                  <span className="text-small">Cards:</span>
                  <span className={`heading-sm ${deck.isValid ? '' : ''}`} style={{ color: deck.isValid ? 'var(--success)' : 'var(--warning)' }}>
                    {deck.totalCards} / 60
                  </span>
                </div>

                {/* Ownership Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-small">Owned:</span>
                    <span className="heading-sm">{deck.ownedPercentage}%</span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${deck.ownedPercentage}%`,
                        background: deck.ownedPercentage === 100
                          ? 'var(--success)'
                          : deck.ownedPercentage >= 75
                            ? 'var(--accent-primary)'
                            : deck.ownedPercentage >= 50
                              ? 'var(--warning)'
                              : 'var(--error)'
                      }}
                    />
                  </div>
                </div>

                {/* Primary Type */}
                {deck.primaryType && (
                  <div className="flex items-center justify-between">
                    <span className="text-small">Type:</span>
                    <span className="text-small">{deck.primaryType}</span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  {deck.isValid && (
                    <span className="badge badge-success">Valid</span>
                  )}
                  {deck.ownedPercentage === 100 && (
                    <span className="badge badge-primary">Complete</span>
                  )}
                  {deck.ownedPercentage < 100 && deck.ownedPercentage > 0 && (
                    <span className="badge badge-warning">
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
                <div className="relative flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExportingDeckId(exportingDeckId === deck.id ? null : deck.id);
                    }}
                    className="button ghost text-sm w-full"
                    title="Export deck"
                  >
                    Export ▾
                  </button>
                  {exportingDeckId === deck.id && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExportingDeckId(null);
                        }}
                      />
                      {/* Export menu */}
                      <div className="absolute bottom-full mb-1 left-0 right-0 bg-bg-panel border border-border rounded shadow-lg overflow-hidden z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(deck.id, 'arena');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-bg-muted transition-colors text-fg-primary"
                        >
                          MTG Arena Format
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(deck.id, 'plaintext');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-bg-muted transition-colors text-fg-primary border-t border-border"
                        >
                          Plain Text
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(deck.id, 'json');
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-bg-muted transition-colors text-fg-primary border-t border-border"
                        >
                          JSON
                        </button>
                      </div>
                    </>
                  )}
                </div>
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
                <p className="text-caption mt-3">
                  Updated {new Date(deck.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {decks.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h3 className="heading-md">Quick Stats</h3>
          </div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Decks</p>
                <p className="stat-value" style={{ color: 'var(--accent-primary)' }}>{decks.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Valid Decks</p>
                <p className="stat-value" style={{ color: 'var(--success)' }}>{decks.filter(d => d.isValid).length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Complete</p>
                <p className="stat-value" style={{ color: 'var(--accent-secondary)' }}>{decks.filter(d => d.ownedPercentage === 100).length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Collection Cards</p>
                <p className="stat-value">{collection.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
