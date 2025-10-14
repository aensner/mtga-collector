import React, { useState } from 'react';
import type { CardData } from '../../types';
import { getAIDeckSuggestions } from '../../services/ai';

interface DeckCard {
  card: CardData;
  count: number;
}

interface AIAssistantProps {
  deckCards: DeckCard[];
  collection: CardData[];
  format: string;
  onAddSuggestion: (card: CardData, count: number) => void;
  onSaveDeck?: (deckName: string, suggestions: Suggestion[]) => void;
}

interface Suggestion {
  cardName: string;
  count: number;
  reason: string;
}

const PROMPT_TEMPLATES = [
  { label: '🎯 Build New Deck', prompt: 'Help me build a {format} deck focused on {strategy}' },
  { label: '⚖️ Improve Curve', prompt: 'Suggest cards to improve my mana curve and make it more efficient' },
  { label: '🗡️ Add Removal', prompt: 'Add more removal spells and interaction to handle threats' },
  { label: '🛡️ Add Card Draw', prompt: 'Include more card draw and card advantage engines' },
  { label: '🏰 Fix Mana Base', prompt: 'Improve my mana base with better lands and fixing' },
  { label: '⚡ More Synergy', prompt: 'Suggest cards that synergize better with what I already have' },
  { label: '💪 More Threats', prompt: 'Add more win conditions and powerful threats' },
  { label: '🎲 Budget Options', prompt: 'Suggest budget-friendly alternatives using my collection' }
];

/**
 * AI-powered deck building assistant component.
 * Provides deck suggestions using OpenAI or Anthropic based on user prompts and collection.
 */
export const AIAssistant: React.FC<AIAssistantProps> = ({
  deckCards,
  collection,
  format,
  onAddSuggestion,
  onSaveDeck
}) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [deckProfile, setDeckProfile] = useState<{
    deckName: string;
    deckDescription: string;
    keyCard: string;
    strategy: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  /**
   * Fetches AI-generated deck suggestions based on user prompt.
   * Validates all suggestions against the user's collection and filters out unavailable cards.
   */
  const getSuggestions = async () => {
    if (!prompt.trim()) {
      alert('Please describe what kind of deck you want to build');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setDeckProfile(null);

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

      // Add basic lands (always available in MTG Arena)
      const basicLands = [
        { name: 'Plains', type: 'Basic Land — Plains', cmc: 0, colors: ['W'], available: 999 },
        { name: 'Island', type: 'Basic Land — Island', cmc: 0, colors: ['U'], available: 999 },
        { name: 'Swamp', type: 'Basic Land — Swamp', cmc: 0, colors: ['B'], available: 999 },
        { name: 'Mountain', type: 'Basic Land — Mountain', cmc: 0, colors: ['R'], available: 999 },
        { name: 'Forest', type: 'Basic Land — Forest', cmc: 0, colors: ['G'], available: 999 }
      ];

      // Add basic lands to available cards (unless they're already in collection)
      basicLands.forEach(basicLand => {
        if (!availableCards.some(c => c.name === basicLand.name)) {
          availableCards.push(basicLand);
        }
      });

      const response = await getAIDeckSuggestions(
        prompt,
        currentDeck,
        availableCards,
        format
      );

      // Validate that all suggested cards are actually in the collection or are basic lands
      const basicLandNames = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
      const validSuggestions = response.suggestions.filter(suggestion => {
        // Basic lands are always valid
        if (basicLandNames.includes(suggestion.cardName)) {
          return true;
        }

        // Check if card exists in collection
        const cardExists = collection.some(c =>
          (c.scryfallMatch?.name || c.kartenname).toLowerCase() === suggestion.cardName.toLowerCase()
        );

        if (!cardExists) {
          console.warn(`⚠️ AI suggested "${suggestion.cardName}" which is not in your collection - filtering out`);
        }

        return cardExists;
      });

      if (validSuggestions.length < response.suggestions.length) {
        const filtered = response.suggestions.length - validSuggestions.length;
        console.warn(`⚠️ Filtered out ${filtered} suggestions that weren't in your collection`);
      }

      setSuggestions(validSuggestions);
      setDeckProfile({
        deckName: response.deckName || 'AI Suggested Deck',
        deckDescription: response.deckDescription || 'A deck built from your collection',
        keyCard: response.keyCard || validSuggestions[0]?.cardName || 'Unknown',
        strategy: response.strategy || 'Play cards and win!',
        strengths: response.strengths || [],
        weaknesses: response.weaknesses || []
      });
    } catch (err) {
      console.error('AI suggestion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a single suggested card to the deck.
   * Handles basic lands by creating virtual card data, or finds the card in collection.
   * @param suggestion - The card suggestion to apply
   */
  const applySuggestion = (suggestion: Suggestion) => {
    // Check if it's a basic land (always available in MTG Arena)
    const basicLandNames = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
    const isBasicLand = basicLandNames.includes(suggestion.cardName);

    if (isBasicLand) {
      // Create virtual basic land card
      const basicLandData: any = {
        kartenname: suggestion.cardName,
        anzahl: 999,
        scryfallMatch: {
          name: suggestion.cardName,
          type_line: `Basic Land — ${suggestion.cardName}`,
          cmc: 0,
          colors: [],
          oracle_text: `Tap: Add ${
            suggestion.cardName === 'Plains' ? 'W' :
            suggestion.cardName === 'Island' ? 'U' :
            suggestion.cardName === 'Swamp' ? 'B' :
            suggestion.cardName === 'Mountain' ? 'R' : 'G'
          }.`
        }
      };
      onAddSuggestion(basicLandData, suggestion.count);
      return;
    }

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

  /**
   * Builds and saves a complete deck from AI suggestions with metadata.
   * Adds all suggested cards to the deck and saves with AI-generated deck name.
   */
  const saveDeckWithProfile = () => {
    if (!deckProfile) return;

    // Build complete deck from suggestions
    const basicLandNames = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
    let addedCount = 0;
    let failedCards: string[] = [];

    suggestions.forEach(suggestion => {
      const isBasicLand = basicLandNames.includes(suggestion.cardName);

      if (isBasicLand) {
        const basicLandData: any = {
          kartenname: suggestion.cardName,
          anzahl: 999,
          scryfallMatch: {
            name: suggestion.cardName,
            type_line: `Basic Land — ${suggestion.cardName}`,
            cmc: 0,
            colors: [],
            oracle_text: `Tap: Add ${
              suggestion.cardName === 'Plains' ? 'W' :
              suggestion.cardName === 'Island' ? 'U' :
              suggestion.cardName === 'Swamp' ? 'B' :
              suggestion.cardName === 'Mountain' ? 'R' : 'G'
            }.`
          }
        };
        onAddSuggestion(basicLandData, suggestion.count);
        addedCount++;
      } else {
        const card = collection.find(c =>
          (c.scryfallMatch?.name || c.kartenname).toLowerCase() === suggestion.cardName.toLowerCase()
        );

        if (card) {
          onAddSuggestion(card, suggestion.count);
          addedCount++;
        } else {
          failedCards.push(suggestion.cardName);
        }
      }
    });

    // Save deck with metadata if callback provided
    if (onSaveDeck && addedCount > 0) {
      onSaveDeck(deckProfile.deckName, suggestions);
    }

    if (failedCards.length > 0) {
      alert(`✅ Built "${deckProfile.deckName}" with ${addedCount} cards!\n\n⚠️ Could not find: ${failedCards.join(', ')}`);
    } else {
      alert(`✅ Successfully built "${deckProfile.deckName}" with ${addedCount} cards!`);
    }
  };

  /**
   * Adds all suggested cards to the deck at once.
   * Used when user wants to manually add cards without saving deck metadata.
   */
  const applyAllSuggestions = () => {
    let addedCount = 0;
    let failedCards: string[] = [];
    const basicLandNames = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];

    suggestions.forEach(suggestion => {
      // Check if it's a basic land
      const isBasicLand = basicLandNames.includes(suggestion.cardName);

      if (isBasicLand) {
        // Create virtual basic land card
        const basicLandData: any = {
          kartenname: suggestion.cardName,
          anzahl: 999,
          scryfallMatch: {
            name: suggestion.cardName,
            type_line: `Basic Land — ${suggestion.cardName}`,
            cmc: 0,
            colors: [],
            oracle_text: `Tap: Add ${
              suggestion.cardName === 'Plains' ? 'W' :
              suggestion.cardName === 'Island' ? 'U' :
              suggestion.cardName === 'Swamp' ? 'B' :
              suggestion.cardName === 'Mountain' ? 'R' : 'G'
            }.`
          }
        };
        onAddSuggestion(basicLandData, suggestion.count);
        addedCount++;
      } else {
        const card = collection.find(c =>
          (c.scryfallMatch?.name || c.kartenname).toLowerCase() === suggestion.cardName.toLowerCase()
        );

        if (card) {
          onAddSuggestion(card, suggestion.count);
          addedCount++;
        } else {
          failedCards.push(suggestion.cardName);
        }
      }
    });

    if (failedCards.length > 0) {
      alert(`Added ${addedCount} cards. Could not find: ${failedCards.join(', ')}`);
    } else {
      alert(`✅ Added all ${addedCount} suggested cards to your deck!`);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
      </div>

      <div className="card-body space-y-4">
        {/* Prompt Templates */}
        {showTemplates && (
          <div className="space-y-2 animate-slideInUp">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-fg-secondary">
                Quick Templates
              </label>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-xs text-fg-muted hover:text-fg-secondary"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PROMPT_TEMPLATES.map((template, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPrompt(template.prompt.replace('{format}', format));
                    setShowTemplates(false);
                  }}
                  className="button ghost text-xs py-2 text-left justify-start"
                  disabled={isLoading}
                  title={template.prompt}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-fg-secondary">
              Describe your deck idea
            </label>
            {!showTemplates && (
              <button
                onClick={() => setShowTemplates(true)}
                className="text-xs text-accent hover:underline"
              >
                Show templates
              </button>
            )}
          </div>
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
          <div className="bg-error/20 border border-error rounded p-4 text-sm space-y-2">
            <div className="text-error font-semibold">{error}</div>
            {(error.includes('credit balance') || error.includes('quota')) && (
              <div className="text-fg-secondary text-xs space-y-1">
                <p>To continue using AI features:</p>
                <div className="ml-2 space-y-1">
                  <p><strong>For OpenAI:</strong></p>
                  <ol className="list-decimal list-inside ml-2">
                    <li>Visit <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">platform.openai.com/account/billing</a></li>
                    <li>Add credits to your account</li>
                  </ol>
                  <p className="mt-2"><strong>For Anthropic:</strong></p>
                  <ol className="list-decimal list-inside ml-2">
                    <li>Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">console.anthropic.com</a></li>
                    <li>Go to Plans & Billing</li>
                    <li>Purchase credits or upgrade your plan</li>
                  </ol>
                </div>
                <p className="mt-2 text-fg-muted italic">Note: You can still build decks manually without AI suggestions.</p>
              </div>
            )}
            {(error.includes('API Key Missing') || error.includes('No AI Provider')) && (
              <div className="text-fg-secondary text-xs space-y-1">
                <p>To enable AI features, get an API key from:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>OpenAI</strong> (recommended): <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">platform.openai.com/api-keys</a></li>
                  <li><strong>Anthropic</strong>: <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">console.anthropic.com</a></li>
                </ul>
                <p className="mt-2">Add to your .env file:</p>
                <code className="block bg-bg-muted px-2 py-1 rounded text-xs mt-1">
                  VITE_OPENAI_API_KEY=your_key<br/>
                  <span className="text-fg-muted"># OR</span><br/>
                  VITE_ANTHROPIC_API_KEY=your_key
                </code>
                <p className="mt-2 text-fg-muted italic">Then restart the development server</p>
              </div>
            )}
          </div>
        )}

        {/* Deck Profile */}
        {deckProfile && (
          <div className="bg-gradient-to-br from-accent/10 to-ok/10 border border-accent/30 rounded-lg p-4 space-y-3 animate-scaleIn">
            {/* Header with Key Card */}
            <div className="flex items-start gap-4">
              {/* Key Card Image */}
              {(() => {
                const keyCardData = collection.find(c =>
                  (c.scryfallMatch?.name || c.kartenname).toLowerCase() === deckProfile.keyCard.toLowerCase()
                );
                const imageUrl = keyCardData?.scryfallMatch?.image_uris?.normal || keyCardData?.scryfallMatch?.image_uris?.small;

                return imageUrl ? (
                  <div className="flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={deckProfile.keyCard}
                      className="w-32 rounded-lg shadow-xl border-2 border-accent"
                    />
                  </div>
                ) : null;
              })()}

              <div className="flex-1">
                <h3 className="text-xl font-bold text-fg-primary mb-2">{deckProfile.deckName}</h3>
                <p className="text-sm text-fg-secondary mb-3">{deckProfile.deckDescription}</p>

                {deckProfile.keyCard && (
                  <div className="inline-flex items-center gap-2 bg-accent/20 px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-accent">⭐ Key Card:</span>
                    <span className="text-xs text-fg-primary font-medium">{deckProfile.keyCard}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Strategy */}
            <div className="bg-bg-base/50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-accent mb-2">🎯 Strategy</h4>
              <p className="text-sm text-fg-secondary">{deckProfile.strategy}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-3">
              {deckProfile.strengths.length > 0 && (
                <div className="bg-ok/10 border border-ok/30 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-ok mb-2">💪 Strengths</h4>
                  <ul className="text-xs text-fg-secondary space-y-1">
                    {deckProfile.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-ok">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {deckProfile.weaknesses.length > 0 && (
                <div className="bg-warn/10 border border-warn/30 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-warn mb-2">⚠️ Weaknesses</h4>
                  <ul className="text-xs text-fg-secondary space-y-1">
                    {deckProfile.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-warn">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Build & Save Button */}
            <button
              onClick={saveDeckWithProfile}
              className="button ok w-full font-semibold"
            >
              🏗️ Build & Save This Deck
            </button>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-fg-secondary">
                Deck Cards ({suggestions.length} unique • {suggestions.reduce((s, sg) => s + sg.count, 0)} total)
              </h4>
              <button
                onClick={applyAllSuggestions}
                className="button ok text-xs"
                title="Add all suggested cards to deck"
              >
                ✨ Add All
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {suggestions.map((suggestion, index) => {
                // Find card in collection for thumbnail
                const card = collection.find(c =>
                  (c.scryfallMatch?.name || c.kartenname).toLowerCase() === suggestion.cardName.toLowerCase()
                );
                const imageUrl = card?.scryfallMatch?.image_uris?.small || card?.scryfallMatch?.image_uris?.normal;

                return (
                  <div
                    key={index}
                    className="border border-gray-700 rounded p-3 hover:bg-bg-muted/40 transition-fast"
                  >
                    <div className="flex items-start gap-3">
                      {/* Card Thumbnail - Always show slot */}
                      <div className="flex-shrink-0">
                        {imageUrl ? (
                          <div
                            className="w-12 h-16 bg-bg-muted rounded bg-cover bg-center shadow-md"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                            title={suggestion.cardName}
                          />
                        ) : (
                          <div
                            className="w-12 h-16 bg-bg-muted/50 rounded flex items-center justify-center text-xs text-fg-muted border border-border-subtle"
                            title="No image available"
                          >
                            ?
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
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
                );
              })}
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
