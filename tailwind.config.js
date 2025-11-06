/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#44D2C2',
        secondary: 'hsla(171, 26%, 95%, 0.9)',
        dark: '#1F1F1F',
      },
      fontFamily: {
        clash: ['"Clash Display"', 'sans-serif'],
        lato: ['"Lato"', 'sans-serif'],
      },
      boxShadow: {
        card: '0px 4px 15px 0px #0000001A',
      },
      borderRadius: {
        48: '48px',
      },
    },
  },
  variant: {
    extend: {
      visibility: ['responsive', 'hover', 'focus', 'hover-hover', 'hover-none'],
    },
  },
  plugins: [
    require('tailwindcss-touch')(),
    function ({ addUtilities }) {
      addUtilities({
        '.border-primary': {
          border: '3px solid var(--Vert-Electrique, #44D2C2)',
        },
        '.shadow-inset-primary': {
          boxShadow: 'inset 0 0 0 2px #44D2C2, 0px 4px 15px 0px #0000001A',
        },
      });
    },
  ],
};
