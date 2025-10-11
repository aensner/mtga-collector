import React, { useState } from 'react';
import type { CardData } from '../../types';
import { correctCardNamesBatch } from '../../services/anthropic';
import { searchCardsBatch } from '../../services/scryfall';

interface UnmatchedCardsProps {
  unmatchedCards: CardData[];
  onCardsMatched: (correctedCards: CardData[]) => void;
}

interface CorrectionResult {
  original: string;
  corrected: string;
  scryfallMatch: boolean;
  card: CardData;
}

export const UnmatchedCards: React.FC<UnmatchedCardsProps> = ({ unmatchedCards, onCardsMatched }) => {
  const [correcting, setCorrecting] = useState(false);
  const [corrections, setCorrections] = useState<CorrectionResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (unmatchedCards.length === 0 && !showResults) {
    return null;
  }

  const handleCorrectAll = async () => {
    setCorrecting(true);
    try {
      // Extract card names
      const cardNames = unmatchedCards.map(c => c.kartenname);

      console.log('Sending to AI for correction:', cardNames);

      // Send to AI for correction
      const aiCorrections = await correctCardNamesBatch(cardNames);

      // Validate corrected names with Scryfall
      const correctedNames = aiCorrections.map(c => c.correctedName);
      const scryfallResults = await searchCardsBatch(correctedNames);

      // Build correction results
      const results: CorrectionResult[] = unmatchedCards.map((card, i) => {
        const corrected = aiCorrections[i].correctedName;
        const scryfallMatch = scryfallResults[i];

        // Update card with correction if Scryfall found it
        if (scryfallMatch) {
          card.correctedName = scryfallMatch.name;
          card.scryfallMatch = scryfallMatch;
          card.confidence = (card.confidence || 0.5) * aiCorrections[i].confidence;
        }

        return {
          original: card.kartenname,
          corrected: corrected,
          scryfallMatch: !!scryfallMatch,
          card: card,
        };
      });

      setCorrections(results);
      setShowResults(true);

      console.log('AI correction results:', results);
    } catch (error: any) {
      console.error('Error during AI correction:', error);

      // Show user-friendly error message
      let errorMessage = 'Error during AI correction.';

      if (error?.message?.includes('credit balance is too low')) {
        errorMessage = '⚠️ API Credits Low\n\nYour Anthropic API credit balance is too low.\n\nTo continue:\n1. Visit console.anthropic.com\n2. Go to Plans & Billing\n3. Purchase credits or upgrade your plan\n\nNote: You can still use the collection scanner - AI correction is optional.';
      } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
        errorMessage = '⚠️ API Key Missing\n\nTo enable AI correction:\n1. Get an API key from console.anthropic.com\n2. Add it to your .env file: VITE_ANTHROPIC_API_KEY=your_key\n3. Restart the development server';
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setCorrecting(false);
    }
  };

  const handleAddToCollection = () => {
    // Get successfully matched cards
    const matchedCards = corrections
      .filter(c => c.scryfallMatch)
      .map(c => c.card);

    console.log(`Adding ${matchedCards.length} corrected cards to collection`);
    onCardsMatched(matchedCards);

    // Reset
    setShowResults(false);
    setCorrections([]);
  };

  if (showResults) {
    const successCount = corrections.filter(c => c.scryfallMatch).length;
    const failCount = corrections.length - successCount;

    return (
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {successCount > 0 ? '✅' : '⚠️'} AI Correction Results
          </h3>
          <div className="text-sm text-gray-400">
            {successCount} matched, {failCount} failed
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {corrections.map((result, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded ${
                result.scryfallMatch
                  ? 'bg-green-900/20 border border-green-700'
                  : 'bg-red-900/20 border border-red-700'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{index + 1}.</span>
                  <span className="text-sm text-gray-300 line-through">{result.original}</span>
                  <span className="text-sm text-gray-500">→</span>
                  <span className={`text-sm font-medium ${
                    result.scryfallMatch ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.corrected}
                  </span>
                </div>
              </div>
              {result.scryfallMatch ? (
                <span className="text-green-500 text-sm">✓ Found</span>
              ) : (
                <span className="text-red-500 text-sm">✗ Not Found</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {successCount > 0 && (
            <button
              onClick={handleAddToCollection}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Add {successCount} Card{successCount !== 1 ? 's' : ''} to Collection
            </button>
          )}
          <button
            onClick={() => {
              setShowResults(false);
              setCorrections([]);
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-yellow-900/20 rounded-lg border border-yellow-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          ⚠️ Unmatched Cards ({unmatchedCards.length})
        </h3>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        These cards weren't found in Scryfall. They may have OCR errors. You can use AI to correct them.
      </p>

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {unmatchedCards.map((card, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-gray-500">{index + 1}.</span>
            <span className="text-sm text-gray-300 font-mono flex-1">"{card.kartenname}"</span>
            <span className="text-xs text-gray-500">
              (Page {card.pageNumber || '?'}, Row {card.positionY}, Col {card.positionX})
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleCorrectAll}
        disabled={correcting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        {correcting ? (
          <>
            <span className="animate-spin">⏳</span>
            Correcting with AI...
          </>
        ) : (
          <>
            ✨ Correct All with AI
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        This will use Anthropic API credits. Only successfully matched cards will be added.
      </p>
    </div>
  );
};
