import React from 'react';
import type { CardData } from '../../types';

interface DeckCard {
  card: CardData;
  count: number;
}

interface DeckStatisticsProps {
  deckCards: DeckCard[];
  totalCards: number;
}

export const DeckStatistics: React.FC<DeckStatisticsProps> = ({ deckCards, totalCards }) => {
  // Calculate color distribution
  const colorCounts = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    C: 0 // Colorless
  };

  deckCards.forEach(dc => {
    const colors = dc.card.scryfallMatch?.colors || [];
    if (colors.length === 0) {
      colorCounts.C += dc.count;
    } else {
      colors.forEach(color => {
        if (color in colorCounts) {
          colorCounts[color as keyof typeof colorCounts] += dc.count;
        }
      });
    }
  });

  const totalColorPips = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);

  // Calculate type distribution
  const typeCounts = {
    creatures: 0,
    spells: 0,
    artifacts: 0,
    enchantments: 0,
    planeswalkers: 0,
    lands: 0
  };

  deckCards.forEach(dc => {
    const type = dc.card.scryfallMatch?.type_line?.toLowerCase() || '';
    if (type.includes('land')) {
      typeCounts.lands += dc.count;
    } else if (type.includes('creature')) {
      typeCounts.creatures += dc.count;
    } else if (type.includes('planeswalker')) {
      typeCounts.planeswalkers += dc.count;
    } else if (type.includes('instant') || type.includes('sorcery')) {
      typeCounts.spells += dc.count;
    } else if (type.includes('artifact')) {
      typeCounts.artifacts += dc.count;
    } else if (type.includes('enchantment')) {
      typeCounts.enchantments += dc.count;
    }
  });

  // Calculate average CMC (excluding lands)
  const cardsWithCmc = deckCards.filter(dc => {
    const type = dc.card.scryfallMatch?.type_line?.toLowerCase() || '';
    return !type.includes('land');
  });

  const totalCmc = cardsWithCmc.reduce((sum, dc) => {
    return sum + (dc.card.scryfallMatch?.cmc || 0) * dc.count;
  }, 0);

  const nonLandCards = cardsWithCmc.reduce((sum, dc) => sum + dc.count, 0);
  const avgCmc = nonLandCards > 0 ? (totalCmc / nonLandCards).toFixed(2) : '0.00';

  // Color display config
  const colorConfig = {
    W: { name: 'White', bg: '#F0E68C', text: '#000' },
    U: { name: 'Blue', bg: '#0E68AB', text: '#FFF' },
    B: { name: 'Black', bg: '#150B00', text: '#FFF' },
    R: { name: 'Red', bg: '#D3202A', text: '#FFF' },
    G: { name: 'Green', bg: '#00733E', text: '#FFF' },
    C: { name: 'Colorless', bg: '#BEB9B2', text: '#000' }
  };

  return (
    <div className="space-y-4">
      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-fg-primary">{totalCards}</div>
          <div className="text-xs text-fg-secondary">Total Cards</div>
        </div>
        <div className="bg-bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-accent">{avgCmc}</div>
          <div className="text-xs text-fg-secondary">Avg CMC</div>
        </div>
        <div className="bg-bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-ok">{typeCounts.lands}</div>
          <div className="text-xs text-fg-secondary">Lands</div>
        </div>
      </div>

      {/* Color Distribution */}
      <div>
        <h4 className="text-sm font-semibold text-fg-secondary mb-2">Color Distribution</h4>
        <div className="space-y-2">
          {Object.entries(colorCounts).map(([color, count]) => {
            if (count === 0) return null;
            const config = colorConfig[color as keyof typeof colorConfig];
            const percentage = totalColorPips > 0 ? (count / totalColorPips) * 100 : 0;

            return (
              <div key={color} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: config.bg, color: config.text }}
                    >
                      {color}
                    </span>
                    <span className="text-fg-secondary">{config.name}</span>
                  </span>
                  <span className="text-fg-primary font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-bg-base rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: config.bg
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Type Breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-fg-secondary mb-2">Type Breakdown</h4>
        <div className="space-y-1">
          {Object.entries(typeCounts).map(([type, count]) => {
            if (count === 0) return null;
            const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;

            return (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="text-fg-secondary capitalize">{type}</span>
                <span className="flex items-center gap-2">
                  <span className="text-fg-primary font-semibold">{count}</span>
                  <span className="text-fg-muted">({percentage.toFixed(0)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deck Health Indicators */}
      <div>
        <h4 className="text-sm font-semibold text-fg-secondary mb-2">Deck Health</h4>
        <div className="space-y-2">
          {/* Land Ratio */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-secondary">Land Ratio</span>
            <span className={`font-semibold ${
              typeCounts.lands >= 22 && typeCounts.lands <= 26 ? 'text-ok' :
              typeCounts.lands >= 17 ? 'text-warn' : 'text-error'
            }`}>
              {typeCounts.lands >= 22 && typeCounts.lands <= 26 ? '✓ Optimal' :
               typeCounts.lands >= 17 ? '⚠ Acceptable' : '✗ Too Few'}
            </span>
          </div>

          {/* Curve Balance */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-secondary">Mana Curve</span>
            <span className={`font-semibold ${
              parseFloat(avgCmc) <= 3.5 ? 'text-ok' :
              parseFloat(avgCmc) <= 4.5 ? 'text-warn' : 'text-error'
            }`}>
              {parseFloat(avgCmc) <= 3.5 ? '✓ Good' :
               parseFloat(avgCmc) <= 4.5 ? '⚠ High' : '✗ Very High'}
            </span>
          </div>

          {/* Creature Count */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-fg-secondary">Creature Count</span>
            <span className={`font-semibold ${
              typeCounts.creatures >= 12 ? 'text-ok' :
              typeCounts.creatures >= 8 ? 'text-warn' : 'text-error'
            }`}>
              {typeCounts.creatures >= 12 ? '✓ Good' :
               typeCounts.creatures >= 8 ? '⚠ Low' : '✗ Very Low'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
