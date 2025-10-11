import React, { useState } from 'react';
import type { CardData } from '../../types';

interface DeckCard {
  card: CardData;
  count: number;
}

interface CollectionViewProps {
  collection: CardData[];
  deckCards: DeckCard[];
  onAddCard: (card: CardData, count: number) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  collection,
  deckCards,
  onAddCard
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter collection
  const filteredCollection = collection.filter(card => {
    // Search filter
    if (searchText) {
      const name = (card.scryfallMatch?.name || card.kartenname).toLowerCase();
      if (!name.includes(searchText.toLowerCase())) return false;
    }

    // Type filter
    if (filterType !== 'all') {
      const type = card.scryfallMatch?.type_line?.toLowerCase() || '';
      if (!type.includes(filterType)) return false;
    }

    return true;
  });

  // Get count of card in deck
  const getCardCountInDeck = (card: CardData): number => {
    const deckCard = deckCards.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
    return deckCard?.count || 0;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">Collection ({filteredCollection.length})</h3>
      </div>

      <div className="card-body space-y-3">
        {/* Search and Filter */}
        <div className="space-y-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search cards..."
            className="input w-full"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select w-full"
          >
            <option value="all">All Types</option>
            <option value="creature">Creatures</option>
            <option value="instant">Instants</option>
            <option value="sorcery">Sorceries</option>
            <option value="enchantment">Enchantments</option>
            <option value="artifact">Artifacts</option>
            <option value="planeswalker">Planeswalkers</option>
            <option value="land">Lands</option>
          </select>
        </div>

        {/* Card List */}
        <div className="max-h-[600px] overflow-y-auto space-y-1">
          {filteredCollection.map((card, index) => {
            const inDeck = getCardCountInDeck(card);
            const available = card.anzahl - inDeck;

            return (
              <div
                key={index}
                className="flex items-center gap-2 text-sm hover:bg-bg-muted/40 px-2 py-2 rounded transition-fast"
              >
                <button
                  onClick={() => onAddCard(card, 1)}
                  className="button ok text-xs px-2 flex-shrink-0"
                  disabled={available <= 0}
                  title={available > 0 ? 'Add one to deck' : 'No more available'}
                >
                  +
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-fg-primary font-medium truncate">
                    {card.scryfallMatch?.name || card.kartenname}
                  </div>
                  <div className="text-xs text-fg-muted flex items-center gap-2">
                    <span>{card.scryfallMatch?.type_line?.split('—')[0].trim()}</span>
                    {card.scryfallMatch?.cmc !== undefined && (
                      <span className="badge info text-xs">
                        CMC {card.scryfallMatch.cmc}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 text-xs">
                  <span className="text-fg-secondary">
                    {inDeck > 0 && (
                      <span className="text-accent font-semibold">{inDeck} in deck</span>
                    )}
                  </span>
                  <span className={available > 0 ? 'text-ok' : 'text-fg-muted'}>
                    {available}/{card.anzahl} avail
                  </span>
                </div>
              </div>
            );
          })}

          {filteredCollection.length === 0 && (
            <div className="text-center text-fg-muted py-8">
              No cards match your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
