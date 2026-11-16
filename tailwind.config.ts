import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a1a2f",
          soft: "#12263f",
          muted: "#31445c",
        },
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd7ff",
          300: "#8dbeff",
          400: "#579cff",
          500: "#2f7bf6",
          600: "#0b63ce",
          700: "#0a4fa6",
          800: "#0d4388",
          900: "#103a70",
        },
        sand: {
          50: "#faf6f0",
          100: "#f3e9dc",
          200: "#e7d2b8",
          300: "#d9b48f",
          400: "#c99768",
        },
        cream: "#f7f4ef",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Segoe UI",
          "-apple-system",
          "BlinkMacSystemFont",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10, 26, 47, 0.04), 0 12px 32px -16px rgba(10, 26, 47, 0.18)",
        lift: "0 2px 4px rgba(10, 26, 47, 0.05), 0 24px 48px -20px rgba(10, 26, 47, 0.28)",
      },
      maxWidth: {
        page: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
