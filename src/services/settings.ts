import { supabase } from './supabase';

export interface UserSettings {
  // API Keys
  openai_api_key?: string;
  anthropic_api_key?: string;

  // Preferences
  default_deck_format?: string;
  ai_provider_preference?: 'auto' | 'openai' | 'anthropic';

  // UI Preferences
  cards_per_page?: number;
  theme?: 'dark' | 'light';
}

const DEFAULT_SETTINGS: UserSettings = {
  default_deck_format: 'Standard',
  ai_provider_preference: 'auto',
  cards_per_page: 50,
  theme: 'dark',
};

/**
 * Load user settings from Supabase
 */
export async function loadSettings(): Promise<UserSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, using default settings');
      return DEFAULT_SETTINGS;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        console.log('No settings found, using defaults');
        return DEFAULT_SETTINGS;
      }
      throw error;
    }

    return { ...DEFAULT_SETTINGS, ...data };
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings to Supabase
 */
export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No user logged in');
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;
    }

    console.log('✅ Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Get API keys from settings (with fallback to env variables)
 */
export async function getAPIKeys(): Promise<{
  openai?: string;
  anthropic?: string;
}> {
  const settings = await loadSettings();

  return {
    openai: settings.openai_api_key || import.meta.env.VITE_OPENAI_API_KEY,
    anthropic: settings.anthropic_api_key || import.meta.env.VITE_ANTHROPIC_API_KEY,
  };
}

/**
 * Update a single setting
 */
export async function updateSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
): Promise<void> {
  await saveSettings({ [key]: value });
}
