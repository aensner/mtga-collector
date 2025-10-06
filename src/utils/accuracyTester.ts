import { CardData, AccuracyMetrics } from '../types';

/**
 * Compares extracted card data with ground truth CSV
 */
export const calculateAccuracy = (
  extracted: CardData[],
  groundTruth: CardData[]
): AccuracyMetrics => {
  const errors: AccuracyMetrics['errors'] = [];
  let exactNameMatches = 0;
  let fuzzyNameMatches = 0;
  let quantityMatches = 0;

  // Create a map of ground truth by position
  const truthMap = new Map<string, CardData>();
  groundTruth.forEach((card) => {
    const key = `${card.positionX},${card.positionY}`;
    truthMap.set(key, card);
  });

  extracted.forEach((card) => {
    const key = `${card.positionX},${card.positionY}`;
    const truth = truthMap.get(key);

    if (!truth) {
      errors.push({
        expected: 'N/A',
        actual: card.correctedName || card.kartenname,
        position: { x: card.positionX, y: card.positionY },
      });
      return;
    }

    const extractedName = (card.correctedName || card.kartenname).toLowerCase().trim();
    const truthName = truth.kartenname.toLowerCase().trim();

    // Exact match
    if (extractedName === truthName) {
      exactNameMatches++;
    }
    // Fuzzy match (Levenshtein distance or substring)
    else if (
      extractedName.includes(truthName) ||
      truthName.includes(extractedName) ||
      levenshteinDistance(extractedName, truthName) <= 3
    ) {
      fuzzyNameMatches++;
    }
    // No match
    else {
      errors.push({
        expected: truth.kartenname,
        actual: extractedName,
        position: { x: card.positionX, y: card.positionY },
      });
    }

    // Quantity match
    if (card.anzahl === truth.anzahl) {
      quantityMatches++;
    } else {
      errors.push({
        expected: `Quantity: ${truth.anzahl}`,
        actual: `Quantity: ${card.anzahl}`,
        position: { x: card.positionX, y: card.positionY },
      });
    }
  });

  const totalCards = groundTruth.length;
  const nameAccuracy = ((exactNameMatches + fuzzyNameMatches) / totalCards) * 100;
  const quantityAccuracy = (quantityMatches / totalCards) * 100;
  const overallAccuracy = ((exactNameMatches + fuzzyNameMatches + quantityMatches) / (totalCards * 2)) * 100;

  return {
    exactNameMatches,
    fuzzyNameMatches,
    quantityMatches,
    totalCards,
    nameAccuracy,
    quantityAccuracy,
    overallAccuracy,
    errors,
  };
};

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
