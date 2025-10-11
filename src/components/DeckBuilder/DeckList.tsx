import React from 'react';
import type { CardData } from '../../types';
import { downloadFile } from '../../utils/csvParser';
import { exportToArena } from '../../utils/arenaExport';

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
  format,
  manaCurve,
  totalCards,
  onRemoveCard,
  onSetCardCount,
  onClearDeck
}) => {
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

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-semibold">Deck ({totalCards})</h3>
        <div className="flex gap-2">
          <button onClick={exportDeck} className="button ok text-sm" disabled={totalCards === 0}>
            Export
          </button>
          <button onClick={onClearDeck} className="button danger text-sm" disabled={totalCards === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className="card-body space-y-4">
        {/* Mana Curve */}
        <div>
          <h4 className="text-sm font-semibold text-fg-secondary mb-2">Mana Curve</h4>
          <div className="flex items-end gap-1 h-24">
            {manaCurve.map(mc => (
              <div key={mc.cmc} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-accent rounded-t transition-all"
                  style={{
                    height: `${(mc.count / maxCurveCount) * 80}px`,
                    minHeight: mc.count > 0 ? '4px' : '0'
                  }}
                  title={`${mc.count} cards`}
                />
                <span className="text-xs text-fg-muted">{mc.cmc === 7 ? '7+' : mc.cmc}</span>
                <span className="text-xs text-fg-secondary font-semibold">{mc.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Groups */}
        <div className="space-y-3">
          {Object.entries(groupedCards).map(([category, cards]) => {
            if (cards.length === 0) return null;

            const categoryTotal = cards.reduce((sum, dc) => sum + dc.count, 0);

            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-fg-secondary mb-1 capitalize">
                  {category} ({categoryTotal})
                </h4>
                <div className="space-y-1">
                  {cards.map(dc => (
                    <div
                      key={dc.card.scryfallMatch?.id}
                      className="flex items-center gap-2 text-sm hover:bg-bg-muted/40 px-2 py-1 rounded transition-fast"
                    >
                      <input
                        type="number"
                        min="0"
                        max={dc.card.anzahl}
                        value={dc.count}
                        onChange={(e) => onSetCardCount(dc.card, parseInt(e.target.value) || 0)}
                        className="input w-12 text-center"
                      />
                      <span className="flex-1 text-fg-primary">
                        {dc.card.scryfallMatch?.name || dc.card.kartenname}
                      </span>
                      <span className="badge info text-xs">
                        {dc.card.scryfallMatch?.cmc || 0}
                      </span>
                      <button
                        onClick={() => onRemoveCard(dc.card, 1)}
                        className="button ghost text-xs px-2"
                        title="Remove one"
                      >
                        −
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {deckCards.length === 0 && (
          <div className="text-center text-fg-muted py-8">
            Add cards from your collection to build a deck
          </div>
        )}
      </div>
    </div>
  );
};
