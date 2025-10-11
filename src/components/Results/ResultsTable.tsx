import React, { useState } from 'react';
import type { CardData } from '../../types';
import { CardDetailModal } from './CardDetailModal';

interface ResultsTableProps {
  cards: CardData[];
  onCardUpdate: (index: number, field: keyof CardData, value: any) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ cards, onCardUpdate }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; field: keyof CardData } | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const handleEdit = (index: number, field: keyof CardData, value: any) => {
    onCardUpdate(index, field, value);
    setEditingCell(null);
  };

  if (cards.length === 0) {
    return (
      <div className="text-center text-fg-muted py-12">
        No cards to display. Upload and process images to see results.
      </div>
    );
  }

  // Get unique pages
  const pages = Array.from(new Set(cards.map(c => c.pageNumber).filter(p => p !== undefined))).sort() as number[];
  const hasMultiplePages = pages.length > 1;

  // Filter cards by selected page
  const filteredCards = selectedPage === 'all'
    ? cards
    : cards.filter(c => c.pageNumber === selectedPage);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-fg-primary">
          Extracted Cards ({filteredCards.length}{selectedPage !== 'all' ? ` of ${cards.length}` : ''})
        </h3>
        {hasMultiplePages && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-fg-muted">Filter by page:</span>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="select"
            >
              <option value="all">All Pages</option>
              {pages.map(page => (
                <option key={page} value={page}>Page {page}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  #
                </th>
                {hasMultiplePages && (
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Page
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Card Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Mana Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  P/T
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card, index) => (
                <tr key={index} className="hover:bg-bg-muted/30 transition-base">
                  <td className="px-4 py-3 text-sm text-fg-secondary">
                    {card.nummer}
                  </td>
                  {hasMultiplePages && (
                    <td className="px-4 py-3 text-sm text-fg-secondary">
                      <span className="badge ok">
                        {card.pageNumber}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-fg-secondary">
                    ({card.positionX}, {card.positionY})
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.row === index && editingCell?.field === 'correctedName' ? (
                      <input
                        type="text"
                        defaultValue={card.correctedName || card.kartenname}
                        onBlur={(e) => handleEdit(index, 'correctedName', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEdit(index, 'correctedName', e.currentTarget.value);
                          }
                          if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        autoFocus
                        className="input px-2 py-1 w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => setEditingCell({ row: index, field: 'correctedName' })}
                          className="flex-1 cursor-pointer hover:bg-bg-muted/40 px-2 py-1 rounded-md transition-fast"
                        >
                          <div className="text-sm text-fg-primary font-medium">
                            {card.correctedName || card.kartenname}
                          </div>
                          {card.correctedName && card.correctedName !== card.kartenname && (
                            <div className="text-xs text-fg-muted line-through">
                              {card.kartenname}
                            </div>
                          )}
                        </div>
                        {card.scryfallMatch && (
                          <button
                            onClick={() => setSelectedCard(card)}
                            className="button ghost text-xs px-2 py-1"
                            title="View card details"
                          >
                            🔍
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-secondary">
                    {card.scryfallMatch?.type_line ? (
                      <span className="text-xs text-fg-secondary">
                        {card.scryfallMatch.type_line.split('—')[0].trim()}
                      </span>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-secondary">
                    {card.scryfallMatch?.cmc !== undefined ? (
                      <span className="badge info">
                        {card.scryfallMatch.cmc}
                      </span>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-secondary">
                    {card.scryfallMatch?.power && card.scryfallMatch?.toughness ? (
                      <span className="badge ok">
                        {card.scryfallMatch.power}/{card.scryfallMatch.toughness}
                      </span>
                    ) : card.scryfallMatch?.loyalty ? (
                      <span className="badge ok">
                        ⚡{card.scryfallMatch.loyalty}
                      </span>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.row === index && editingCell?.field === 'anzahl' ? (
                      <input
                        type="number"
                        min="1"
                        max="4"
                        defaultValue={card.anzahl === -1 ? '' : card.anzahl}
                        placeholder={card.anzahl === -1 ? '∞' : ''}
                        onBlur={(e) => handleEdit(index, 'anzahl', parseInt(e.target.value) || card.anzahl)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEdit(index, 'anzahl', parseInt(e.currentTarget.value) || card.anzahl);
                          }
                        }}
                        autoFocus
                        className="input px-2 py-1 w-16"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCell({ row: index, field: 'anzahl' })}
                        className="cursor-pointer hover:bg-bg-muted/40 px-2 py-1 rounded-md inline-block transition-fast"
                      >
                        <span className="text-sm text-fg-primary">
                          {card.anzahl === -1 ? '∞' : card.anzahl}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="progress w-16">
                        <div
                          className={`bar ${
                            (card.confidence || 0) > 0.8
                              ? '!bg-ok'
                              : (card.confidence || 0) > 0.5
                              ? '!bg-warn'
                              : '!bg-error'
                          }`}
                          style={{ width: `${(card.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-fg-muted">
                        {Math.round((card.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {card.scryfallMatch ? (
                      <span className="badge ok">
                        Verified
                      </span>
                    ) : (
                      <span className="badge warn">
                        Unverified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};
