import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FFF8EF",           // warm paper background
        cream: "#FBF0DC",        // warm cream section band
        mist: "#F7F7F5",         // very light gray footer band
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1A24",
          soft: "#525266",
          faint: "#8F90A6",
        },
        brand: {
          DEFAULT: "#1CB0F6",    // ocean blue
          shadow: "#1899D6",
        },
        mango: {
          DEFAULT: "#FF9600",
          shadow: "#CC7800",
        },
        leaf: {
          DEFAULT: "#58CC02",
          shadow: "#46A302",
        },
        cherry: {
          DEFAULT: "#FF4B4B",
          shadow: "#CC3C3C",
        },
        grape: {
          DEFAULT: "#CE82FF",
          shadow: "#A662CC",
        },
      },
      fontFamily: {
        display: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        body: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        tactile: "0 4px 0 0 var(--tw-shadow-color)",
        pop: "0 6px 0 0 var(--tw-shadow-color)",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        laser: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        bounceIn: "bounceIn 0.5s cubic-bezier(.34,1.56,.64,1)",
        wiggle: "wiggle 0.6s ease-in-out infinite",
        laser: "laser 2.2s ease-in-out infinite",
        floaty: "floaty 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
