import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://');

if (!hasValidCredentials) {
  console.warn('Supabase credentials not found or invalid. Running in demo mode.');
}

// Create client only if we have valid credentials
export const supabase: SupabaseClient | null = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Flag to check if Supabase is available
export const isSupabaseConfigured = hasValidCredentials;

export const signUp = async (email: string, password: string) => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!supabase) {
    // Return a dummy subscription for demo mode
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};
