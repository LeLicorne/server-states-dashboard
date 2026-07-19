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
    },
  },
  variant: {
    extend: {
      visibility: ['responsive', 'hover', 'focus', 'hover-hover', 'hover-none'],
    },
  },
  plugins: [],
};
