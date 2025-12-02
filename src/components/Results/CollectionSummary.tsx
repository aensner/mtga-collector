import React from 'react';
import type { CardData } from '../../types';

interface CollectionSummaryProps {
  cards: CardData[];
}

export const CollectionSummary: React.FC<CollectionSummaryProps> = ({ cards }) => {
  if (cards.length === 0) {
    return null;
  }

  // Calculate statistics
  const pages = Array.from(new Set(cards.map(c => c.pageNumber).filter(p => p !== undefined)));
  const totalCards = cards.length;
  const totalQuantity = cards.reduce((sum, card) => sum + card.anzahl, 0);
  const uniqueCards = new Set(cards.map(c => (c.correctedName || c.kartenname).toLowerCase())).size;
  const avgConfidence = cards.reduce((sum, card) => sum + (card.confidence || 0), 0) / totalCards;
  const scryfallMatches = cards.filter(c => c.scryfallMatch).length;

  // Per-page statistics
  const pageStats = pages.map(pageNum => {
    const pageCards = cards.filter(c => c.pageNumber === pageNum);
    return {
      page: pageNum,
      cardCount: pageCards.length,
      totalQuantity: pageCards.reduce((sum, card) => sum + card.anzahl, 0),
    };
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="heading-md">Collection Summary</h3>
      </div>

      <div className="card-body">
        <div className="stats-grid mb-8">
          <div className="stat-card">
            <div className="stat-label">Total Cards</div>
            <div className="stat-value">{totalCards}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unique Cards</div>
            <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>{uniqueCards}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Quantity</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{totalQuantity}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Confidence</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{(avgConfidence * 100).toFixed(1)}%</div>
          </div>
        </div>

        {pages.length > 1 && (
          <div className="section">
            <div className="section-header">
              <div>
                <h4 className="heading-sm">Per-Page Breakdown</h4>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pageStats.map(stat => (
                <div
                  key={stat.page}
                  className="stat-card"
                  style={{ padding: '16px 20px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-caption">Page {stat.page}</span>
                    <span className="text-small" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {stat.cardCount} cards
                    </span>
                  </div>
                  <div className="text-caption mt-2">Qty: {stat.totalQuantity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-between text-small pt-6"
          style={{ borderTop: '1px solid var(--border-primary)' }}
        >
          <div>
            Scryfall Matches:{' '}
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>
              {scryfallMatches}/{totalCards}
            </span>
          </div>
          {pages.length > 1 && (
            <div>
              Pages Processed:{' '}
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>
                {pages.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
