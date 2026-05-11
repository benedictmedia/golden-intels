/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a3c6e",
          light: "#2a5298",
          gold: "#d4a017",
          goldLight: "#f0c040",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      keyframes: {
        slowZoom: {
          '0%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1.2)' },
        },
      },
      animation: {
        slowZoom: 'slowZoom 15s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}