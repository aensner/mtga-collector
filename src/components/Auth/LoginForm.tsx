import React, { useState } from 'react';
import { signIn, signUp } from '../../services/supabase';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess('Account created! Please check your email to confirm.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="fixed inset-0 bg-mesh pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="premium-card">
          <div className="premium-card-content">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-magic flex items-center justify-center shadow-glow-lg shadow-primary/40">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                MTG Collector
              </h1>
              <p className="text-text-muted mt-2">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20">
                  <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-error">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-success">{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Toggle Sign In/Sign Up */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
                ) : (
                  <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-6">
          Powered by Tesseract.js, Anthropic Claude & Scryfall
        </p>
      </div>
    </div>
  );
};
