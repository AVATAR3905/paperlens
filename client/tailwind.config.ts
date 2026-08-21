import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(240 3.7% 12%)",
        input: "hsl(240 3.7% 15%)",
        ring: "hsl(160 84% 39%)",
        background: "hsl(240 10% 3%)",
        foreground: "hsl(0 0% 95%)",
        primary: {
          DEFAULT: "hsl(160 84% 39%)",
          foreground: "hsl(0 0% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(240 3.7% 10%)",
          foreground: "hsl(0 0% 95%)",
        },
        muted: {
          DEFAULT: "hsl(240 3.7% 10%)",
          foreground: "hsl(240 5% 55%)",
        },
        accent: {
          DEFAULT: "hsl(240 3.7% 10%)",
          foreground: "hsl(0 0% 95%)",
        },
        card: {
          DEFAULT: "hsl(240 10% 4%)",
          foreground: "hsl(0 0% 95%)",
        },
        emerald: {
          DEFAULT: "hsl(160 84% 39%)",
          foreground: "hsl(0 0% 98%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
