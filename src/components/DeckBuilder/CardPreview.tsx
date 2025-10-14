import React, { useEffect } from 'react';
import type { CardData } from '../../types';

interface CardPreviewProps {
  card: CardData;
  onClose: () => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ card, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const scryfallData = card.scryfallMatch;
  if (!scryfallData) return null;

  // Get the best available image
  const imageUrl = scryfallData.image_uris?.large ||
                   scryfallData.image_uris?.normal ||
                   scryfallData.image_uris?.small;

  // Parse mana cost for colored symbols
  const renderManaCost = (manaCost?: string) => {
    if (!manaCost) return null;

    // Match mana symbols like {2}, {U}, {B}, {R}, {G}, {W}, {C}, {X}
    const symbols = manaCost.match(/\{[^}]+\}/g) || [];

    return (
      <div className="flex items-center gap-1">
        {symbols.map((symbol, i) => {
          const inner = symbol.slice(1, -1); // Remove { }
          const colorMap: Record<string, string> = {
            'W': '#F0E68C',
            'U': '#0E68AB',
            'B': '#150B00',
            'R': '#D3202A',
            'G': '#00733E',
            'C': '#BEB9B2'
          };

          const isNumber = /^\d+$/.test(inner);
          const color = colorMap[inner] || '#888';

          return (
            <span
              key={i}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2"
              style={{
                backgroundColor: isNumber ? '#BEB9B2' : color,
                borderColor: '#2A2A2A',
                color: inner === 'W' || inner === 'C' ? '#000' : '#FFF'
              }}
            >
              {inner}
            </span>
          );
        })}
      </div>
    );
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-fg-muted';
      case 'uncommon': return 'text-[#C0C0C0]';
      case 'rare': return 'text-[#FFD700]';
      case 'mythic': return 'text-[#FF8C00]';
      default: return 'text-fg-secondary';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 bg-bg-base rounded-lg shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-bg-panel/90 hover:bg-bg-muted rounded-full transition-fast text-fg-primary text-xl font-bold"
          title="Close (Esc)"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left: Card Image */}
          <div className="flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={scryfallData.name}
                className="rounded-lg shadow-lg max-w-full h-auto"
                style={{ maxHeight: '600px' }}
              />
            ) : (
              <div className="w-full aspect-[5/7] bg-bg-muted rounded-lg flex items-center justify-center">
                <span className="text-fg-muted">No image available</span>
              </div>
            )}
          </div>

          {/* Right: Card Details */}
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-fg-primary mb-2">
                {scryfallData.name}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                {renderManaCost(scryfallData.mana_cost)}
                <span className={`capitalize font-semibold ${getRarityColor(scryfallData.rarity)}`}>
                  {scryfallData.rarity}
                </span>
              </div>
            </div>

            {/* Type Line */}
            <div>
              <h3 className="text-sm font-semibold text-fg-secondary mb-1">Type</h3>
              <p className="text-fg-primary">{scryfallData.type_line}</p>
            </div>

            {/* Oracle Text */}
            {scryfallData.oracle_text && (
              <div>
                <h3 className="text-sm font-semibold text-fg-secondary mb-1">Oracle Text</h3>
                <p className="text-fg-primary whitespace-pre-wrap leading-relaxed">
                  {scryfallData.oracle_text}
                </p>
              </div>
            )}

            {/* Stats (P/T or Loyalty) */}
            {(scryfallData.power || scryfallData.toughness) && (
              <div>
                <h3 className="text-sm font-semibold text-fg-secondary mb-1">Power / Toughness</h3>
                <p className="text-fg-primary text-2xl font-bold">
                  {scryfallData.power} / {scryfallData.toughness}
                </p>
              </div>
            )}

            {scryfallData.loyalty && (
              <div>
                <h3 className="text-sm font-semibold text-fg-secondary mb-1">Starting Loyalty</h3>
                <p className="text-fg-primary text-2xl font-bold">
                  {scryfallData.loyalty}
                </p>
              </div>
            )}

            {/* Keywords */}
            {scryfallData.keywords && scryfallData.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-fg-secondary mb-1">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {scryfallData.keywords.map((keyword, i) => (
                    <span key={i} className="badge info">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Set Info */}
            <div className="mt-auto pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-fg-secondary">Set: </span>
                  <span className="text-fg-primary font-medium">{scryfallData.set_name}</span>
                </div>
                <div>
                  <span className="text-fg-secondary">#{scryfallData.collector_number}</span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-fg-secondary">CMC: </span>
                <span className="text-fg-primary font-semibold">{scryfallData.cmc || 0}</span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-fg-secondary">In Collection: </span>
                <span className="text-ok font-semibold">{card.anzahl}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
