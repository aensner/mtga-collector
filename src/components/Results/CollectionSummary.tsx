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
    <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Collection Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Cards</div>
          <div className="text-2xl font-bold text-white">{totalCards}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Unique Cards</div>
          <div className="text-2xl font-bold text-blue-400">{uniqueCards}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Quantity</div>
          <div className="text-2xl font-bold text-green-400">{totalQuantity}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Avg Confidence</div>
          <div className="text-2xl font-bold text-yellow-400">{(avgConfidence * 100).toFixed(1)}%</div>
        </div>
      </div>

      {pages.length > 1 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Per-Page Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pageStats.map(stat => (
              <div key={stat.page} className="bg-gray-900/30 rounded px-3 py-2 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Page {stat.page}</span>
                  <span className="text-sm font-medium text-white">{stat.cardCount} cards</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Qty: {stat.totalQuantity}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="text-gray-400">
          Scryfall Matches: <span className="text-green-400 font-medium">{scryfallMatches}/{totalCards}</span>
        </div>
        {pages.length > 1 && (
          <div className="text-gray-400">
            Pages Processed: <span className="text-blue-400 font-medium">{pages.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
