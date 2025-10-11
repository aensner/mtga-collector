import { supabase } from './supabase';
import type { CardData, CalibrationSettings, DbCalibrationSettings } from '../types';

export interface DbCollectionCard {
  id: string;
  user_id: string;
  card_name: string;
  quantity: number;
  scryfall_id?: string;
  scryfall_name?: string;
  set_code?: string;
  rarity?: string;
  image_url?: string;
  page_number?: number;
  position_x?: number;
  position_y?: number;
  confidence?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Load user's collection from Supabase
 */
export const loadCollection = async (): Promise<CardData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot load collection');
      return [];
    }

    const { data, error } = await supabase
      .from('collection_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading collection:', error);
      throw error;
    }

    // Convert database format to CardData format
    return (data || []).map(dbCardToCardData);
  } catch (error) {
    console.error('Failed to load collection:', error);
    return [];
  }
};

/**
 * Save cards to Supabase (upsert: insert new, update existing)
 */
export const saveCards = async (cards: CardData[]): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot save cards');
      throw new Error('User not authenticated');
    }

    // Convert CardData to database format
    const dbCards = cards.map(card => cardDataToDb(card, user.id));

    // Upsert cards (insert new, update existing based on user_id + card_name)
    const { error } = await supabase
      .from('collection_cards')
      .upsert(dbCards, {
        onConflict: 'user_id,card_name',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving cards:', error);
      throw error;
    }

    // Update user_collections timestamp
    await supabase
      .from('user_collections')
      .upsert({
        user_id: user.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    console.log(`✅ Successfully saved ${cards.length} cards to collection`);
  } catch (error) {
    console.error('Failed to save cards:', error);
    throw error;
  }
};

/**
 * Reset entire collection (delete all cards)
 */
export const resetCollection = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot reset collection');
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('collection_cards')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error resetting collection:', error);
      throw error;
    }

    console.log('✅ Collection reset successfully');
  } catch (error) {
    console.error('Failed to reset collection:', error);
    throw error;
  }
};

/**
 * Save scan history (optional analytics)
 */
export const saveScanHistory = async (cardsScanned: number, pagesProcessed: number): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('scan_history')
      .insert({
        user_id: user.id,
        cards_scanned: cardsScanned,
        pages_processed: pagesProcessed
      });
  } catch (error) {
    console.error('Failed to save scan history:', error);
    // Don't throw - this is optional analytics
  }
};

/**
 * Helper: Convert database card to CardData
 */
const dbCardToCardData = (dbCard: DbCollectionCard): CardData => {
  return {
    nummer: 0, // We don't store nummer in DB (it's position-specific)
    positionX: dbCard.position_x || 0,
    positionY: dbCard.position_y || 0,
    kartenname: dbCard.card_name,
    anzahl: dbCard.quantity,
    confidence: dbCard.confidence,
    pageNumber: dbCard.page_number,
    scryfallMatch: dbCard.scryfall_id ? {
      id: dbCard.scryfall_id,
      name: dbCard.scryfall_name || dbCard.card_name,
      set: dbCard.set_code || '',
      rarity: dbCard.rarity || '',
      image_uris: dbCard.image_url ? {
        small: dbCard.image_url,
        normal: dbCard.image_url,
        large: dbCard.image_url
      } : undefined
    } : undefined
  };
};

/**
 * Helper: Convert CardData to database format
 */
const cardDataToDb = (card: CardData, userId: string): Partial<DbCollectionCard> => {
  return {
    user_id: userId,
    card_name: card.kartenname,
    quantity: card.anzahl,
    scryfall_id: card.scryfallMatch?.id,
    scryfall_name: card.scryfallMatch?.name,
    set_code: card.scryfallMatch?.set,
    rarity: card.scryfallMatch?.rarity,
    image_url: card.scryfallMatch?.image_uris?.normal,
    page_number: card.pageNumber,
    position_x: card.positionX,
    position_y: card.positionY,
    confidence: card.confidence
  };
};

/**
 * Load user's calibration settings from Supabase
 */
export const loadCalibrationSettings = async (): Promise<CalibrationSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot load calibration settings');
      return null;
    }

    const { data, error } = await supabase
      .from('user_calibration_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No calibration settings found - return null (will use defaults)
        console.log('No calibration settings found, using defaults');
        return null;
      }
      console.error('Error loading calibration settings:', error);
      throw error;
    }

    // Convert database format to CalibrationSettings format
    return dbCalibrationToSettings(data);
  } catch (error) {
    console.error('Failed to load calibration settings:', error);
    return null;
  }
};

/**
 * Save user's calibration settings to Supabase (upsert)
 */
export const saveCalibrationSettings = async (settings: CalibrationSettings): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user logged in, cannot save calibration settings');
      throw new Error('User not authenticated');
    }

    // Convert CalibrationSettings to database format
    const dbSettings = settingsToDbCalibration(settings, user.id);

    // Upsert settings (insert new, update existing based on user_id)
    const { error } = await supabase
      .from('user_calibration_settings')
      .upsert(dbSettings, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving calibration settings:', error);
      throw error;
    }

    console.log('✅ Successfully saved calibration settings');
  } catch (error) {
    console.error('Failed to save calibration settings:', error);
    throw error;
  }
};

/**
 * Helper: Convert database calibration to CalibrationSettings
 */
const dbCalibrationToSettings = (db: DbCalibrationSettings): CalibrationSettings => {
  return {
    startX: db.start_x,
    startY: db.start_y,
    gridWidth: db.grid_width,
    gridHeight: db.grid_height,
    cardGapX: db.card_gap_x,
    cardGapY: db.card_gap_y,
    ocrLeft: db.ocr_left,
    ocrTop: db.ocr_top,
    ocrWidth: db.ocr_width,
    ocrHeight: db.ocr_height,
    quantityOffsetX: db.quantity_offset_x,
    quantityOffsetY: db.quantity_offset_y,
    quantityWidth: db.quantity_width,
    quantityHeight: db.quantity_height,
    brightnessThreshold: db.brightness_threshold,
    saturationThreshold: db.saturation_threshold,
    fillRatioThreshold: db.fill_ratio_threshold
  };
};

/**
 * Helper: Convert CalibrationSettings to database format
 */
const settingsToDbCalibration = (settings: CalibrationSettings, userId: string): Partial<DbCalibrationSettings> => {
  return {
    user_id: userId,
    start_x: settings.startX,
    start_y: settings.startY,
    grid_width: settings.gridWidth,
    grid_height: settings.gridHeight,
    card_gap_x: settings.cardGapX,
    card_gap_y: settings.cardGapY,
    ocr_left: settings.ocrLeft,
    ocr_top: settings.ocrTop,
    ocr_width: settings.ocrWidth,
    ocr_height: settings.ocrHeight,
    quantity_offset_x: settings.quantityOffsetX,
    quantity_offset_y: settings.quantityOffsetY,
    quantity_width: settings.quantityWidth,
    quantity_height: settings.quantityHeight,
    brightness_threshold: settings.brightnessThreshold,
    saturation_threshold: settings.saturationThreshold,
    fill_ratio_threshold: settings.fillRatioThreshold
  };
};
