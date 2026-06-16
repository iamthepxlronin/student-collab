/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./frontend/**/*.{html,js}"],

  theme: {
    extend: {
      colors: {
        ink: "#1a1a2e",
        paper: "#f8f8fa",
        coral: "#e8833a",
        cream: "#f5f0e8",
        amber: "#f5a623",
        sage: "#7aab8a",
        edge: "#e0dbd0",
        muted: "#6b6b7b",
      },

      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
      },
    },
  },

  plugins: [],
};