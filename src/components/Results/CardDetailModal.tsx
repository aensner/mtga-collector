import React from 'react';
import { createPortal } from 'react-dom';
import type { CardData } from '../../types';

interface CardDetailModalProps {
  card: CardData;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  const scryfall = card.scryfallMatch;

  if (!scryfall) {
    return null;
  }

  // Helper to render mana symbols
  const renderManaCost = (manaCost?: string) => {
    if (!manaCost) return null;

    // Split mana cost into symbols: "{2}{U}{U}" -> ["2", "U", "U"]
    const symbols = manaCost.match(/{([^}]+)}/g)?.map(s => s.slice(1, -1)) || [];

    return (
      <div className="flex items-center gap-1">
        {symbols.map((symbol, idx) => (
          <span
            key={idx}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-700 text-xs font-bold text-white border border-gray-600"
            title={symbol}
          >
            {symbol}
          </span>
        ))}
      </div>
    );
  };

  // Helper to render color pips
  const renderColors = (colors?: string[]) => {
    if (!colors || colors.length === 0) return <span className="text-gray-500">Colorless</span>;

    const colorMap: Record<string, { bg: string; label: string }> = {
      W: { bg: 'bg-yellow-100', label: 'White' },
      U: { bg: 'bg-blue-400', label: 'Blue' },
      B: { bg: 'bg-gray-900', label: 'Black' },
      R: { bg: 'bg-red-500', label: 'Red' },
      G: { bg: 'bg-green-500', label: 'Green' }
    };

    return (
      <div className="flex gap-1">
        {colors.map(color => (
          <span
            key={color}
            className={`w-6 h-6 rounded-full ${colorMap[color]?.bg || 'bg-gray-500'} border-2 border-gray-600`}
            title={colorMap[color]?.label || color}
          />
        ))}
      </div>
    );
  };

  // Helper to render power/toughness or loyalty
  const renderStats = () => {
    if (scryfall.loyalty) {
      return (
        <div className="badge ok">
          Loyalty: {scryfall.loyalty}
        </div>
      );
    }

    if (scryfall.power && scryfall.toughness) {
      return (
        <div className="badge info">
          {scryfall.power}/{scryfall.toughness}
        </div>
      );
    }

    return null;
  };

  const modalContent = (
    <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={onClose}
      >
      <div
        style={{
          backgroundColor: '#131821',
          border: '1px solid rgba(19, 185, 213, 0.3)',
          borderRadius: '12px',
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          color: '#E6EEF7'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="card-header flex items-center justify-between">
          <h2 className="text-xl font-bold">{scryfall.name}</h2>
          <button
            onClick={onClose}
            className="button ghost text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="card-body space-y-4">
          {/* Card Image */}
          {scryfall.image_uris?.large && (
            <div className="flex justify-center">
              <img
                src={scryfall.image_uris.large}
                alt={scryfall.name}
                className="rounded-lg max-w-full h-auto shadow-lg border border-gray-700"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Mana Cost</h3>
              {scryfall.mana_cost ? (
                renderManaCost(scryfall.mana_cost)
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">CMC</h3>
              <span className="text-white">{scryfall.cmc || 0}</span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Colors</h3>
              {renderColors(scryfall.colors)}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Rarity</h3>
              <span className="badge info capitalize">{scryfall.rarity}</span>
            </div>
          </div>

          {/* Type Line */}
          {scryfall.type_line && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Type</h3>
              <p className="text-white">{scryfall.type_line}</p>
            </div>
          )}

          {/* Oracle Text */}
          {scryfall.oracle_text && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Oracle Text</h3>
              <p className="text-white whitespace-pre-line bg-gray-800/50 p-3 rounded border border-gray-700">
                {scryfall.oracle_text}
              </p>
            </div>
          )}

          {/* Stats (P/T or Loyalty) */}
          {renderStats()}

          {/* Keywords */}
          {scryfall.keywords && scryfall.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {scryfall.keywords.map(keyword => (
                  <span key={keyword} className="badge ok">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Set Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Set</h3>
              <p className="text-white">
                {scryfall.set_name || scryfall.set.toUpperCase()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Collector #</h3>
              <p className="text-white">{scryfall.collector_number}</p>
            </div>
          </div>

          {/* Collection Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">Quantity Owned</h3>
              <p className="text-white font-bold text-lg">{card.anzahl}</p>
            </div>

            {card.pageNumber && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Page</h3>
                <p className="text-white">{card.pageNumber}</p>
              </div>
            )}
          </div>

          {/* Scryfall Link */}
          <div className="card-actions pt-4 border-t border-gray-700">
            <a
              href={`https://scryfall.com/card/${scryfall.set}/${scryfall.collector_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button ok w-full"
            >
              View on Scryfall →
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
