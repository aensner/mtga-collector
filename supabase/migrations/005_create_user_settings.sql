-- Create user_settings table for storing user preferences and API keys
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- API Keys (encrypted in production, but stored as text for now)
  openai_api_key TEXT,
  anthropic_api_key TEXT,

  -- Preferences
  default_deck_format TEXT DEFAULT 'Standard',
  ai_provider_preference TEXT DEFAULT 'auto', -- 'auto', 'openai', 'anthropic'

  -- UI Preferences
  cards_per_page INTEGER DEFAULT 50,
  theme TEXT DEFAULT 'dark',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE user_settings IS 'Stores user preferences and API keys (should be encrypted in production)';
COMMENT ON COLUMN user_settings.openai_api_key IS 'OpenAI API key - should be encrypted in production';
COMMENT ON COLUMN user_settings.anthropic_api_key IS 'Anthropic API key - should be encrypted in production';
COMMENT ON COLUMN user_settings.ai_provider_preference IS 'Preferred AI provider: auto (choose based on availability), openai, or anthropic';
