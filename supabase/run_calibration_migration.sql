-- Run calibration migration with proper error handling
-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own calibration" ON public.user_calibration_settings;
    DROP POLICY IF EXISTS "Users can insert their own calibration" ON public.user_calibration_settings;
    DROP POLICY IF EXISTS "Users can update their own calibration" ON public.user_calibration_settings;
    DROP POLICY IF EXISTS "Users can delete their own calibration" ON public.user_calibration_settings;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create user_calibration_settings table to persist per-user calibration
CREATE TABLE IF NOT EXISTS public.user_calibration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Grid calibration parameters
  start_x DECIMAL(5,4) NOT NULL DEFAULT 0.027,
  start_y DECIMAL(5,4) NOT NULL DEFAULT 0.193,
  grid_width DECIMAL(5,4) NOT NULL DEFAULT 0.945,
  grid_height DECIMAL(5,4) NOT NULL DEFAULT 0.788,
  card_gap_x DECIMAL(5,4) NOT NULL DEFAULT 0.008,
  card_gap_y DECIMAL(5,4) NOT NULL DEFAULT 0.036,

  -- OCR region parameters
  ocr_left DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  ocr_top DECIMAL(5,4) NOT NULL DEFAULT 0.043,
  ocr_width DECIMAL(5,4) NOT NULL DEFAULT 0.80,
  ocr_height DECIMAL(5,4) NOT NULL DEFAULT 0.075,

  -- Quantity detection parameters
  quantity_offset_x DECIMAL(5,4) NOT NULL DEFAULT 0.28,
  quantity_offset_y DECIMAL(5,4) NOT NULL DEFAULT 0.08,
  quantity_width DECIMAL(5,4) NOT NULL DEFAULT 0.44,
  quantity_height DECIMAL(5,4) NOT NULL DEFAULT 0.07,
  brightness_threshold INTEGER NOT NULL DEFAULT 50,
  saturation_threshold INTEGER NOT NULL DEFAULT 10,
  fill_ratio_threshold DECIMAL(5,4) NOT NULL DEFAULT 0.05,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One calibration per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_calibration_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own calibration"
  ON public.user_calibration_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calibration"
  ON public.user_calibration_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calibration"
  ON public.user_calibration_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calibration"
  ON public.user_calibration_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_calibration_user_id ON public.user_calibration_settings(user_id);

-- Create trigger to auto-update updated_at
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_calibration_settings_updated_at ON public.user_calibration_settings;

    CREATE TRIGGER update_calibration_settings_updated_at
      BEFORE UPDATE ON public.user_calibration_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'Function update_updated_at_column() does not exist yet. Please run migration 001 first.';
END $$;
