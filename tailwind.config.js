/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "#6366F1", light: "#818CF8", dark: "#4F46E5" },
        dark: {
          bg: "#0f0f0f",
          surface: "#1a1a1a",
          border: "#2d2d2d",
          text: "#e5e5e5",
        },
      },
      boxShadow: { glow: "0 0 20px rgba(99,102,241,0.28)" },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
        "gradient-dark": "linear-gradient(to bottom right, rgba(17,17,17,1), rgba(30,30,30,1))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
