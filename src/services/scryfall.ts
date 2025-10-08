import type { ScryfallCard } from '../types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

// Scryfall requests rate limiting: max 10 requests per second
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchCardByName = async (name: string): Promise<ScryfallCard | null> => {
  try {
    await delay(100); // Rate limiting

    const response = await fetch(
      `${SCRYFALL_API_BASE}/cards/named?fuzzy=${encodeURIComponent(name)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Card not found
      }
      throw new Error(`Scryfall API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      set: data.set_name,
      rarity: data.rarity,
      image_uris: data.image_uris,
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
