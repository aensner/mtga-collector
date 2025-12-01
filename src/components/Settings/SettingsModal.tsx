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
      alert('Settings saved successfully!\n\nNote: Refresh the page to apply API key changes.');
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="modal max-w-xl">
        <div className="premium-card">
          <div className="premium-card-content p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-magic flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-text-primary">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="btn-icon"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-glass-border">
              <button
                onClick={() => setActiveTab('api')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                  activeTab === 'api'
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  API Keys
                </span>
                {activeTab === 'api' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-magic" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                  activeTab === 'preferences'
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Preferences
                </span>
                {activeTab === 'preferences' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-magic" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-text-muted">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading settings...
                  </div>
                </div>
              ) : (
                <>
                  {/* API Keys Tab */}
                  {activeTab === 'api' && (
                    <div className="space-y-6">
                      {/* Info Banner */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                        <svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-text-secondary">
                          API keys stored here override .env file settings and persist across sessions.
                        </p>
                      </div>

                      {/* OpenAI API Key */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
                          OpenAI API Key
                          <span className="badge badge-success text-2xs">Recommended</span>
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
                            className="btn-icon"
                          >
                            {showPassword.openai ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          Get your key from{' '}
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            platform.openai.com/api-keys
                          </a>
                        </p>
                      </div>

                      {/* Anthropic API Key */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
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
                            className="btn-icon"
                          >
                            {showPassword.anthropic ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          Get your key from{' '}
                          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            console.anthropic.com
                          </a>
                        </p>
                      </div>

                      {/* AI Provider Preference */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
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
                        <p className="text-xs text-text-muted mt-2">
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
                        <label className="block text-sm font-medium text-text-primary mb-2">
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
                        <p className="text-xs text-text-muted mt-2">
                          Used as the default format in the Deck Builder
                        </p>
                      </div>

                      {/* Cards Per Page */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
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
                        <p className="text-xs text-text-muted mt-2">
                          Number of cards displayed per page in the collection table
                        </p>
                      </div>

                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
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
                        <p className="text-xs text-text-muted mt-2">
                          Light theme is not yet implemented
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-glass-border">
              <button
                onClick={onClose}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving || loading}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};
