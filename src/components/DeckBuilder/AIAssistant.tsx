import React, { useState } from 'react';
import type { CardData } from '../../types';
import { getAIDeckSuggestions } from '../../services/anthropic';

interface DeckCard {
  card: CardData;
  count: number;
}

interface AIAssistantProps {
  deckCards: DeckCard[];
  collection: CardData[];
  format: string;
  onAddSuggestion: (card: CardData, count: number) => void;
}

interface Suggestion {
  cardName: string;
  count: number;
  reason: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  deckCards,
  collection,
  format,
  onAddSuggestion
}) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async () => {
    if (!prompt.trim()) {
      alert('Please describe what kind of deck you want to build');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      // Prepare deck context
      const currentDeck = deckCards.map(dc => ({
        name: dc.card.scryfallMatch?.name || dc.card.kartenname,
        count: dc.count,
        type: dc.card.scryfallMatch?.type_line,
        cmc: dc.card.scryfallMatch?.cmc
      }));

      // Prepare collection context (simplified)
      const availableCards = collection
        .filter(card => card.scryfallMatch) // Only cards with Scryfall data
        .map(card => ({
          name: card.scryfallMatch!.name,
          type: card.scryfallMatch!.type_line,
          cmc: card.scryfallMatch!.cmc,
          colors: card.scryfallMatch!.colors,
          available: card.anzahl - (deckCards.find(dc => dc.card.scryfallMatch?.id === card.scryfallMatch?.id)?.count || 0)
        }))
        .filter(card => card.available > 0); // Only cards we have available

      const response = await getAIDeckSuggestions(
        prompt,
        currentDeck,
        availableCards,
        format
      );

      setSuggestions(response.suggestions);
    } catch (err) {
      console.error('AI suggestion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    // Find card in collection
    const card = collection.find(c =>
      (c.scryfallMatch?.name || c.kartenname).toLowerCase() === suggestion.cardName.toLowerCase()
    );

    if (card) {
      onAddSuggestion(card, suggestion.count);
    } else {
      alert(`Card "${suggestion.cardName}" not found in your collection`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
      </div>

      <div className="card-body space-y-4">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-2">
            Describe your deck idea
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Build an aggressive red deck', 'Create a control deck with blue and white', 'Make a token generation deck'"
            className="input w-full h-24 resize-none"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={getSuggestions}
          disabled={isLoading || !prompt.trim()}
          className="button ok w-full"
        >
          {isLoading ? '✨ Thinking...' : '✨ Get AI Suggestions'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-error/20 border border-error rounded p-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-fg-secondary">Suggestions</h4>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded p-3 space-y-2 hover:bg-bg-muted/40 transition-fast"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-fg-primary">
                        {suggestion.count}x {suggestion.cardName}
                      </div>
                      <div className="text-xs text-fg-muted mt-1">
                        {suggestion.reason}
                      </div>
                    </div>
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="button ok text-xs flex-shrink-0"
                      title="Add to deck"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-fg-muted bg-bg-muted/30 rounded p-3">
          <strong>Tips:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Describe the strategy you want (aggro, control, midrange)</li>
            <li>Mention specific colors or card types</li>
            <li>Ask for specific improvements to your current deck</li>
            <li>Request synergies with cards already in your deck</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
