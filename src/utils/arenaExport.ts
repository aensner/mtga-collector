import type { CardData } from '../types';

/**
 * Export cards to MTG Arena deck format
 *
 * Format: "<quantity> <Card Name> (<SET>) <collector_number>"
 * Example: "4 Lightning Bolt (M11) 149"
 *
 * Requirements:
 * - Quantity before card name
 * - Set code in parentheses (3-letter code)
 * - Collector number after set code
 * - No leading zeros in collector numbers
 * - Newline separated
 */
export const exportToArena = (cards: CardData[]): string => {
  const validCards = cards.filter(card =>
    card.scryfallMatch &&
    card.scryfallMatch.set &&
    card.scryfallMatch.collector_number
  );

  if (validCards.length === 0) {
    throw new Error('No valid cards with Scryfall data to export');
  }

  return validCards
    .map(card => {
      const { anzahl, scryfallMatch } = card;
      const { name, set, collector_number } = scryfallMatch!;

      // Format set code to uppercase
      const setCode = set.toUpperCase();

      // Remove leading zeros from collector number (Arena requirement)
      const collectorNum = collector_number.replace(/^0+/, '');

      // Format: "4 Lightning Bolt (M11) 149"
      return `${anzahl} ${name} (${setCode}) ${collectorNum}`;
    })
    .join('\n');
};

/**
 * Download exported deck as .txt file
 */
export const downloadArenaDeck = (cards: CardData[], filename?: string): void => {
  try {
    const deckText = exportToArena(cards);

    // Create blob and download
    const blob = new Blob([deckText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = filename || `mtga_collection_${timestamp}.txt`;
    link.href = url;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log(`✅ Exported ${cards.length} cards to MTG Arena format`);
  } catch (error) {
    console.error('Failed to export to Arena format:', error);
    throw error;
  }
};

/**
 * Validate card for Arena export
 */
export const canExportToArena = (card: CardData): boolean => {
  return !!(
    card.scryfallMatch &&
    card.scryfallMatch.name &&
    card.scryfallMatch.set &&
    card.scryfallMatch.collector_number
  );
};

/**
 * Get export statistics
 */
export interface ArenaExportStats {
  totalCards: number;
  validCards: number;
  invalidCards: number;
  missingData: string[];
}

export const getArenaExportStats = (cards: CardData[]): ArenaExportStats => {
  const validCards = cards.filter(canExportToArena);
  const invalidCards = cards.filter(card => !canExportToArena(card));

  const missingData = invalidCards.map(card => {
    const issues: string[] = [];
    if (!card.scryfallMatch) issues.push('no Scryfall data');
    else {
      if (!card.scryfallMatch.set) issues.push('missing set code');
      if (!card.scryfallMatch.collector_number) issues.push('missing collector number');
    }
    return `${card.kartenname} (${issues.join(', ')})`;
  });

  return {
    totalCards: cards.length,
    validCards: validCards.length,
    invalidCards: invalidCards.length,
    missingData
  };
};
