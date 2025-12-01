/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Dark Theme
        dark: {
          950: '#030306',
          900: '#09090f',
          850: '#0d0d14',
          800: '#12121a',
          750: '#16161f',
          700: '#1a1a24',
          600: '#242430',
          500: '#32323f',
          400: '#4a4a5a',
        },

        // Magic-inspired accent colors
        magic: {
          purple: '#a855f7',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          pink: '#ec4899',
          gold: '#f59e0b',
        },

        // Gradient endpoints
        gradient: {
          start: '#667eea',
          mid: '#764ba2',
          end: '#f093fb',
        },

        // Semantic
        primary: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          glow: 'rgba(139, 92, 246, 0.5)',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2',
          glow: 'rgba(6, 182, 212, 0.5)',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.5)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.5)',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          glow: 'rgba(239, 68, 68, 0.5)',
        },

        // Text colors
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
          disabled: '#475569',
        },

        // Glass effect colors
        glass: {
          white: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.08)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },

      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },

      boxShadow: {
        'glow-sm': '0 0 15px -3px var(--tw-shadow-color)',
        'glow': '0 0 25px -5px var(--tw-shadow-color)',
        'glow-lg': '0 0 40px -5px var(--tw-shadow-color)',
        'glow-xl': '0 0 60px -10px var(--tw-shadow-color)',
        'inner-glow': 'inset 0 0 20px -5px var(--tw-shadow-color)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-magic': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #06b6d4 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #06b6d4 50%, #10b981 75%, #667eea 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(268,100%,70%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(268,100%,70%,0.1) 0px, transparent 50%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },

      backdropBlur: {
        xs: '2px',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'border-flow': 'borderFlow 4s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
