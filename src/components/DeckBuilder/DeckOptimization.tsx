import React, { useState } from 'react';
import { analyzeDeck, findSubstitutes, type DeckCard, type DeckAnalysis } from '../../services/deckOptimization';
import type { CardData } from '../../types';

interface DeckOptimizationProps {
  deckCards: Array<{ card: CardData; count: number }>;
  availableCards: CardData[];
  onApplyChange?: (change: { type: 'add' | 'remove'; cardName: string; count: number }) => void;
}

export const DeckOptimization: React.FC<DeckOptimizationProps> = ({
  deckCards,
  availableCards,
  onApplyChange,
}) => {
  const [analysis, setAnalysis] = useState<DeckAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState('Standard');

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert CardData to DeckCard format
      const deckCardsFormatted: DeckCard[] = deckCards.map(dc => ({
        name: dc.card.scryfallMatch?.name || dc.card.kartenname,
        count: dc.count,
        type: dc.card.scryfallMatch?.type_line,
        cmc: dc.card.scryfallMatch?.cmc,
        colors: dc.card.scryfallMatch?.colors,
        owned: dc.count,
      }));

      const availableCardsFormatted: DeckCard[] = availableCards.map(card => ({
        name: card.scryfallMatch?.name || card.kartenname,
        count: card.anzahl || 1,
        type: card.scryfallMatch?.type_line,
        cmc: card.scryfallMatch?.cmc,
        colors: card.scryfallMatch?.colors,
        owned: card.anzahl || 1,
      }));

      const result = await analyzeDeck(deckCardsFormatted, availableCardsFormatted, format);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze deck');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdd = (cardName: string, count: number) => {
    if (onApplyChange) {
      onApplyChange({ type: 'add', cardName, count });
    }
  };

  const handleApplyRemove = (cardName: string, count: number) => {
    if (onApplyChange) {
      onApplyChange({ type: 'remove', cardName, count });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-bold text-fg-primary">AI Deck Optimization</h3>
          <p className="text-sm text-fg-secondary">
            Get AI-powered recommendations to improve your deck's competitive performance
          </p>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-3">
            <label className="text-sm text-fg-secondary">Format:</label>
            <select
              className="input"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={loading}
            >
              <option value="Standard">Standard</option>
              <option value="Historic">Historic</option>
              <option value="Explorer">Explorer</option>
              <option value="Alchemy">Alchemy</option>
              <option value="Brawl">Brawl</option>
            </select>
            <button
              className="button ok"
              onClick={handleAnalyze}
              disabled={loading || deckCards.length === 0}
            >
              {loading ? 'Analyzing...' : 'Analyze Deck'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Overview */}
          <div className="card">
            <div className="card-header">
              <h4 className="font-semibold text-fg-primary">Deck Analysis</h4>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-bg-muted rounded-lg">
                  <div className="text-xs text-fg-secondary mb-1">Archetype</div>
                  <div className="text-lg font-bold text-accent">{analysis.archetype}</div>
                  <div className="text-xs text-fg-muted">
                    {(analysis.archetypeConfidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                <div className="text-center p-3 bg-bg-muted rounded-lg">
                  <div className="text-xs text-fg-secondary mb-1">Win Rate Est.</div>
                  <div className="text-lg font-bold text-ok">{analysis.winRateEstimate}%</div>
                </div>
                <div className="text-center p-3 bg-bg-muted rounded-lg">
                  <div className="text-xs text-fg-secondary mb-1">Consistency</div>
                  <div className="text-lg font-bold text-fg-primary">{analysis.consistencyScore}/100</div>
                </div>
                <div className="text-center p-3 bg-bg-muted rounded-lg">
                  <div className="text-xs text-fg-secondary mb-1">Format</div>
                  <div className="text-lg font-bold text-fg-primary">{format}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {/* Strengths */}
                <div>
                  <h5 className="text-sm font-semibold text-ok mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-fg-secondary flex items-start gap-2">
                        <span className="text-ok mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <h5 className="text-sm font-semibold text-warn mb-2">Weaknesses</h5>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-fg-secondary flex items-start gap-2">
                        <span className="text-warn mt-0.5">⚠</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Changes */}
          <div className="card">
            <div className="card-header">
              <h4 className="font-semibold text-fg-primary">Optimization Recommendations</h4>
            </div>
            <div className="card-body space-y-4">
              {/* Cards to Add */}
              {analysis.suggestedChanges.add.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-ok mb-2">Cards to Add</h5>
                  <div className="space-y-2">
                    {analysis.suggestedChanges.add.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-bg-muted rounded-lg border border-border-default hover:border-ok/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-fg-primary">
                                {suggestion.count}x {suggestion.cardName}
                              </span>
                              {suggestion.owned > 0 ? (
                                <span className="badge ok">Owned: {suggestion.owned}</span>
                              ) : (
                                <span className="badge error">Not Owned</span>
                              )}
                            </div>
                            <p className="text-sm text-fg-secondary mb-1">{suggestion.reason}</p>
                            <p className="text-xs text-accent font-semibold">
                              Impact: {suggestion.impactEstimate}
                            </p>
                          </div>
                          <button
                            className="button ok"
                            onClick={() => handleApplyAdd(suggestion.cardName, suggestion.count)}
                            disabled={suggestion.owned === 0}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards to Remove */}
              {analysis.suggestedChanges.remove.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-error mb-2">Cards to Remove</h5>
                  <div className="space-y-2">
                    {analysis.suggestedChanges.remove.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-bg-muted rounded-lg border border-border-default hover:border-error/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-fg-primary mb-1">
                              {suggestion.count}x {suggestion.cardName}
                            </div>
                            <p className="text-sm text-fg-secondary">{suggestion.reason}</p>
                          </div>
                          <button
                            className="button danger"
                            onClick={() => handleApplyRemove(suggestion.cardName, suggestion.count)}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestedChanges.add.length === 0 && analysis.suggestedChanges.remove.length === 0 && (
                <div className="text-center py-8 text-fg-secondary">
                  <p className="text-lg mb-2">🎯 Deck looks optimized!</p>
                  <p className="text-sm">No major changes recommended at this time.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!analysis && !loading && deckCards.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12 text-fg-secondary">
            <p className="text-lg mb-2">Add cards to your deck to get started</p>
            <p className="text-sm">AI analysis requires at least a few cards in your deck</p>
          </div>
        </div>
      )}
    </div>
  );
};
