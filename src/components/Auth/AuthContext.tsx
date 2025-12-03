import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange, isSupabaseConfigured } from '../../services/supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoMode: false,
});

export const useAuth = () => useContext(AuthContext);

// Demo user for when Supabase is not configured
const DEMO_USER: SupabaseUser = {
  id: 'demo-user',
  email: 'demo@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured;

  useEffect(() => {
    // If in demo mode, set demo user immediately
    if (isDemoMode) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Check current session
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
