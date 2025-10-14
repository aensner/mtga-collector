import type { CardData } from '../types';

export interface SavedDeck {
  id: string;
  name: string;
  format: string;
  cards: Array<{
    scryfallId: string;
    cardName: string;
    count: number;
  }>;
  totalCards: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'mtga_saved_decks';

export const deckStorage = {
  // Get all saved decks
  getAllDecks(): SavedDeck[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load decks:', error);
      return [];
    }
  },

  // Save a new deck or update existing
  saveDeck(
    name: string,
    format: string,
    deckCards: Array<{ card: CardData; count: number }>,
    existingId?: string
  ): SavedDeck {
    const decks = this.getAllDecks();
    const now = new Date().toISOString();

    const savedDeck: SavedDeck = {
      id: existingId || `deck_${Date.now()}`,
      name,
      format,
      cards: deckCards.map(dc => ({
        scryfallId: dc.card.scryfallMatch?.id || '',
        cardName: dc.card.scryfallMatch?.name || dc.card.kartenname,
        count: dc.count
      })),
      totalCards: deckCards.reduce((sum, dc) => sum + dc.count, 0),
      createdAt: existingId
        ? decks.find(d => d.id === existingId)?.createdAt || now
        : now,
      updatedAt: now
    };

    if (existingId) {
      // Update existing deck
      const index = decks.findIndex(d => d.id === existingId);
      if (index >= 0) {
        decks[index] = savedDeck;
      } else {
        decks.push(savedDeck);
      }
    } else {
      // Add new deck
      decks.push(savedDeck);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    return savedDeck;
  },

  // Delete a deck
  deleteDeck(id: string): void {
    const decks = this.getAllDecks();
    const filtered = decks.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // Get a single deck by ID
  getDeck(id: string): SavedDeck | null {
    const decks = this.getAllDecks();
    return decks.find(d => d.id === id) || null;
  },

  // Restore a deck (returns cards that need to be loaded)
  restoreDeck(id: string, collection: CardData[]): Array<{ card: CardData; count: number }> | null {
    const savedDeck = this.getDeck(id);
    if (!savedDeck) return null;

    // Match saved cards with collection
    const restoredCards: Array<{ card: CardData; count: number }> = [];

    for (const savedCard of savedDeck.cards) {
      // Try to find by Scryfall ID first, then by name
      const matchedCard = collection.find(
        c => c.scryfallMatch?.id === savedCard.scryfallId ||
             (c.scryfallMatch?.name || c.kartenname).toLowerCase() === savedCard.cardName.toLowerCase()
      );

      if (matchedCard) {
        restoredCards.push({
          card: matchedCard,
          count: Math.min(savedCard.count, matchedCard.anzahl) // Don't exceed available copies
        });
      } else {
        console.warn(`Card not found in collection: ${savedCard.cardName}`);
      }
    }

    return restoredCards;
  }
};
