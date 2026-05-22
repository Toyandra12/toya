import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          subtle: "#0f1117",
          panel: "#13151c",
          elevated: "#1a1d27",
          border: "#252836",
        },
        brand: {
          50: "#eff6ff",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          accent: "#8b5cf6",
        },
        success: "#10b981",
        warn: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.25), 0 8px 32px -8px rgba(59,130,246,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
