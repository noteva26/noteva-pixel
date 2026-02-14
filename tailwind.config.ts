import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        zpix: ["Zpix", "monospace"],
        body: ["Zpix", '"Press Start 2P"', "monospace"],
      },
      colors: {
        // 像素风调色板 - 更柔和的 Gameboy/SNES 风格
        pixel: {
          // Light mode
          bg: "var(--pixel-bg)",
          surface: "var(--pixel-surface)",
          border: "var(--pixel-border)",
          primary: "var(--pixel-primary)",
          secondary: "var(--pixel-secondary)",
          accent: "var(--pixel-accent)",
          success: "var(--pixel-success)",
          info: "var(--pixel-info)",
          warning: "var(--pixel-warning)",
          danger: "var(--pixel-danger)",
          text: "var(--pixel-text)",
          muted: "var(--pixel-muted)",
          dark: "var(--pixel-dark)",
          card: "var(--pixel-card)",
        },
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px var(--pixel-shadow)",
        "pixel-sm": "2px 2px 0px 0px var(--pixel-shadow)",
        "pixel-hover": "6px 6px 0px 0px var(--pixel-shadow)",
        "pixel-inset": "inset 2px 2px 0px 0px var(--pixel-shadow)",
      },
      animation: {
        blink: "blink 1s step-end infinite",
        bounce8: "bounce8 0.6s steps(3) infinite",
        float: "float 3s steps(6) infinite",
        "pixel-spin": "pixelSpin 1.2s steps(8) infinite",
        "pixel-load": "pixelLoad 1.5s steps(4) infinite",
        "slide-up": "slideUp 0.3s steps(4) forwards",
        "fade-in": "fadeIn 0.4s steps(4) forwards",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        bounce8: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pixelSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pixelLoad: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
