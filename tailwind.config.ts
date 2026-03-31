import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060b18",
          900: "#0a0f1e",
          800: "#0f172a",
          700: "#1e293b",
          600: "#1e3a8a",
          500: "#2563eb",
          400: "#60a5fa",
          300: "#93c5fd",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
};

export default config;
