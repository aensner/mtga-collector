import React, { useState } from 'react';
import type { CardData } from '../../types';
import { CardPreview } from './CardPreview';

interface DeckCard {
  card: CardData;
  count: number;
}

interface CollectionViewProps {
  collection: CardData[];
  deckCards: DeckCard[];
  onAddCard: (card: CardData, count: number) => void;
}

type SortOption = 'name' | 'cmc' | 'rarity' | 'color';

export const CollectionView: React.FC<CollectionViewProps> = ({
  collection,
  deckCards,
  onAddCard
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterOwnership, setFilterOwnership] = useState<string>('owned'); // Default to "I Own"
  const [cmcRange, setCmcRange] = useState<[number, number]>([0, 20]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [previewCard, setPreviewCard] = useState<CardData | null>(null);

  // Filter and sort collection
  const filteredCollection = collection
    .filter(card => {
      // Search filter
      if (searchText) {
        const name = (card.scryfallMatch?.name || card.kartenname).toLowerCase();
        const oracle = card.scryfallMatch?.oracle_text?.toLowerCase() || '';
        const search = searchText.toLowerCase();
        if (!name.includes(search) && !oracle.includes(search)) return false;
      }

      // Type filter
      if (filterType !== 'all') {
        const type = card.scryfallMatch?.type_line?.toLowerCase() || '';
        if (!type.includes(filterType)) return false;
      }

      // Color filter
      if (filterColor !== 'all') {
        const colors = card.scryfallMatch?.colors || [];
        if (filterColor === 'colorless') {
          if (colors.length > 0) return false;
        } else {
          if (!colors.includes(filterColor)) return false;
        }
      }

      // Rarity filter
      if (filterRarity !== 'all') {
        const rarity = card.scryfallMatch?.rarity?.toLowerCase() || '';
        if (rarity !== filterRarity) return false;
      }

      // Ownership filter
      if (filterOwnership !== 'all') {
        const inDeck = deckCards.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id)?.count || 0;
        const available = card.anzahl - inDeck;

        if (filterOwnership === 'owned' && available <= 0) return false;
        if (filterOwnership === 'indeck' && inDeck === 0) return false;
        if (filterOwnership === 'available' && (available <= 0 || inDeck > 0)) return false;
      }

      // CMC filter
      const cmc = card.scryfallMatch?.cmc || 0;
      if (cmc < cmcRange[0] || cmc > cmcRange[1]) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.scryfallMatch?.name || a.kartenname).localeCompare(
            b.scryfallMatch?.name || b.kartenname
          );
        case 'cmc':
          return (a.scryfallMatch?.cmc || 0) - (b.scryfallMatch?.cmc || 0);
        case 'rarity': {
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, mythic: 3 };
          const rarityA = a.scryfallMatch?.rarity?.toLowerCase() as keyof typeof rarityOrder || 'common';
          const rarityB = b.scryfallMatch?.rarity?.toLowerCase() as keyof typeof rarityOrder || 'common';
          return (rarityOrder[rarityB] || 0) - (rarityOrder[rarityA] || 0);
        }
        case 'color': {
          const colorA = a.scryfallMatch?.colors?.[0] || 'Z';
          const colorB = b.scryfallMatch?.colors?.[0] || 'Z';
          return colorA.localeCompare(colorB);
        }
        default:
          return 0;
      }
    });

  // Get count of card in deck
  const getCardCountInDeck = (card: CardData): number => {
    const deckCard = deckCards.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
    return deckCard?.count || 0;
  };

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
        <div className="card-header">
          <h3 className="text-lg font-semibold">Collection ({filteredCollection.length})</h3>
        </div>

        <div className="card-body space-y-3">
          {/* Search */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search cards or text..."
            className="input w-full"
          />

          {/* Ownership Filter (Prominent) */}
          <select
            value={filterOwnership}
            onChange={(e) => setFilterOwnership(e.target.value)}
            className="select font-semibold"
          >
            <option value="all">Show All Cards</option>
            <option value="owned">✓ I Own (Available)</option>
            <option value="indeck">📋 Already in Deck</option>
            <option value="available">⭐ Not Yet Added</option>
          </select>

          {/* Filters Row 1 */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select"
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

            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="select"
            >
              <option value="all">All Colors</option>
              <option value="W">White</option>
              <option value="U">Blue</option>
              <option value="B">Black</option>
              <option value="R">Red</option>
              <option value="G">Green</option>
              <option value="colorless">Colorless</option>
            </select>
          </div>

          {/* Filters Row 2 */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="select"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="mythic">Mythic</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="select"
            >
              <option value="name">Sort: Name</option>
              <option value="cmc">Sort: CMC</option>
              <option value="rarity">Sort: Rarity</option>
              <option value="color">Sort: Color</option>
            </select>
          </div>

          {/* CMC Range */}
          <div className="space-y-1">
            <label className="text-xs text-fg-secondary">
              Mana Cost: {cmcRange[0]} - {cmcRange[1] === 20 ? '20+' : cmcRange[1]}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="0"
                max="20"
                value={cmcRange[0]}
                onChange={(e) => setCmcRange([parseInt(e.target.value), cmcRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="20"
                value={cmcRange[1]}
                onChange={(e) => setCmcRange([cmcRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>

          {/* Card List */}
          <div className="max-h-[600px] overflow-y-auto space-y-1">
            {filteredCollection.map((card, index) => {
              const inDeck = getCardCountInDeck(card);
              const available = card.anzahl - inDeck;
              const imageUrl = card.scryfallMatch?.image_uris?.small;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm hover:bg-bg-muted/40 px-2 py-2 rounded transition-fast cursor-pointer"
                  onDoubleClick={() => available > 0 && onAddCard(card, 1)}
                  onClick={() => card.scryfallMatch && setPreviewCard(card)}
                  title="Double-click to add, Click to preview"
                >
                  {/* Card Thumbnail */}
                  {imageUrl && (
                    <div
                      className="w-10 h-14 bg-bg-muted rounded flex-shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                  )}

                  {/* Card Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-fg-primary font-medium truncate flex items-center gap-2">
                      <span>{card.scryfallMatch?.name || card.kartenname}</span>
                      {getColorBadge(card.scryfallMatch?.colors)}
                      {/* Ownership Badge */}
                      {card.anzahl > 0 && (
                        <span className="badge ok text-[10px] px-1.5" title={`You own ${card.anzahl} copies`}>
                          x{card.anzahl}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-fg-muted flex items-center gap-2">
                      <span>{card.scryfallMatch?.type_line?.split('—')[0].trim()}</span>
                      {card.scryfallMatch?.cmc !== undefined && (
                        <span className="badge info text-xs">
                          {card.scryfallMatch.cmc}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex flex-col items-end flex-shrink-0 text-xs">
                    {inDeck > 0 && (
                      <span className="text-accent font-semibold">{inDeck} in deck</span>
                    )}
                    <span className={available > 0 ? 'text-ok' : 'text-fg-muted'}>
                      {available}/{card.anzahl} avail
                    </span>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddCard(card, 1);
                    }}
                    className="button ok text-xs px-2 flex-shrink-0"
                    disabled={available <= 0}
                    title={available > 0 ? 'Add one to deck' : 'No more available'}
                  >
                    +
                  </button>
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

      {/* Card Preview Modal */}
      {previewCard && (
        <CardPreview
          card={previewCard}
          onClose={() => setPreviewCard(null)}
        />
      )}
    </>
  );
};
