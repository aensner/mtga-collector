import React, { useState } from 'react';
import type { CardData } from '../../types';
import { downloadFile } from '../../utils/csvParser';
import { exportToArena } from '../../utils/arenaExport';
import { DeckStatistics } from './DeckStatistics';

interface DeckCard {
  card: CardData;
  count: number;
}

interface DeckListProps {
  deckCards: DeckCard[];
  deckName: string;
  format: string;
  manaCurve: { cmc: number; count: number }[];
  totalCards: number;
  onRemoveCard: (card: CardData, count: number) => void;
  onSetCardCount: (card: CardData, count: number) => void;
  onClearDeck: () => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  deckCards,
  deckName,
  format: _format,
  manaCurve,
  totalCards,
  onRemoveCard,
  onSetCardCount,
  onClearDeck
}) => {
  const [hoveredCmc, setHoveredCmc] = useState<number | null>(null);
  const [selectedCmc, setSelectedCmc] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');
  // Group cards by type
  const groupedCards = {
    creatures: deckCards.filter(dc => dc.card.scryfallMatch?.type_line?.includes('Creature')),
    planeswalkers: deckCards.filter(dc => dc.card.scryfallMatch?.type_line?.includes('Planeswalker')),
    spells: deckCards.filter(dc => {
      const type = dc.card.scryfallMatch?.type_line || '';
      return (type.includes('Instant') || type.includes('Sorcery')) && !type.includes('Creature');
    }),
    artifacts: deckCards.filter(dc => {
      const type = dc.card.scryfallMatch?.type_line || '';
      return type.includes('Artifact') && !type.includes('Creature');
    }),
    enchantments: deckCards.filter(dc => {
      const type = dc.card.scryfallMatch?.type_line || '';
      return type.includes('Enchantment') && !type.includes('Creature');
    }),
    lands: deckCards.filter(dc => dc.card.scryfallMatch?.type_line?.includes('Land'))
  };

  const exportDeck = () => {
    try {
      // Convert DeckCards to CardData array with repeated cards
      const expandedCards: CardData[] = [];
      deckCards.forEach(dc => {
        for (let i = 0; i < dc.count; i++) {
          expandedCards.push(dc.card);
        }
      });

      const deckText = exportToArena(expandedCards);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${deckName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.txt`;
      downloadFile(deckText, filename, 'text/plain');
      alert(`✅ Exported "${deckName}" to Arena format!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export deck: ' + (error as Error).message);
    }
  };

  const maxCurveCount = Math.max(...manaCurve.map(mc => mc.count), 1);

  // Get cards at specific CMC
  const getCardsAtCmc = (cmc: number) => {
    return deckCards.filter(dc => {
      const cardCmc = dc.card.scryfallMatch?.cmc || 0;
      return cmc === 7 ? cardCmc >= 7 : cardCmc === cmc;
    });
  };

  // Filter displayed cards by selected CMC
  const displayedCards = selectedCmc !== null ? getCardsAtCmc(selectedCmc) : deckCards;

  // Helper to get card color badge
  const getColorBadge = (colors?: string[]) => {
    if (!colors || colors.length === 0) return null;

    const colorMap: Record<string, { bg: string; text: string; name: string }> = {
      'W': { bg: '#F0E68C', text: '#000', name: 'W' },
      'U': { bg: '#0E68AB', text: '#FFF', name: 'U' },
      'B': { bg: '#150B00', text: '#FFF', name: 'B' },
      'R': { bg: '#D3202A', text: '#FFF', name: 'R' },
      'G': { bg: '#00733E', text: '#FFF', name: 'G' }
    };

    return (
      <div className="flex gap-0.5">
        {colors.map((color, i) => {
          const style = colorMap[color];
          if (!style) return null;
          return (
            <span
              key={i}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: style.bg, color: style.text }}
              title={color}
            >
              {style.name}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">Deck ({totalCards})</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'visual' : 'list')}
              className="button ghost text-sm"
              title={`Switch to ${viewMode === 'list' ? 'visual' : 'list'} mode`}
            >
              {viewMode === 'list' ? '🖼️ Visual' : '📋 List'}
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="button ghost text-sm"
              title="Toggle statistics"
            >
              {showStats ? '📊 Hide Stats' : '📊 Stats'}
            </button>
            <button onClick={exportDeck} className="button ok text-sm" disabled={totalCards === 0}>
              Export
            </button>
            <button onClick={onClearDeck} className="button danger text-sm" disabled={totalCards === 0}>
              Clear
            </button>
          </div>
        </div>

      <div className="card-body space-y-4">
        {/* Statistics Panel */}
        {showStats && (
          <div className="bg-bg-base rounded-lg p-4 border border-border-subtle animate-slideInUp">
            <DeckStatistics deckCards={deckCards} totalCards={totalCards} />
          </div>
        )}

        {/* Enhanced Mana Curve */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-fg-secondary">Mana Curve</h4>
            {selectedCmc !== null && (
              <button
                onClick={() => setSelectedCmc(null)}
                className="text-xs text-accent hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex items-end gap-1 h-24 mb-2">
            {manaCurve.map(mc => {
              const isHovered = hoveredCmc === mc.cmc;
              const isSelected = selectedCmc === mc.cmc;

              return (
                <div
                  key={mc.cmc}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
                  onMouseEnter={() => setHoveredCmc(mc.cmc)}
                  onMouseLeave={() => setHoveredCmc(null)}
                  onClick={() => setSelectedCmc(selectedCmc === mc.cmc ? null : mc.cmc)}
                  title={`${mc.count} cards • Click to filter`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      isSelected ? 'bg-ok' :
                      isHovered ? 'bg-accent-600' : 'bg-accent'
                    }`}
                    style={{
                      height: `${(mc.count / maxCurveCount) * 80}px`,
                      minHeight: mc.count > 0 ? '4px' : '0'
                    }}
                  />
                  <span className="text-xs text-fg-muted">{mc.cmc === 7 ? '7+' : mc.cmc}</span>
                  <span className={`text-xs font-semibold ${
                    isSelected ? 'text-ok' : 'text-fg-secondary'
                  }`}>
                    {mc.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Tooltip for hovered CMC */}
          {hoveredCmc !== null && getCardsAtCmc(hoveredCmc).length > 0 && (
            <div className="bg-bg-muted rounded p-2 text-xs animate-fadeIn">
              <div className="font-semibold text-fg-secondary mb-1">
                CMC {hoveredCmc === 7 ? '7+' : hoveredCmc}:
              </div>
              {getCardsAtCmc(hoveredCmc).slice(0, 5).map((dc, i) => (
                <div key={i} className="text-fg-primary">
                  {dc.count}x {dc.card.scryfallMatch?.name || dc.card.kartenname}
                </div>
              ))}
              {getCardsAtCmc(hoveredCmc).length > 5 && (
                <div className="text-fg-muted italic mt-1">
                  +{getCardsAtCmc(hoveredCmc).length - 5} more...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visual Mode - Card Grid */}
        {viewMode === 'visual' && (
          <div>
            <h4 className="text-sm font-semibold text-fg-secondary mb-3">
              Cards ({displayedCards.length} unique • {displayedCards.reduce((sum, dc) => sum + dc.count, 0)} total)
            </h4>
            <div className="grid grid-cols-3 gap-2 max-h-[600px] overflow-y-auto">
              {displayedCards.map((dc, index) => {
                const imageUrl = dc.card.scryfallMatch?.image_uris?.small || dc.card.scryfallMatch?.image_uris?.normal;
                const uniqueKey = dc.card.scryfallMatch?.id || `${dc.card.kartenname}-${index}`;
                return (
                  <div
                    key={uniqueKey}
                    className="relative group"
                    title={`${dc.card.scryfallMatch?.name || dc.card.kartenname} (${dc.count}x)`}
                  >
                    {imageUrl ? (
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={dc.card.scryfallMatch?.name || dc.card.kartenname}
                          className="w-full rounded-lg shadow-md transition-transform group-hover:scale-105 group-hover:shadow-xl"
                        />
                        {/* Count Badge */}
                        <div className="absolute top-1 right-1 bg-bg-base/90 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm border-2 border-accent shadow-lg">
                          {dc.count}
                        </div>
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCard(dc.card, 1);
                          }}
                          className="absolute bottom-1 right-1 bg-error/90 hover:bg-error rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove one"
                        >
                          −
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-[5/7] bg-bg-muted rounded-lg flex items-center justify-center p-2 text-center">
                        <div>
                          <div className="text-fg-primary text-xs font-semibold mb-1">
                            {dc.card.scryfallMatch?.name || dc.card.kartenname}
                          </div>
                          <div className="text-fg-muted text-xs">×{dc.count}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List Mode - Grouped by Type */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {Object.entries(groupedCards).map(([category, cards]) => {
              // Filter cards by selected CMC
              const filteredCards = selectedCmc !== null
                ? cards.filter(dc => {
                    const cmc = dc.card.scryfallMatch?.cmc || 0;
                    return selectedCmc === 7 ? cmc >= 7 : cmc === selectedCmc;
                  })
                : cards;

              if (filteredCards.length === 0) return null;

              const categoryTotal = filteredCards.reduce((sum, dc) => sum + dc.count, 0);

              return (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-fg-secondary mb-1 capitalize">
                    {category} ({categoryTotal})
                  </h4>
                  <div className="space-y-1">
                    {filteredCards.map((dc, index) => {
                      const imageUrl = dc.card.scryfallMatch?.image_uris?.small;
                      const uniqueKey = dc.card.scryfallMatch?.id || `${dc.card.kartenname}-${index}`;
                      return (
                        <div
                          key={uniqueKey}
                          className="flex items-center gap-2 text-sm hover:bg-bg-muted/40 px-2 py-1 rounded transition-fast"
                        >
                          {/* Card Thumbnail */}
                          {imageUrl && (
                            <div
                              className="w-8 h-11 bg-bg-muted rounded flex-shrink-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${imageUrl})` }}
                            />
                          )}

                          <input
                            type="number"
                            min="0"
                            max={dc.card.anzahl}
                            value={dc.count}
                            onChange={(e) => {
                              e.stopPropagation();
                              onSetCardCount(dc.card, parseInt(e.target.value) || 0);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="input w-12 text-center"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-fg-primary flex items-center gap-2">
                              <span className="truncate">{dc.card.scryfallMatch?.name || dc.card.kartenname}</span>
                              {getColorBadge(dc.card.scryfallMatch?.colors)}
                            </div>
                          </div>
                          <span className="badge info text-xs flex-shrink-0">
                            {dc.card.scryfallMatch?.cmc || 0}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveCard(dc.card, 1);
                            }}
                            className="button ghost text-xs px-2 flex-shrink-0"
                            title="Remove one"
                          >
                            −
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {deckCards.length === 0 && (
          <div className="text-center text-fg-muted py-8">
            Add cards from your collection to build a deck
          </div>
        )}
      </div>
    </div>

    </>
  );
};
