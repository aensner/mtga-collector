import React, { useState } from 'react';
import type { CardData } from '../../types';
import { DeckList } from './DeckList';
import { CollectionView } from './CollectionView';
import { AIAssistant } from './AIAssistant';

interface DeckCard {
  card: CardData;
  count: number;
}

export const DeckBuilder: React.FC<{ collection: CardData[] }> = ({ collection }) => {
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [deckName, setDeckName] = useState('My Deck');
  const [format, setFormat] = useState<'standard' | 'historic' | 'explorer' | 'casual'>('standard');

  const addCardToDeck = (card: CardData, count: number = 1) => {
    setDeckCards(prev => {
      const existing = prev.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
      if (existing) {
        // Check 4-of limit (except basic lands)
        const isBasicLand = card.scryfallMatch?.type_line?.includes('Basic Land');
        const maxCopies = isBasicLand ? 999 : 4;
        const newCount = Math.min(existing.count + count, maxCopies, card.anzahl);

        return prev.map(dc =>
          dc.card.scryfallMatch?.id === card.scryfallMatch?.id
            ? { ...dc, count: newCount }
            : dc
        );
      } else {
        return [...prev, { card, count: Math.min(count, card.anzahl) }];
      }
    });
  };

  const removeCardFromDeck = (card: CardData, count: number = 1) => {
    setDeckCards(prev => {
      const existing = prev.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
      if (!existing) return prev;

      const newCount = existing.count - count;
      if (newCount <= 0) {
        return prev.filter(dc => dc.card.scryfallMatch?.id !== card.scryfallMatch?.id);
      }

      return prev.map(dc =>
        dc.card.scryfallMatch?.id === card.scryfallMatch?.id
          ? { ...dc, count: newCount }
          : dc
      );
    });
  };

  const setCardCount = (card: CardData, count: number) => {
    if (count <= 0) {
      setDeckCards(prev => prev.filter(dc => dc.card.scryfallMatch?.id !== card.scryfallMatch?.id));
    } else {
      const isBasicLand = card.scryfallMatch?.type_line?.includes('Basic Land');
      const maxCopies = isBasicLand ? 999 : 4;
      const clampedCount = Math.min(count, maxCopies, card.anzahl);

      setDeckCards(prev => {
        const existing = prev.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id);
        if (existing) {
          return prev.map(dc =>
            dc.card.scryfallMatch?.id === card.scryfallMatch?.id
              ? { ...dc, count: clampedCount }
              : dc
          );
        } else {
          return [...prev, { card, count: clampedCount }];
        }
      });
    }
  };

  const clearDeck = () => {
    if (window.confirm('Clear the entire deck?')) {
      setDeckCards([]);
    }
  };

  const totalCards = deckCards.reduce((sum, dc) => sum + dc.count, 0);
  const isValidDeck = totalCards >= 60;

  // Calculate mana curve
  const manaCurve = Array.from({ length: 8 }, (_, i) => ({
    cmc: i,
    count: deckCards
      .filter(dc => {
        const cmc = dc.card.scryfallMatch?.cmc || 0;
        return i === 7 ? cmc >= 7 : cmc === i;
      })
      .reduce((sum, dc) => sum + dc.count, 0)
  }));

  return (
    <div className="mt-8">
      <div className="card mb-4">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="input text-xl font-bold"
                placeholder="Deck Name"
              />
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="select"
              >
                <option value="standard">Standard</option>
                <option value="historic">Historic</option>
                <option value="explorer">Explorer</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${isValidDeck ? 'text-ok' : 'text-warn'}`}>
                {totalCards} / 60 cards
              </span>
              {isValidDeck && <span className="badge ok">Valid</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deck List - Left Side */}
        <div className="lg:col-span-1">
          <DeckList
            deckCards={deckCards}
            deckName={deckName}
            format={format}
            manaCurve={manaCurve}
            totalCards={totalCards}
            onRemoveCard={removeCardFromDeck}
            onSetCardCount={setCardCount}
            onClearDeck={clearDeck}
          />
        </div>

        {/* Collection View - Middle */}
        <div className="lg:col-span-1">
          <CollectionView
            collection={collection}
            deckCards={deckCards}
            onAddCard={addCardToDeck}
          />
        </div>

        {/* AI Assistant - Right Side */}
        <div className="lg:col-span-1">
          <AIAssistant
            deckCards={deckCards}
            collection={collection}
            format={format}
            onAddSuggestion={addCardToDeck}
          />
        </div>
      </div>
    </div>
  );
};
