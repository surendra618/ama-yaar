/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e11d48',
        },
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        script: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
