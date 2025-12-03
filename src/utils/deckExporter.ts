import { downloadFile } from './csvParser';
import { loadDeck } from '../services/deckDatabase';

/**
 * Export deck to MTG Arena format
 * Format: Quantity CardName (SetCode) CollectorNumber
 * Example: 4 Lightning Bolt (M11) 146
 */
export const exportDeckToArena = async (deckId: string): Promise<void> => {
  const deck = await loadDeck(deckId);

  if (!deck) {
    throw new Error('Deck not found');
  }

  const lines: string[] = [];

  // Add deck name as comment
  lines.push(`// ${deck.name}`);
  if (deck.description) {
    lines.push(`// ${deck.description}`);
  }
  lines.push('');

  // Group cards by type
  const creatures: string[] = [];
  const spells: string[] = [];
  const lands: string[] = [];
  const other: string[] = [];

  deck.cards.forEach(card => {
    const setCode = card.setCode ? card.setCode.toUpperCase() : '';
    const line = `${card.quantity} ${card.cardName}${setCode ? ` (${setCode})` : ''}`;

    const typeLine = card.typeLine?.toLowerCase() || '';
    if (typeLine.includes('creature')) {
      creatures.push(line);
    } else if (typeLine.includes('land')) {
      lands.push(line);
    } else if (typeLine.includes('instant') || typeLine.includes('sorcery') ||
               typeLine.includes('enchantment') || typeLine.includes('artifact') ||
               typeLine.includes('planeswalker')) {
      spells.push(line);
    } else {
      other.push(line);
    }
  });

  // Add sections
  if (creatures.length > 0) {
    lines.push('// Creatures');
    lines.push(...creatures);
    lines.push('');
  }

  if (spells.length > 0) {
    lines.push('// Spells');
    lines.push(...spells);
    lines.push('');
  }

  if (lands.length > 0) {
    lines.push('// Lands');
    lines.push(...lands);
    lines.push('');
  }

  if (other.length > 0) {
    lines.push('// Other');
    lines.push(...other);
  }

  const content = lines.join('\n').trim();
  const filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}_arena.txt`;

  downloadFile(content, filename, 'text/plain');
};

/**
 * Export deck to plain text format (simple quantity + name)
 * Format: Quantity CardName
 * Example: 4 Lightning Bolt
 */
export const exportDeckToPlainText = async (deckId: string): Promise<void> => {
  const deck = await loadDeck(deckId);

  if (!deck) {
    throw new Error('Deck not found');
  }

  const lines: string[] = [];

  // Add deck header
  lines.push(`${deck.name}`);
  if (deck.format) {
    lines.push(`Format: ${deck.format}`);
  }
  if (deck.archetype) {
    lines.push(`Archetype: ${deck.archetype}`);
  }
  if (deck.description) {
    lines.push(`Description: ${deck.description}`);
  }
  lines.push('');
  lines.push(`Total Cards: ${deck.totalCards}`);
  lines.push('');

  // Sort by CMC, then alphabetically
  const sortedCards = [...deck.cards].sort((a, b) => {
    if (a.cmc !== b.cmc) {
      return (a.cmc || 0) - (b.cmc || 0);
    }
    return a.cardName.localeCompare(b.cardName);
  });

  sortedCards.forEach(card => {
    lines.push(`${card.quantity} ${card.cardName}`);
  });

  const content = lines.join('\n');
  const filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}.txt`;

  downloadFile(content, filename, 'text/plain');
};

/**
 * Export deck to JSON format (complete data structure)
 */
export const exportDeckToJSON = async (deckId: string): Promise<void> => {
  const deck = await loadDeck(deckId);

  if (!deck) {
    throw new Error('Deck not found');
  }

  const content = JSON.stringify(deck, null, 2);
  const filename = `${deck.name.replace(/[^a-z0-9]/gi, '_')}.json`;

  downloadFile(content, filename, 'application/json');
};

/**
 * Export deck with format selection
 */
export const exportDeck = async (
  deckId: string,
  format: 'arena' | 'plaintext' | 'json' = 'arena'
): Promise<void> => {
  switch (format) {
    case 'arena':
      return exportDeckToArena(deckId);
    case 'plaintext':
      return exportDeckToPlainText(deckId);
    case 'json':
      return exportDeckToJSON(deckId);
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
};
