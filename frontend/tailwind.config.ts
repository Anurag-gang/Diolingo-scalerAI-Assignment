import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dio: {
          green: "#58CC02",
          greenDark: "#46A302",
          sky: "#1CB0F6",
          skyDark: "#1899D6",
          gold: "#FFC800",
          goldDark: "#E5B400",
          coral: "#FF4B4B",
          coralDark: "#EA2B2B",
          purple: "#CE82FF",
          purpleDark: "#A560E8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        grotesk: ["var(--font-grotesk)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
