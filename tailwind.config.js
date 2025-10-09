/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0C0F14",
          panel: "#131821",
          muted: "#1A2130",
          elevated: "#0E131B"
        },
        fg: {
          primary: "#E6EEF7",
          secondary: "#BBD0E4",
          muted: "#8BA3B8",
          inverted: "#0C0F14"
        },
        accent: {
          DEFAULT: "#13B9D5",
          600: "#0FA3BA",
          700: "#0C8EA2"
        },
        ok: "#3CCB7F",
        warn: "#FFD166",
        error: "#EF476F",
        info: "#4DA3FF",
        border: {
          subtle: "#233045",
          focus: "#13B9D5",
          separator: "#1F2A3C"
        }
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        pill: "999px"
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.35)",
        md: "0 6px 20px rgba(0,0,0,0.35)",
        lg: "0 12px 32px rgba(0,0,0,0.45)"
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Helvetica Neue", "Arial", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "240ms"
      },
      transitionTimingFunction: {
        mtga: "cubic-bezier(0.25, 0.1, 0.25, 1)"
      }
    },
  },
  plugins: [],
}
