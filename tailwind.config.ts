import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4EEE3",
        cream: "#FBF7EF",
        ink: "#211711",
        espresso: "#2C201A",
        "ink-soft": "#6B5B50",
        line: "#E4DACB",
        jade: {
          DEFAULT: "#11675C",
          deep: "#0C4A42",
          soft: "#3F8C80",
          wash: "#E2EEEB",
        },
        honey: {
          DEFAULT: "#E0A038",
          deep: "#B97D1E",
          wash: "#F6E9CF",
        },
        clay: "#C9603F",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
        thai: ['"IBM Plex Sans Thai"', '"IBM Plex Sans"', "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(33,23,17,0.04), 0 8px 24px -16px rgba(33,23,17,0.28)",
        lift: "0 12px 40px -18px rgba(33,23,17,0.45)",
        stamp: "0 2px 0 rgba(12,74,66,0.18)",
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      keyframes: {
        "rise": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.5) rotate(-8deg)" },
          "60%": { opacity: "1", transform: "scale(0.92) rotate(2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "stamp-in": "stamp-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
