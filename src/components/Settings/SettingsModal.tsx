import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { loadSettings, saveSettings, type UserSettings } from '../../services/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'preferences'>('api');
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({ openai: false, anthropic: false });

  useEffect(() => {
    if (isOpen) {
      loadUserSettings();
    }
  }, [isOpen]);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      const userSettings = await loadSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      alert('✅ Settings saved successfully!\n\nNote: Refresh the page to apply API key changes.');
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('❌ Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-base border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-fg-primary">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-fg-muted hover:text-fg-primary transition-fast text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 flex">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-fast ${
              activeTab === 'api'
                ? 'text-accent border-b-2 border-accent'
                : 'text-fg-muted hover:text-fg-secondary'
            }`}
          >
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-fast ${
              activeTab === 'preferences'
                ? 'text-accent border-b-2 border-accent'
                : 'text-fg-muted hover:text-fg-secondary'
            }`}
          >
            🎨 Preferences
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-fg-muted py-8">Loading settings...</div>
          ) : (
            <>
              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div className="bg-info/10 border border-info rounded p-4 text-sm">
                    <p className="text-fg-secondary">
                      <strong>💡 Tip:</strong> API keys stored here override .env file settings and persist across sessions.
                      Your keys are stored securely in the database.
                    </p>
                  </div>

                  {/* OpenAI API Key */}
                  <div>
                    <label className="block text-sm font-medium text-fg-primary mb-2">
                      OpenAI API Key <span className="text-ok text-xs">(Recommended)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showPassword.openai ? 'text' : 'password'}
                        value={settings.openai_api_key || ''}
                        onChange={(e) => updateSetting('openai_api_key', e.target.value)}
                        placeholder="sk-..."
                        className="input flex-1"
                      />
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, openai: !prev.openai }))}
                        className="button ghost px-3"
                      >
                        {showPassword.openai ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <p className="text-xs text-fg-muted mt-1">
                      Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">platform.openai.com/api-keys</a>
                    </p>
                  </div>

                  {/* Anthropic API Key */}
                  <div>
                    <label className="block text-sm font-medium text-fg-primary mb-2">
                      Anthropic API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showPassword.anthropic ? 'text' : 'password'}
                        value={settings.anthropic_api_key || ''}
                        onChange={(e) => updateSetting('anthropic_api_key', e.target.value)}
                        placeholder="sk-ant-..."
                        className="input flex-1"
                      />
                      <button
                        onClick={() => setShowPassword(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                        className="button ghost px-3"
                      >
                        {showPassword.anthropic ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <p className="text-xs text-fg-muted mt-1">
                      Get your key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">console.anthropic.com</a>
                    </p>
                  </div>

                  {/* AI Provider Preference */}
                  <div>
                    <label className="block text-sm font-medium text-fg-primary mb-2">
                      Preferred AI Provider
                    </label>
                    <select
                      value={settings.ai_provider_preference || 'auto'}
                      onChange={(e) => updateSetting('ai_provider_preference', e.target.value as 'auto' | 'openai' | 'anthropic')}
                      className="select w-full"
                    >
                      <option value="auto">Auto (prefer OpenAI if available)</option>
                      <option value="openai">Always use OpenAI</option>
                      <option value="anthropic">Always use Anthropic</option>
                    </select>
                    <p className="text-xs text-fg-muted mt-1">
                      Auto mode uses OpenAI first (more affordable), falls back to Anthropic
                    </p>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  {/* Default Deck Format */}
                  <div>
                    <label className="block text-sm font-medium text-fg-primary mb-2">
                      Default Deck Format
                    </label>
                    <select
                      value={settings.default_deck_format || 'Standard'}
                      onChange={(e) => updateSetting('default_deck_format', e.target.value)}
                      className="select w-full"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Modern">Modern</option>
                      <option value="Pioneer">Pioneer</option>
                      <option value="Commander">Commander</option>
                      <option value="Legacy">Legacy</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Pauper">Pauper</option>
                      <option value="Historic">Historic</option>
                      <option value="Alchemy">Alchemy</option>
                    </select>
                    <p className="text-xs text-fg-muted mt-1">
                      Used as the default format in the Deck Builder
                    </p>
                  </div>

                  {/* Cards Per Page */}
                  <div>
                    <label className="block text-sm font-medium text-fg-primary mb-2">
                      Cards Per Page
                    </label>
                    <select
                      value={settings.cards_per_page || 50}
                      onChange={(e) => updateSetting('cards_per_page', parseInt(e.target.value))}
                      className="select w-full"
                    >
                      <option value={10}>10 cards</option>
                      <option value={20}>20 cards</option>
                      <option value={50}>50 cards (default)</option>
                      <option value={100}>100 cards</option>
                    </select>
                    <p className="text-xs text-fg-muted mt-1">
                      Number of cards displayed per page in the collection table
                    </p>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-fg-primary mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.theme || 'dark'}
                      onChange={(e) => updateSetting('theme', e.target.value as 'dark' | 'light')}
                      className="select w-full"
                      disabled
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light (coming soon)</option>
                    </select>
                    <p className="text-xs text-fg-muted mt-1">
                      Light theme is not yet implemented
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="button ghost"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="button ok"
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
