import type { ScryfallCard } from '../types';
import { SCRYFALL, OCR } from '../constants/processing';
import { scryfallLogger } from './logger';

// Scryfall requests rate limiting: max 10 requests per second
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchCardByName = async (name: string): Promise<ScryfallCard | null> => {
  try {
    // Validate card name before searching
    const trimmedName = name.trim();
    if (trimmedName.length < OCR.MIN_CARD_NAME_LENGTH) {
      scryfallLogger.debug(`Skipping search for invalid name: "${name}" (too short)`);
      return null;
    }

    await delay(SCRYFALL.RATE_LIMIT_DELAY); // Rate limiting

    const response = await fetch(
      `${SCRYFALL.BASE_URL}/cards/named?fuzzy=${encodeURIComponent(trimmedName)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Card not found
      }
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle double-faced cards (use front face data)
    const cardFace = data.card_faces?.[0] || data;

    return {
      id: data.id,
      name: data.name,
      set: data.set, // 3-letter set code (e.g., "grn")
      set_name: data.set_name, // Full set name
      rarity: data.rarity,
      collector_number: data.collector_number, // Required for Arena export

      // Gameplay data
      colors: cardFace.colors,
      color_identity: data.color_identity,
      mana_cost: cardFace.mana_cost,
      cmc: data.cmc,
      type_line: cardFace.type_line || data.type_line,
      oracle_text: cardFace.oracle_text || data.oracle_text,
      power: cardFace.power,
      toughness: cardFace.toughness,
      loyalty: cardFace.loyalty || data.loyalty,
      keywords: data.keywords || [],

      // Image URLs (prefer card_faces for double-faced cards)
      image_uris: cardFace.image_uris || data.image_uris,
    };
  } catch (error) {
    scryfallLogger.error(`Error searching for card "${name}"`, error);
    return null;
  }
};

export const searchCardsBatch = async (names: string[]): Promise<(ScryfallCard | null)[]> => {
  const results: (ScryfallCard | null)[] = [];

  for (const name of names) {
    const card = await searchCardByName(name);
    results.push(card);
  }

  return results;
};

export const autocompleteCardName = async (partial: string): Promise<string[]> => {
  try {
    await delay(SCRYFALL.RATE_LIMIT_DELAY);

    const response = await fetch(
      `${SCRYFALL.BASE_URL}/cards/autocomplete?q=${encodeURIComponent(partial)}`
    );

    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    scryfallLogger.error(`Error autocompleting card name "${partial}"`, error);
    return [];
  }
};
