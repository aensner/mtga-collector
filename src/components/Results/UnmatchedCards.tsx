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
        errorMessage = 'API Credits Low\n\nYour AI API credit balance is too low.\n\nTo continue:\n- For OpenAI: Visit platform.openai.com/account/billing\n- For Anthropic: Visit console.anthropic.com - Plans & Billing\n\nNote: You can still use the collection scanner - AI correction is optional.';
      } else if (error?.message?.includes('No AI Provider')) {
        errorMessage = 'No AI Provider Configured\n\nTo enable AI correction:\n1. Get an API key from:\n   - OpenAI: platform.openai.com/api-keys\n   - Anthropic: console.anthropic.com\n2. Add to .env file:\n   VITE_OPENAI_API_KEY=your_key\n   OR\n   VITE_ANTHROPIC_API_KEY=your_key\n3. Restart the development server';
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
      <div className="card mt-8">
        <div className="card-header">
          <div className="flex items-center justify-between w-full">
            <h3 className="heading-md flex items-center gap-2">
              {successCount > 0 ? (
                <span className="badge badge-success">Success</span>
              ) : (
                <span className="badge badge-warning">Warning</span>
              )}
              AI Correction Results
            </h3>
            <span className="text-small">
              {successCount} matched, {failCount} failed
            </span>
          </div>
        </div>

        <div className="card-body">
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
            {corrections.map((result, index) => {
              const manualCorrection = manualCorrections[index];
              const isManuallyFixed = manualCorrection !== undefined && manualCorrection.result !== null;

              return (
                <div
                  key={index}
                  className="p-4 rounded-lg"
                  style={{
                    background: isManuallyFixed || result.scryfallMatch
                      ? 'var(--success-light)'
                      : 'var(--error-light)',
                    border: `1px solid ${isManuallyFixed || result.scryfallMatch
                      ? 'var(--success)'
                      : 'var(--error)'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <span className="text-caption">{index + 1}.</span>
                      <span
                        className="text-small"
                        style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}
                      >
                        {result.original}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span
                        className="text-small font-medium"
                        style={{
                          color: isManuallyFixed || result.scryfallMatch
                            ? 'var(--success)'
                            : 'var(--error)',
                        }}
                      >
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
                        <span className="badge badge-success">Manually Fixed</span>
                      ) : result.scryfallMatch ? (
                        <span className="badge badge-success">Found</span>
                      ) : (
                        <span className="badge badge-error">Not Found</span>
                      )}
                    </div>
                  </div>

                  {/* Manual Correction for Failed AI Results */}
                  {!result.scryfallMatch && !isManuallyFixed && (
                    <div className="mt-3 pl-6">
                      <label className="form-label mb-2 block">Manual Correction:</label>
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
                          className="input flex-1"
                          style={{ padding: '8px 12px', fontSize: '0.875rem' }}
                          disabled={manualCorrection?.loading}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            handleManualCorrection(index, input.value);
                          }}
                          disabled={manualCorrection?.loading}
                          className="btn btn-primary btn-sm"
                        >
                          {manualCorrection?.loading ? '...' : 'Check'}
                        </button>
                      </div>

                      {/* Status Messages */}
                      {manualCorrection?.error && (
                        <div
                          className="mt-2 text-caption flex items-center gap-1"
                          style={{ color: 'var(--error)' }}
                        >
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

          <div className="flex gap-3 flex-wrap">
            {/* Add Manual Corrections from AI Results */}
            {Object.keys(manualCorrections).some(key => manualCorrections[Number(key)]?.result !== null) && (
              <button
                onClick={handleAddManualCorrections}
                className="btn btn-primary flex-1"
                style={{ background: 'var(--success)' }}
              >
                Add {Object.values(manualCorrections).filter(mc => mc.result !== null).length} Manual Fix{Object.values(manualCorrections).filter(mc => mc.result !== null).length !== 1 ? 'es' : ''}
              </button>
            )}

            {successCount > 0 && (
              <button
                onClick={handleAddToCollection}
                className="btn btn-primary flex-1"
                style={{ background: 'var(--success)' }}
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
              className="btn btn-secondary"
            >
              Revert & Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card mt-8"
      style={{
        background: 'var(--warning-light)',
        borderColor: 'var(--warning)',
      }}
    >
      <div className="card-header" style={{ borderColor: 'color-mix(in srgb, var(--warning) 30%, transparent)' }}>
        <div className="flex items-center justify-between w-full">
          <h3 className="heading-md flex items-center gap-2">
            <span className="badge badge-warning">Attention</span>
            Unmatched Cards ({unmatchedCards.length})
          </h3>
        </div>
      </div>

      <div className="card-body">
        <p className="text-body mb-4">
          These cards weren't found in Scryfall. They may have OCR errors. You can use AI to correct them or manually enter the correct names.
        </p>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
          {unmatchedCards.map((card, index) => {
            const manualCorrection = manualCorrections[index];
            const isManuallyMatched = manualCorrection?.result !== null;

            return (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-lg"
                style={{
                  background: isManuallyMatched
                    ? 'var(--success-light)'
                    : 'var(--bg-elevated)',
                  border: `1px solid ${isManuallyMatched
                    ? 'var(--success)'
                    : 'var(--border-primary)'}`,
                }}
              >
                {/* OCR Region Image Preview */}
                {card.ocrRegionImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={card.ocrRegionImage}
                      alt="OCR Region"
                      className="rounded"
                      style={{
                        imageRendering: 'pixelated',
                        minWidth: '150px',
                        height: 'auto',
                        border: '2px solid var(--warning)',
                      }}
                    />
                  </div>
                )}

                {/* Card Details */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral">{index + 1}</span>
                    <code
                      className="text-small px-2 py-1 rounded flex-1"
                      style={{
                        background: 'var(--bg-tertiary)',
                        fontFamily: 'monospace',
                      }}
                    >
                      "{card.kartenname}"
                    </code>
                  </div>

                  <div className="text-caption space-y-1">
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>File:</span>{' '}
                      {card.screenshotFilename || 'Unknown'}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Position:</span>{' '}
                      Page {card.pageNumber || '?'}, Row {card.positionY}, Col {card.positionX}
                    </div>
                    {card.ocrRegion && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Size:</span>{' '}
                        {card.ocrRegion.width}×{card.ocrRegion.height}px
                      </div>
                    )}
                  </div>

                  {/* Manual Correction Input */}
                  <div className="mt-1">
                    <label className="form-label mb-1.5 block">Manual Correction:</label>
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
                        className="input flex-1"
                        style={{ padding: '8px 12px', fontSize: '0.875rem' }}
                        disabled={manualCorrection?.loading}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleManualCorrection(index, input.value);
                        }}
                        disabled={manualCorrection?.loading}
                        className="btn btn-primary btn-sm"
                      >
                        {manualCorrection?.loading ? '...' : 'Check'}
                      </button>
                    </div>

                    {/* Status Messages */}
                    {manualCorrection?.result && (
                      <div
                        className="mt-2 text-caption flex items-center gap-1"
                        style={{ color: 'var(--success)' }}
                      >
                        <span>✓</span>
                        <span>Found: <strong>{manualCorrection.result.scryfallMatch?.name}</strong></span>
                      </div>
                    )}
                    {manualCorrection?.error && (
                      <div
                        className="mt-2 text-caption flex items-center gap-1"
                        style={{ color: 'var(--error)' }}
                      >
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

        <div className="flex gap-3 flex-wrap">
          {/* Add Manual Corrections Button */}
          {Object.keys(manualCorrections).some(key => manualCorrections[Number(key)]?.result !== null) && (
            <button
              onClick={handleAddManualCorrections}
              className="btn btn-lg flex-1"
              style={{ background: 'var(--success)', color: 'white' }}
            >
              Add {Object.values(manualCorrections).filter(mc => mc.result !== null).length} Manual Correction(s)
            </button>
          )}

          {/* AI Correction Button */}
          <button
            onClick={handleCorrectAll}
            disabled={correcting}
            className="btn btn-primary btn-lg flex-1"
          >
            {correcting ? (
              <>
                <span className="animate-spin inline-block">⏳</span>
                Correcting with AI...
              </>
            ) : (
              <>
                ✨ Correct All with AI
              </>
            )}
          </button>
        </div>

        <p className="text-caption mt-4 text-center">
          Manually correct individual cards or use AI to correct all. Only successfully matched cards will be added.
        </p>
      </div>
    </div>
  );
};
