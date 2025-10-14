import { supabase } from './supabase';
import type { Deck, DeckSummary, CardData, DeckFormat, DeckArchetype } from '../types';

/**
 * Load all user's decks from Supabase
 */
export const loadAllDecks = async (): Promise<Deck[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot load decks');
      return [];
    }

    const { data: deckData, error } = await supabase
      .from('decks')
      .select(`
        *,
        deck_cards (*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading decks:', error);
      throw error;
    }

    // Convert database format to Deck format
    return (deckData || []).map(dbDeckToDeck);
  } catch (error) {
    console.error('Failed to load decks:', error);
    return [];
  }
};

/**
 * Load deck summaries (lightweight, for dashboard)
 */
export const loadDeckSummaries = async (collection: CardData[]): Promise<DeckSummary[]> => {
  try {
    const decks = await loadAllDecks();

    return decks.map(deck => {
      // Calculate ownership percentage
      const ownedCards = deck.cards.filter(deckCard => {
        const collectionCard = collection.find(c =>
          c.scryfallMatch?.id === deckCard.scryfallId
        );
        return collectionCard && collectionCard.anzahl >= deckCard.quantity;
      });

      const ownedPercentage = deck.cards.length > 0
        ? Math.round((ownedCards.length / deck.cards.length) * 100)
        : 0;

      // Extract color identity
      const colorSet = new Set<string>();
      deck.cards.forEach(card => {
        card.colors?.forEach(color => colorSet.add(color));
      });
      const colors = Array.from(colorSet);

      // Find most common card type
      const typeCount: Record<string, number> = {};
      deck.cards.forEach(card => {
        const mainType = card.typeLine?.split('—')[0].trim();
        if (mainType) {
          typeCount[mainType] = (typeCount[mainType] || 0) + card.quantity;
        }
      });
      const primaryType = Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      return {
        id: deck.id,
        name: deck.name,
        format: deck.format,
        archetype: deck.archetype,
        totalCards: deck.totalCards,
        isValid: deck.isValid,
        ownedPercentage,
        updatedAt: deck.updatedAt,
        colors,
        primaryType
      };
    });
  } catch (error) {
    console.error('Failed to load deck summaries:', error);
    return [];
  }
};

/**
 * Load single deck by ID
 */
export const loadDeck = async (deckId: string): Promise<Deck | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot load deck');
      return null;
    }

    const { data: deckData, error } = await supabase
      .from('decks')
      .select(`
        *,
        deck_cards (*)
      `)
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading deck:', error);
      throw error;
    }

    return dbDeckToDeck(deckData);
  } catch (error) {
    console.error('Failed to load deck:', error);
    return null;
  }
};

/**
 * Create a new deck
 */
export const createDeck = async (
  name: string,
  format: DeckFormat,
  archetype?: DeckArchetype,
  description?: string
): Promise<Deck> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('decks')
      .insert({
        user_id: user.id,
        name,
        format,
        archetype,
        description,
        total_cards: 0,
        is_valid: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deck:', error);
      throw error;
    }

    console.log(`✅ Created deck "${name}"`);

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      format: data.format,
      archetype: data.archetype,
      description: data.description,
      totalCards: 0,
      isValid: false,
      cards: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Failed to create deck:', error);
    throw error;
  }
};

/**
 * Update deck metadata (name, format, archetype, description)
 */
export const updateDeckMetadata = async (
  deckId: string,
  updates: {
    name?: string;
    format?: DeckFormat;
    archetype?: DeckArchetype;
    description?: string;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('decks')
      .update(updates)
      .eq('id', deckId);

    if (error) {
      console.error('Error updating deck:', error);
      throw error;
    }

    console.log(`✅ Updated deck metadata`);
  } catch (error) {
    console.error('Failed to update deck:', error);
    throw error;
  }
};

/**
 * Delete a deck
 */
export const deleteDeck = async (deckId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }

    console.log(`✅ Deleted deck`);
  } catch (error) {
    console.error('Failed to delete deck:', error);
    throw error;
  }
};

/**
 * Add card to deck (or update quantity)
 */
export const addCardToDeck = async (
  deckId: string,
  scryfallId: string,
  cardName: string,
  quantity: number,
  cardData?: {
    manaCost?: string;
    cmc?: number;
    typeLine?: string;
    colors?: string[];
    rarity?: string;
    setCode?: string;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('deck_cards')
      .upsert({
        deck_id: deckId,
        scryfall_id: scryfallId,
        card_name: cardName,
        quantity,
        mana_cost: cardData?.manaCost,
        cmc: cardData?.cmc,
        type_line: cardData?.typeLine,
        colors: cardData?.colors,
        rarity: cardData?.rarity,
        set_code: cardData?.setCode
      }, {
        onConflict: 'deck_id,scryfall_id'
      });

    if (error) {
      console.error('Error adding card to deck:', error);
      throw error;
    }

    // Trigger updates deck total_cards and is_valid automatically
  } catch (error) {
    console.error('Failed to add card to deck:', error);
    throw error;
  }
};

/**
 * Remove card from deck
 */
export const removeCardFromDeck = async (
  deckId: string,
  scryfallId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('deck_cards')
      .delete()
      .eq('deck_id', deckId)
      .eq('scryfall_id', scryfallId);

    if (error) {
      console.error('Error removing card from deck:', error);
      throw error;
    }

    // Trigger updates deck total_cards and is_valid automatically
  } catch (error) {
    console.error('Failed to remove card from deck:', error);
    throw error;
  }
};

/**
 * Update card quantity in deck
 */
export const updateCardQuantity = async (
  deckId: string,
  scryfallId: string,
  quantity: number
): Promise<void> => {
  if (quantity <= 0) {
    return removeCardFromDeck(deckId, scryfallId);
  }

  try {
    const { error } = await supabase
      .from('deck_cards')
      .update({ quantity })
      .eq('deck_id', deckId)
      .eq('scryfall_id', scryfallId);

    if (error) {
      console.error('Error updating card quantity:', error);
      throw error;
    }

    // Trigger updates deck total_cards and is_valid automatically
  } catch (error) {
    console.error('Failed to update card quantity:', error);
    throw error;
  }
};

/**
 * Save entire deck state (bulk upsert)
 */
export const saveDeckCards = async (
  deckId: string,
  cards: Array<{
    scryfallId: string;
    cardName: string;
    quantity: number;
    manaCost?: string;
    cmc?: number;
    typeLine?: string;
    colors?: string[];
    rarity?: string;
    setCode?: string;
  }>
): Promise<void> => {
  try {
    // First, get existing cards to know which to delete
    const { data: existingCards } = await supabase
      .from('deck_cards')
      .select('scryfall_id')
      .eq('deck_id', deckId);

    const existingIds = new Set((existingCards || []).map(c => c.scryfall_id));
    const newIds = new Set(cards.map(c => c.scryfallId));

    // Delete cards no longer in deck
    const toDelete = Array.from(existingIds).filter(id => !newIds.has(id));
    if (toDelete.length > 0) {
      await supabase
        .from('deck_cards')
        .delete()
        .eq('deck_id', deckId)
        .in('scryfall_id', toDelete);
    }

    // Upsert all current cards
    if (cards.length > 0) {
      const { error } = await supabase
        .from('deck_cards')
        .upsert(
          cards.map(card => ({
            deck_id: deckId,
            scryfall_id: card.scryfallId,
            card_name: card.cardName,
            quantity: card.quantity,
            mana_cost: card.manaCost,
            cmc: card.cmc,
            type_line: card.typeLine,
            colors: card.colors,
            rarity: card.rarity,
            set_code: card.setCode
          })),
          { onConflict: 'deck_id,scryfall_id' }
        );

      if (error) {
        console.error('Error saving deck cards:', error);
        throw error;
      }
    }

    console.log(`✅ Saved ${cards.length} cards to deck`);
  } catch (error) {
    console.error('Failed to save deck cards:', error);
    throw error;
  }
};

/**
 * Helper: Convert database deck to Deck type
 */
const dbDeckToDeck = (dbDeck: any): Deck => {
  return {
    id: dbDeck.id,
    userId: dbDeck.user_id,
    name: dbDeck.name,
    format: dbDeck.format,
    archetype: dbDeck.archetype,
    description: dbDeck.description,
    totalCards: dbDeck.total_cards,
    isValid: dbDeck.is_valid,
    cards: (dbDeck.deck_cards || []).map((dbCard: any) => ({
      id: dbCard.id,
      deckId: dbCard.deck_id,
      scryfallId: dbCard.scryfall_id,
      cardName: dbCard.card_name,
      quantity: dbCard.quantity,
      manaCost: dbCard.mana_cost,
      cmc: dbCard.cmc,
      typeLine: dbCard.type_line,
      colors: dbCard.colors,
      rarity: dbCard.rarity,
      setCode: dbCard.set_code,
      createdAt: dbCard.created_at,
      updatedAt: dbCard.updated_at
    })),
    createdAt: dbDeck.created_at,
    updatedAt: dbDeck.updated_at
  };
};
