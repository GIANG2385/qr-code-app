/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hsb: {
          blue: '#003087',
          red: '#C8102E',
        },
      },
    },
  },
  plugins: [],
};
