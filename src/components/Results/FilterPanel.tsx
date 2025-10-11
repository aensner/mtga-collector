import React, { useState } from 'react';

export interface FilterCriteria {
  colors: string[];
  cardTypes: string[];
  cmcMin: number | null;
  cmcMax: number | null;
  rarities: string[];
  powerMin: number | null;
  powerMax: number | null;
  toughnesMin: number | null;
  toughnessMax: number | null;
  searchText: string;
}

interface FilterPanelProps {
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  onClearFilters: () => void;
}

const MTG_COLORS = [
  { code: 'W', name: 'White', color: '#FFF5E6' },
  { code: 'U', name: 'Blue', color: '#0E68AB' },
  { code: 'B', name: 'Black', color: '#150B00' },
  { code: 'R', name: 'Red', color: '#D3202A' },
  { code: 'G', name: 'Green', color: '#00733E' }
];

const RARITIES = ['common', 'uncommon', 'rare', 'mythic'];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleColor = (colorCode: string) => {
    const newColors = filters.colors.includes(colorCode)
      ? filters.colors.filter(c => c !== colorCode)
      : [...filters.colors, colorCode];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const toggleRarity = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    onFiltersChange({ ...filters, rarities: newRarities });
  };

  const hasActiveFilters =
    filters.colors.length > 0 ||
    filters.cardTypes.length > 0 ||
    filters.cmcMin !== null ||
    filters.cmcMax !== null ||
    filters.rarities.length > 0 ||
    filters.powerMin !== null ||
    filters.powerMax !== null ||
    filters.toughnesMin !== null ||
    filters.toughnessMax !== null ||
    filters.searchText !== '';

  return (
    <div className="card mb-4">
      <div
        className="card-header flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <span className="badge ok text-xs">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="button ghost text-sm"
            >
              Clear All
            </button>
          )}
          <span className="text-accent">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="card-body space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Search Card Name
            </label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => onFiltersChange({ ...filters, searchText: e.target.value })}
              placeholder="Type to search..."
              className="input w-full"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Colors
            </label>
            <div className="flex gap-2">
              {MTG_COLORS.map(color => (
                <button
                  key={color.code}
                  onClick={() => toggleColor(color.code)}
                  className={`px-4 py-2 rounded-md border-2 transition-all ${
                    filters.colors.includes(color.code)
                      ? 'border-accent bg-accent/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{
                    backgroundColor: filters.colors.includes(color.code)
                      ? `${color.color}33`
                      : undefined
                  }}
                  title={color.name}
                >
                  {color.code}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Rarity
            </label>
            <div className="flex flex-wrap gap-2">
              {RARITIES.map(rarity => (
                <button
                  key={rarity}
                  onClick={() => toggleRarity(rarity)}
                  className={`px-3 py-1 rounded-md border transition-all capitalize ${
                    filters.rarities.includes(rarity)
                      ? 'border-accent bg-accent/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {/* CMC Range */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Mana Value (CMC)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={filters.cmcMin ?? ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  cmcMin: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Min"
                className="input w-20"
              />
              <span className="text-fg-muted">to</span>
              <input
                type="number"
                min="0"
                max="20"
                value={filters.cmcMax ?? ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  cmcMax: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Max"
                className="input w-20"
              />
            </div>
          </div>

          {/* Power Range */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Power
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={filters.powerMin ?? ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  powerMin: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Min"
                className="input w-20"
              />
              <span className="text-fg-muted">to</span>
              <input
                type="number"
                min="0"
                max="20"
                value={filters.powerMax ?? ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  powerMax: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Max"
                className="input w-20"
              />
            </div>
          </div>

          {/* Toughness Range */}
          <div>
            <label className="block text-sm font-medium text-fg-secondary mb-2">
              Toughness
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={filters.toughnesMin ?? ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  toughnesMin: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Min"
                className="input w-20"
              />
              <span className="text-fg-muted">to</span>
              <input
                type="number"
                min="0"
                max="20"
                value={filters.toughnessMax ?? ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  toughnessMax: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Max"
                className="input w-20"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
