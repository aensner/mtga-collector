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
      const cardNames = unmatchedCards.map(c => c.kartenname);
      console.log('Sending to AI for correction:', cardNames);

      const aiCorrections = await correctCardNamesBatch(cardNames);
      const correctedNames = aiCorrections.map(c => c.correctedName);
      const scryfallResults = await searchCardsBatch(correctedNames);

      const results: CorrectionResult[] = unmatchedCards.map((card, i) => {
        const corrected = aiCorrections[i].correctedName;
        const scryfallMatch = scryfallResults[i];

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
      let errorMessage = 'Error during AI correction.';

      if (error?.message?.includes('credit balance is too low') || error?.message?.includes('quota')) {
        errorMessage = 'API Credits Low\n\nYour AI API credit balance is too low.';
      } else if (error?.message?.includes('No AI Provider')) {
        errorMessage = 'No AI Provider Configured\n\nAdd VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to .env';
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

    setManualCorrections(prev => ({
      ...prev,
      [cardIndex]: { value: correctedName, loading: true, result: null, error: null },
    }));

    try {
      const scryfallCard = await searchCardByName(correctedName);

      if (scryfallCard) {
        const originalCard = unmatchedCards[cardIndex];
        const updatedCard: CardData = {
          ...originalCard,
          correctedName: scryfallCard.name,
          scryfallMatch: scryfallCard,
        };

        setManualCorrections(prev => ({
          ...prev,
          [cardIndex]: { value: correctedName, loading: false, result: updatedCard, error: null },
        }));
      } else {
        setManualCorrections(prev => ({
          ...prev,
          [cardIndex]: { value: correctedName, loading: false, result: null, error: 'Card not found in Scryfall' },
        }));
      }
    } catch (error) {
      console.error('Error searching Scryfall:', error);
      setManualCorrections(prev => ({
        ...prev,
        [cardIndex]: { value: correctedName, loading: false, result: null, error: 'Error searching Scryfall' },
      }));
    }
  };

  const handleAddManualCorrections = () => {
    const manuallyMatchedCards = Object.values(manualCorrections)
      .filter(mc => mc.result !== null)
      .map(mc => mc.result!);

    if (manuallyMatchedCards.length > 0) {
      console.log(`Adding ${manuallyMatchedCards.length} manually corrected cards to collection`);
      onCardsMatched(manuallyMatchedCards);
      setManualCorrections({});
    }
  };

  const handleAddToCollection = () => {
    const matchedCards = corrections
      .filter(c => c.scryfallMatch)
      .map(c => c.card);

    console.log(`Adding ${matchedCards.length} corrected cards to collection`);
    onCardsMatched(matchedCards);
    setShowResults(false);
    setCorrections([]);
  };

  // AI Results View
  if (showResults) {
    const successCount = corrections.filter(c => c.scryfallMatch).length;
    const failCount = corrections.length - successCount;

    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between w-full">
            <h3 className="heading-md flex items-center gap-3">
              <span className={`badge ${successCount > 0 ? 'badge-success' : 'badge-warning'}`}>
                {successCount > 0 ? 'Success' : 'Warning'}
              </span>
              AI Correction Results
            </h3>
            <span className="text-small" style={{ color: 'var(--text-muted)' }}>
              {successCount} matched, {failCount} failed
            </span>
          </div>
        </div>

        <div className="card-body space-y-4">
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            {corrections.map((result, index) => {
              const manualCorrection = manualCorrections[index];
              const isManuallyFixed = manualCorrection !== undefined && manualCorrection.result !== null;
              const isSuccess = isManuallyFixed || result.scryfallMatch;

              return (
                <div
                  key={index}
                  className="stat-card"
                  style={{
                    borderLeft: `4px solid ${isSuccess ? 'var(--success)' : 'var(--error)'}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-caption flex-shrink-0">{index + 1}.</span>
                      <span className="text-small truncate" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        {result.original}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span className="text-small font-medium truncate" style={{ color: isSuccess ? 'var(--success)' : 'var(--error)' }}>
                        {isManuallyFixed
                          ? manualCorrection?.result?.scryfallMatch?.name
                          : result.scryfallMatch
                            ? result.card.scryfallMatch?.name
                            : result.corrected}
                      </span>
                    </div>
                    <span className={`badge flex-shrink-0 ${isManuallyFixed ? 'badge-success' : isSuccess ? 'badge-success' : 'badge-error'}`}>
                      {isManuallyFixed ? 'Fixed' : isSuccess ? 'Found' : 'Not Found'}
                    </span>
                  </div>

                  {!result.scryfallMatch && !isManuallyFixed && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter correct card name..."
                          defaultValue={manualCorrection?.value || result.corrected}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualCorrection(index, e.currentTarget.value)}
                          className="input flex-1"
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
                      {manualCorrection?.error && (
                        <p className="text-caption mt-2" style={{ color: 'var(--error)' }}>✗ {manualCorrection.error}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            {Object.values(manualCorrections).some(mc => mc.result !== null) && (
              <button onClick={handleAddManualCorrections} className="btn flex-1" style={{ background: 'var(--success)', color: 'white' }}>
                Add {Object.values(manualCorrections).filter(mc => mc.result !== null).length} Manual Fix(es)
              </button>
            )}
            {successCount > 0 && (
              <button onClick={handleAddToCollection} className="btn flex-1" style={{ background: 'var(--success)', color: 'white' }}>
                Add {successCount} AI Match(es)
              </button>
            )}
            <button
              onClick={() => { setShowResults(false); setCorrections([]); setManualCorrections({}); }}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Unmatched Cards View
  return (
    <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <h3 className="heading-md flex items-center gap-3">
            <span className="badge badge-warning">Attention</span>
            Unmatched Cards ({unmatchedCards.length})
          </h3>
        </div>
      </div>

      <div className="card-body space-y-6">
        <p className="text-body">
          These cards weren't found in Scryfall. Use AI to correct them or manually enter the correct names.
        </p>

        {/* Cards List */}
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {unmatchedCards.map((card, index) => {
            const manualCorrection = manualCorrections[index];
            const isManuallyMatched = manualCorrection?.result !== null;

            return (
              <div
                key={index}
                className="stat-card"
                style={{
                  borderLeft: `4px solid ${isManuallyMatched ? 'var(--success)' : 'var(--warning)'}`,
                }}
              >
                <div className="flex gap-4">
                  {/* OCR Region Image */}
                  {card.ocrRegionImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={card.ocrRegionImage}
                        alt="OCR Region"
                        className="rounded-lg"
                        style={{
                          imageRendering: 'pixelated',
                          width: '160px',
                          height: 'auto',
                          border: '2px solid var(--border-secondary)',
                        }}
                      />
                    </div>
                  )}

                  {/* Card Details */}
                  <div className="flex-1 space-y-3">
                    {/* Card Name */}
                    <div className="flex items-center gap-3">
                      <span className="badge badge-neutral">{index + 1}</span>
                      <code
                        className="text-small px-3 py-1.5 rounded-md flex-1"
                        style={{ background: 'var(--bg-tertiary)', fontFamily: 'monospace' }}
                      >
                        "{card.kartenname}"
                      </code>
                    </div>

                    {/* Metadata */}
                    <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                      <span>File: {card.screenshotFilename || 'Unknown'}</span>
                      <span className="mx-2">|</span>
                      <span>Page {card.pageNumber || '?'}, Row {card.positionY}, Col {card.positionX}</span>
                      {card.ocrRegion && (
                        <>
                          <span className="mx-2">|</span>
                          <span>{card.ocrRegion.width}×{card.ocrRegion.height}px</span>
                        </>
                      )}
                    </div>

                    {/* Manual Correction Input */}
                    <div className="pt-2">
                      <label className="form-label mb-2 block">Manual Correction:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter correct card name..."
                          defaultValue={manualCorrection?.value || ''}
                          onKeyDown={(e) => e.key === 'Enter' && handleManualCorrection(index, e.currentTarget.value)}
                          className="input flex-1"
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

                      {manualCorrection?.result && (
                        <p className="text-caption mt-2" style={{ color: 'var(--success)' }}>
                          ✓ Found: <strong>{manualCorrection.result.scryfallMatch?.name}</strong>
                        </p>
                      )}
                      {manualCorrection?.error && (
                        <p className="text-caption mt-2" style={{ color: 'var(--error)' }}>
                          ✗ {manualCorrection.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {Object.values(manualCorrections).some(mc => mc.result !== null) && (
            <button onClick={handleAddManualCorrections} className="btn btn-lg flex-1" style={{ background: 'var(--success)', color: 'white' }}>
              Add {Object.values(manualCorrections).filter(mc => mc.result !== null).length} Manual Correction(s)
            </button>
          )}
          <button
            onClick={handleCorrectAll}
            disabled={correcting}
            className="btn btn-primary btn-lg flex-1"
          >
            {correcting ? (
              <><span className="animate-spin inline-block mr-2">⏳</span>Correcting...</>
            ) : (
              <>✨ Correct All with AI</>
            )}
          </button>
        </div>

        <p className="text-caption text-center" style={{ color: 'var(--text-muted)' }}>
          Only successfully matched cards will be added to your collection.
        </p>
      </div>
    </div>
  );
};
