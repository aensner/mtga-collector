/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spotify-inspired dark theme
        'spotify-black': '#000000',
        'spotify-base': '#121212',
        'spotify-elevated': '#181818',
        'spotify-highlight': '#1a1a1a',
        'spotify-sidebar': '#000000',
        'spotify-border': '#282828',
        'spotify-green': '#1ed760',
        'spotify-white': '#ffffff',

        // Semantic colors
        bg: {
          base: "#000000",       // Pure black background
          sidebar: "#000000",    // Sidebar background
          elevated: "#121212",   // Cards, panels
          highlight: "#1a1a1a",  // Hover states
          surface: "#181818"     // Secondary surfaces
        },
        fg: {
          primary: "#ffffff",                    // Primary text
          secondary: "rgba(255, 255, 255, 0.7)", // Secondary text
          muted: "rgba(255, 255, 255, 0.5)",     // Muted text
          disabled: "rgba(255, 255, 255, 0.3)"   // Disabled text
        },
        accent: {
          DEFAULT: "#1ed760",    // Spotify green
          hover: "#1fdf64",
          active: "#169c46"
        },
        success: "#1ed760",
        warning: "#ffa42b",
        error: "#f15e6c",
        info: "#509bf5",
        border: {
          DEFAULT: "#282828",
          subtle: "rgba(255, 255, 255, 0.1)",
          focus: "#ffffff"
        }
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "500px"
      },
      boxShadow: {
        sm: "0 2px 4px 0 rgba(0, 0, 0, 0.5)",
        DEFAULT: "0 8px 24px rgba(0, 0, 0, 0.5)",
        md: "0 8px 24px rgba(0, 0, 0, 0.5)",
        lg: "0 16px 40px rgba(0, 0, 0, 0.7)",
        xl: "0 24px 64px rgba(0, 0, 0, 0.8)"
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
      },
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '2rem',        // 32px
        '4xl': '2.5rem',      // 40px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem'
      },
      transitionDuration: {
        fast: "150ms",
        DEFAULT: "200ms",
        slow: "300ms"
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.3, 0, 0.4, 1)"
      }
    },
  },
  plugins: [],
}
