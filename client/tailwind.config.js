/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ===== Brand system =====
        // Primary: Turquoise blue — main buttons, key links, logo accents,
        // active states, important headers (~30% of UI)
        // 'blue' and 'cyan' both point here so every existing bg-blue-*,
        // text-cyan-*, border-blue-* etc. class renders as turquoise.
        blue: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0c7f9c',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0c7f9c',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Secondary: Summer green — secondary buttons, icons, highlights,
        // subtle section backgrounds, hover states, success messages (~10%)
        // 'fuchsia', 'emerald', 'violet' and 'purple' all point here so any
        // existing class using those names renders as summer green instead.
        fuchsia: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#128038',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#128038',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        violet: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#128038',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        purple: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#128038',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
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
