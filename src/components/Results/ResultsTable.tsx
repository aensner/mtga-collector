import React, { useState } from 'react';
import type { CardData } from '../../types';

interface ResultsTableProps {
  cards: CardData[];
  onCardUpdate: (index: number, field: keyof CardData, value: any) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ cards, onCardUpdate }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; field: keyof CardData } | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');

  const handleEdit = (index: number, field: keyof CardData, value: any) => {
    onCardUpdate(index, field, value);
    setEditingCell(null);
  };

  if (cards.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
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
        <h3 className="text-xl font-bold text-white">
          Extracted Cards ({filteredCards.length}{selectedPage !== 'all' ? ` of ${cards.length}` : ''})
        </h3>
        {hasMultiplePages && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter by page:</span>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Pages</option>
              {pages.map(page => (
                <option key={page} value={page}>Page {page}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  #
                </th>
                {hasMultiplePages && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Page
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Card Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCards.map((card, index) => (
                <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {card.nummer}
                  </td>
                  {hasMultiplePages && (
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-700">
                        {card.pageNumber}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-300">
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
                        }}
                        autoFocus
                        className="bg-gray-700 text-white px-2 py-1 rounded w-full"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCell({ row: index, field: 'correctedName' })}
                        className="cursor-pointer hover:bg-gray-600/30 px-2 py-1 rounded"
                      >
                        <div className="text-sm text-white font-medium">
                          {card.correctedName || card.kartenname}
                        </div>
                        {card.correctedName && card.correctedName !== card.kartenname && (
                          <div className="text-xs text-gray-500 line-through">
                            {card.kartenname}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.row === index && editingCell?.field === 'anzahl' ? (
                      <input
                        type="number"
                        min="1"
                        max="4"
                        defaultValue={card.anzahl}
                        onBlur={(e) => handleEdit(index, 'anzahl', parseInt(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEdit(index, 'anzahl', parseInt(e.currentTarget.value));
                          }
                        }}
                        autoFocus
                        className="bg-gray-700 text-white px-2 py-1 rounded w-16"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCell({ row: index, field: 'anzahl' })}
                        className="cursor-pointer hover:bg-gray-600/30 px-2 py-1 rounded inline-block"
                      >
                        <span className="text-sm text-white">{card.anzahl}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (card.confidence || 0) > 0.8
                              ? 'bg-green-500'
                              : (card.confidence || 0) > 0.5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${(card.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {Math.round((card.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {card.scryfallMatch ? (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
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
    </div>
  );
};
