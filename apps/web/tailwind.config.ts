import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // FRMHG brand mapped to TailAdmin-like scale (for template compatibility)
        brand: {
          25: "#f6fbfa",
          50: "#eef7f4",
          100: "#d7ede7",
          200: "#b3d9cf",
          300: "#86c1b4",
          400: "#4c9a89",
          500: "#1b5448", // primary
          600: "#16463c",
          700: "#123a32",
          800: "#0f2f29",
          900: "#0c2621",
          950: "#071816",
          primary: "#1b5448",
          secondary: "#6d9432",
          institutional: "#b91414"
        },
        success: {
          500: "#12b76a"
        },
        error: {
          500: "#b91414"
        },
        "gray-dark": "#1a2231"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow-condensed)", "system-ui", "sans-serif"]
      },
      fontSize: {
        "theme-xs": ["0.75rem", "1.125rem"],
        "theme-sm": ["0.875rem", "1.25rem"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(27,84,72,0.25), 0 20px 60px -20px rgba(27,84,72,0.55)",
        "theme-xs": "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        "theme-sm":
          "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        "theme-md":
          "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
        "theme-lg":
          "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)"
      },
      zIndex: {
        99999: "99999"
      }
    }
  },
  plugins: []
} satisfies Config;


