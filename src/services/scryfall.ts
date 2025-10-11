import type { ScryfallCard } from '../types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Scryfall requests rate limiting: max 10 requests per second
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchCardByName = async (name: string): Promise<ScryfallCard | null> => {
  try {
    // Validate card name before searching
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      console.log(`Skipping Scryfall search for invalid name: "${name}" (too short)`);
      return null;
    }

    await delay(100); // Rate limiting

    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/named?fuzzy=${encodeURIComponent(trimmedName)}`
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
    console.error(`Error searching for card "${name}":`, error);
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
    await delay(100);

    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/autocomplete?q=${encodeURIComponent(partial)}`
    );

    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error autocompleting card name "${partial}":`, error);
    return [];
  }
};
