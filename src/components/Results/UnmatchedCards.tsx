import React, { useState } from 'react';
import type { CardData } from '../../types';
import { correctCardNamesBatch } from '../../services/ai';
import { searchCardsBatch, searchCardByName } from '../../services/scryfall';

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

interface ManualCorrection {
  [cardIndex: number]: {
    value: string;
    loading: boolean;
    result: CardData | null;
    error: string | null;
  };
}

export const UnmatchedCards: React.FC<UnmatchedCardsProps> = ({ unmatchedCards, onCardsMatched }) => {
  const [correcting, setCorrecting] = useState(false);
  const [corrections, setCorrections] = useState<CorrectionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [manualCorrections, setManualCorrections] = useState<ManualCorrection>({});

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

      if (error?.message?.includes('credit balance is too low') || error?.message?.includes('quota')) {
        errorMessage = '⚠️ API Credits Low\n\nYour AI API credit balance is too low.\n\nTo continue:\n• For OpenAI: Visit platform.openai.com/account/billing\n• For Anthropic: Visit console.anthropic.com → Plans & Billing\n\nNote: You can still use the collection scanner - AI correction is optional.';
      } else if (error?.message?.includes('No AI Provider')) {
        errorMessage = '⚠️ No AI Provider Configured\n\nTo enable AI correction:\n1. Get an API key from:\n   • OpenAI: platform.openai.com/api-keys\n   • Anthropic: console.anthropic.com\n2. Add to .env file:\n   VITE_OPENAI_API_KEY=your_key\n   OR\n   VITE_ANTHROPIC_API_KEY=your_key\n3. Restart the development server';
      } else if (error?.message?.includes('API key') || error?.message?.includes('API Key')) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setCorrecting(false);
    }
  };

  const handleManualCorrection = async (cardIndex: number, correctedName: string) => {
    if (!correctedName.trim()) return;

    // Update state to show loading
    setManualCorrections(prev => ({
      ...prev,
      [cardIndex]: {
        value: correctedName,
        loading: true,
        result: null,
        error: null,
      },
    }));

    try {
      // Search Scryfall for the corrected name
      const scryfallCard = await searchCardByName(correctedName);

      if (scryfallCard) {
        // Create updated card with Scryfall match
        const originalCard = unmatchedCards[cardIndex];
        const updatedCard: CardData = {
          ...originalCard,
          correctedName: scryfallCard.name,
          scryfallMatch: scryfallCard,
        };

        setManualCorrections(prev => ({
          ...prev,
          [cardIndex]: {
            value: correctedName,
            loading: false,
            result: updatedCard,
            error: null,
          },
        }));
      } else {
        setManualCorrections(prev => ({
          ...prev,
          [cardIndex]: {
            value: correctedName,
            loading: false,
            result: null,
            error: 'Card not found in Scryfall',
          },
        }));
      }
    } catch (error) {
      console.error('Error searching Scryfall:', error);
      setManualCorrections(prev => ({
        ...prev,
        [cardIndex]: {
          value: correctedName,
          loading: false,
          result: null,
          error: 'Error searching Scryfall',
        },
      }));
    }
  };

  const handleAddManualCorrections = () => {
    // Get all successfully manually corrected cards
    const manuallyMatchedCards = Object.values(manualCorrections)
      .filter(mc => mc.result !== null)
      .map(mc => mc.result!);

    if (manuallyMatchedCards.length > 0) {
      console.log(`Adding ${manuallyMatchedCards.length} manually corrected cards to collection`);
      onCardsMatched(manuallyMatchedCards);

      // Reset manual corrections
      setManualCorrections({});
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

        <div className="space-y-3 mb-4">
          {corrections.map((result, index) => {
            const manualCorrection = manualCorrections[index];
            const isManuallyFixed = manualCorrection !== undefined && manualCorrection.result !== null;

            // Debug logging
            console.log(`Card ${index}:`, {
              original: result.original,
              corrected: result.corrected,
              scryfallMatch: result.scryfallMatch,
              cardName: result.card.scryfallMatch?.name,
              isManuallyFixed
            });

            return (
              <div
                key={index}
                className={`p-3 rounded border ${
                  isManuallyFixed
                    ? 'bg-green-900/20 border-green-700'
                    : result.scryfallMatch
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-red-900/20 border-red-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-gray-400">{index + 1}.</span>
                    <span className="text-sm text-gray-300 line-through">{result.original}</span>
                    <span className="text-sm text-gray-500">→</span>
                    <span className={`text-sm font-medium ${
                      isManuallyFixed
                        ? 'text-green-400'
                        : result.scryfallMatch
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {isManuallyFixed
                        ? manualCorrection?.result?.scryfallMatch?.name
                        : result.scryfallMatch
                          ? result.card.scryfallMatch?.name
                          : result.corrected
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isManuallyFixed ? (
                      <span className="text-green-500 text-sm">✓ Manually Fixed</span>
                    ) : result.scryfallMatch ? (
                      <span className="text-green-500 text-sm">✓ Found</span>
                    ) : (
                      <span className="text-red-500 text-sm">✗ Not Found</span>
                    )}
                  </div>
                </div>

                {/* Manual Correction for Failed AI Results */}
                {!result.scryfallMatch && !isManuallyFixed && (
                  <div className="mt-2 pl-8">
                    <label className="text-xs text-gray-400 mb-1 block">Manual Correction:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter correct card name..."
                        defaultValue={manualCorrection?.value || result.corrected}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleManualCorrection(index, e.currentTarget.value);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        disabled={manualCorrection?.loading}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleManualCorrection(index, input.value);
                        }}
                        disabled={manualCorrection?.loading}
                        className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition"
                      >
                        {manualCorrection?.loading ? '...' : 'Check'}
                      </button>
                    </div>

                    {/* Status Messages */}
                    {manualCorrection?.error && (
                      <div className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <span>✗</span>
                        <span>{manualCorrection.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          {/* Add Manual Corrections from AI Results */}
          {Object.keys(manualCorrections).some(key => manualCorrections[Number(key)]?.result !== null) && (
            <button
              onClick={handleAddManualCorrections}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              ✓ Add {Object.values(manualCorrections).filter(mc => mc.result !== null).length} Manual Fix{Object.values(manualCorrections).filter(mc => mc.result !== null).length !== 1 ? 'es' : ''}
            </button>
          )}

          {successCount > 0 && (
            <button
              onClick={handleAddToCollection}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Add {successCount} AI Match{successCount !== 1 ? 'es' : ''}
            </button>
          )}
          <button
            onClick={() => {
              setShowResults(false);
              setCorrections([]);
              setManualCorrections({});
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Revert & Close
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

      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {unmatchedCards.map((card, index) => {
          const manualCorrection = manualCorrections[index];
          const isManuallyMatched = manualCorrection?.result !== null;

          return (
            <div key={index} className={`flex gap-3 p-3 rounded border ${
              isManuallyMatched
                ? 'bg-green-900/20 border-green-700'
                : 'bg-gray-900/50 border-gray-700'
            }`}>
              {/* OCR Region Image Preview */}
              {card.ocrRegionImage && (
                <div className="flex-shrink-0">
                  <img
                    src={card.ocrRegionImage}
                    alt="OCR Region"
                    className="border-2 border-yellow-600 rounded"
                    style={{
                      imageRendering: 'pixelated',
                      minWidth: '150px',
                      height: 'auto'
                    }}
                  />
                </div>
              )}

              {/* Card Details */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-semibold">{index + 1}.</span>
                  <span className="text-sm text-gray-300 font-mono flex-1">"{card.kartenname}"</span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>
                    <span className="text-gray-600">File:</span> {card.screenshotFilename || 'Unknown'}
                  </div>
                  <div>
                    <span className="text-gray-600">Position:</span> Page {card.pageNumber || '?'}, Row {card.positionY}, Col {card.positionX}
                  </div>
                  {card.ocrRegion && (
                    <div>
                      <span className="text-gray-600">Size:</span> {card.ocrRegion.width}×{card.ocrRegion.height}px
                    </div>
                  )}
                </div>

                {/* Manual Correction Input */}
                <div className="mt-2">
                  <label className="text-xs text-gray-400 mb-1 block">Manual Correction:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter correct card name..."
                      defaultValue={manualCorrection?.value || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualCorrection(index, e.currentTarget.value);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      disabled={manualCorrection?.loading}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleManualCorrection(index, input.value);
                      }}
                      disabled={manualCorrection?.loading}
                      className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition"
                    >
                      {manualCorrection?.loading ? '...' : 'Check'}
                    </button>
                  </div>

                  {/* Status Messages */}
                  {manualCorrection?.result && (
                    <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
                      <span>✓</span>
                      <span>Found: <strong>{manualCorrection.result.scryfallMatch?.name}</strong></span>
                    </div>
                  )}
                  {manualCorrection?.error && (
                    <div className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <span>✗</span>
                      <span>{manualCorrection.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        {/* Add Manual Corrections Button */}
        {Object.keys(manualCorrections).some(key => manualCorrections[Number(key)]?.result !== null) && (
          <button
            onClick={handleAddManualCorrections}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            ✓ Add {Object.values(manualCorrections).filter(mc => mc.result !== null).length} Manual Correction(s)
          </button>
        )}

        {/* AI Correction Button */}
        <button
          onClick={handleCorrectAll}
          disabled={correcting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
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
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Manually correct individual cards or use AI to correct all. Only successfully matched cards will be added.
      </p>
    </div>
  );
};
