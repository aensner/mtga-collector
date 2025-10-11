import React, { useState } from 'react';
import type { CardData } from '../../types';
import { CardDetailModal } from './CardDetailModal';
import { FilterPanel, type FilterCriteria } from './FilterPanel';

interface ResultsTableProps {
  cards: CardData[];
  onCardUpdate: (index: number, field: keyof CardData, value: any) => void;
}

type SortField = 'nummer' | 'pageNumber' | 'position' | 'name' | 'type' | 'cmc' | 'power' | 'toughness' | 'loyalty' | 'quantity' | 'confidence';
type SortDirection = 'asc' | 'desc' | null;

export const ResultsTable: React.FC<ResultsTableProps> = ({ cards, onCardUpdate }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; field: keyof CardData } | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<FilterCriteria>({
    colors: [],
    cardTypes: [],
    cmcMin: null,
    cmcMax: null,
    rarities: [],
    powerMin: null,
    powerMax: null,
    toughnesMin: null,
    toughnessMax: null,
    searchText: ''
  });

  const handleEdit = (index: number, field: keyof CardData, value: any) => {
    onCardUpdate(index, field, value);
    setEditingCell(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleFiltersChange = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      colors: [],
      cardTypes: [],
      cmcMin: null,
      cmcMax: null,
      rarities: [],
      powerMin: null,
      powerMax: null,
      toughnesMin: null,
      toughnessMax: null,
      searchText: ''
    });
    setCurrentPage(1);
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => {
    const isActive = sortField === field;
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-bg-muted/40 transition-fast select-none"
        onClick={() => handleSort(field)}
        title="Click to sort"
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive && (
            <span className="text-accent">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
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
  let filteredCards = selectedPage === 'all'
    ? cards
    : cards.filter(c => c.pageNumber === selectedPage);

  // Apply advanced filters
  filteredCards = filteredCards.filter(card => {
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const cardName = (card.scryfallMatch?.name || card.correctedName || card.kartenname).toLowerCase();
      if (!cardName.includes(searchLower)) return false;
    }

    // Color filter (card must have at least one of the selected colors)
    if (filters.colors.length > 0) {
      const cardColors = card.scryfallMatch?.colors || [];
      const hasMatchingColor = filters.colors.some(filterColor =>
        cardColors.includes(filterColor)
      );
      if (!hasMatchingColor) return false;
    }

    // Rarity filter
    if (filters.rarities.length > 0) {
      const cardRarity = card.scryfallMatch?.rarity?.toLowerCase();
      if (!cardRarity || !filters.rarities.includes(cardRarity)) return false;
    }

    // CMC filter
    const cmc = card.scryfallMatch?.cmc;
    if (filters.cmcMin !== null && (cmc === undefined || cmc < filters.cmcMin)) return false;
    if (filters.cmcMax !== null && (cmc === undefined || cmc > filters.cmcMax)) return false;

    // Power filter
    if (filters.powerMin !== null || filters.powerMax !== null) {
      const power = card.scryfallMatch?.power ? parseFloat(card.scryfallMatch.power) : null;
      if (filters.powerMin !== null && (power === null || power < filters.powerMin)) return false;
      if (filters.powerMax !== null && (power === null || power > filters.powerMax)) return false;
    }

    // Toughness filter
    if (filters.toughnesMin !== null || filters.toughnessMax !== null) {
      const toughness = card.scryfallMatch?.toughness ? parseFloat(card.scryfallMatch.toughness) : null;
      if (filters.toughnesMin !== null && (toughness === null || toughness < filters.toughnesMin)) return false;
      if (filters.toughnessMax !== null && (toughness === null || toughness > filters.toughnessMax)) return false;
    }

    return true;
  });

  // Sort cards
  if (sortField && sortDirection) {
    filteredCards = [...filteredCards].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'nummer':
          aVal = a.nummer;
          bVal = b.nummer;
          break;
        case 'pageNumber':
          aVal = a.pageNumber ?? 0;
          bVal = b.pageNumber ?? 0;
          break;
        case 'position':
          aVal = a.positionY * 1000 + a.positionX;
          bVal = b.positionY * 1000 + b.positionX;
          break;
        case 'name':
          aVal = (a.scryfallMatch?.name || a.correctedName || a.kartenname).toLowerCase();
          bVal = (b.scryfallMatch?.name || b.correctedName || b.kartenname).toLowerCase();
          break;
        case 'type':
          aVal = a.scryfallMatch?.type_line?.split('—')[0].trim().toLowerCase() ?? '';
          bVal = b.scryfallMatch?.type_line?.split('—')[0].trim().toLowerCase() ?? '';
          break;
        case 'cmc':
          aVal = a.scryfallMatch?.cmc ?? 0;
          bVal = b.scryfallMatch?.cmc ?? 0;
          break;
        case 'power':
          aVal = a.scryfallMatch?.power ? parseFloat(a.scryfallMatch.power) : -999;
          bVal = b.scryfallMatch?.power ? parseFloat(b.scryfallMatch.power) : -999;
          break;
        case 'toughness':
          aVal = a.scryfallMatch?.toughness ? parseFloat(a.scryfallMatch.toughness) : -999;
          bVal = b.scryfallMatch?.toughness ? parseFloat(b.scryfallMatch.toughness) : -999;
          break;
        case 'loyalty':
          aVal = a.scryfallMatch?.loyalty ? parseFloat(a.scryfallMatch.loyalty) : -999;
          bVal = b.scryfallMatch?.loyalty ? parseFloat(b.scryfallMatch.loyalty) : -999;
          break;
        case 'quantity':
          aVal = a.anzahl;
          bVal = b.anzahl;
          break;
        case 'confidence':
          aVal = a.confidence ?? 0;
          bVal = b.confidence ?? 0;
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredCards.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCards = filteredCards.slice(startIndex, endIndex);

  return (
    <div className="mt-8">
      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

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
                <SortableHeader field="nummer">#</SortableHeader>
                {hasMultiplePages && (
                  <SortableHeader field="pageNumber">Page</SortableHeader>
                )}
                <SortableHeader field="position">Position</SortableHeader>
                <SortableHeader field="name">Card Name</SortableHeader>
                <SortableHeader field="type">Type</SortableHeader>
                <SortableHeader field="cmc">Mana Value</SortableHeader>
                <SortableHeader field="power">Power</SortableHeader>
                <SortableHeader field="toughness">Toughness</SortableHeader>
                <SortableHeader field="loyalty">Loyalty</SortableHeader>
                <SortableHeader field="quantity">Quantity</SortableHeader>
                <SortableHeader field="confidence">Confidence</SortableHeader>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCards.map((card, index) => (
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
                            {card.scryfallMatch?.name || card.correctedName || card.kartenname}
                          </div>
                          {card.scryfallMatch?.name && card.scryfallMatch.name !== card.kartenname && (
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
                  <td className="px-4 py-3 text-sm text-fg-secondary text-center">
                    {card.scryfallMatch?.power ? (
                      <span className="badge ok">
                        {card.scryfallMatch.power}
                      </span>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-secondary text-center">
                    {card.scryfallMatch?.toughness ? (
                      <span className="badge ok">
                        {card.scryfallMatch.toughness}
                      </span>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-secondary text-center">
                    {card.scryfallMatch?.loyalty ? (
                      <span className="badge ok">
                        {card.scryfallMatch.loyalty}
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

        {/* Pagination Controls */}
        <div className="card-actions flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-sm text-fg-secondary">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCards.length)} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-fg-muted">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="select text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="button ghost text-sm"
              title="First page"
            >
              ««
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="button ghost text-sm"
              title="Previous page"
            >
              «
            </button>
            <span className="text-sm text-fg-secondary px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="button ghost text-sm"
              title="Next page"
            >
              »
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="button ghost text-sm"
              title="Last page"
            >
              »»
            </button>
          </div>
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
