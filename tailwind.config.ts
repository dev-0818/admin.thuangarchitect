import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#161311",
        surface: "#161311",
        "surface-bright": "#3d3836",
        "surface-container-lowest": "#100e0c",
        "surface-container-low": "#1e1b19",
        "surface-container": "#221f1d",
        "surface-container-high": "#2d2927",
        "surface-container-highest": "#383432",
        "surface-variant": "#383432",
        primary: "#d1c4be",
        "primary-container": "#685e59",
        secondary: "#a4c9ff",
        "secondary-container": "#0164b4",
        tertiary: "#d4c3b8",
        outline: "#9a8e89",
        "outline-variant": "#4e4541",
        "on-background": "#e9e1dd",
        "on-surface": "#e9e1dd",
        "on-surface-variant": "#d1c4be",
        "on-primary": "#372f2b",
        error: "#ffb4ab"
      },
      fontFamily: {
        headline: ["var(--font-plus-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-plus-jakarta)", "sans-serif"]
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem"
      },
      boxShadow: {
        ambient: "0 24px 60px -20px rgba(0, 0, 0, 0.3)"
      },
      backgroundImage: {
        "architect-grid":
          "linear-gradient(to right, rgba(78,69,65,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(78,69,65,0.35) 1px, transparent 1px)",
        "metal-gradient": "linear-gradient(45deg, #d1c4be 0%, #685e59 100%)"
      }
    }
  },
  plugins: []
};

export default config;
