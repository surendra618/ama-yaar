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
        sans: ['"Red Hat Display"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Boldonse"', '"Red Hat Display"', 'sans-serif'],
        boldonse: ['"Boldonse"', 'sans-serif'],
        redhat: ['"Red Hat Display"', 'sans-serif'],
        script: ['"Pinyon Script"', 'cursive'],
        pinyon: ['"Pinyon Script"', 'cursive'],
      },
    },
  },
  plugins: [],
};
