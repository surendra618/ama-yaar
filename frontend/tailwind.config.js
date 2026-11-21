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
        sans: ['"Red Hat Text"', '"Red Hat Display"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Red Hat Display"', '"Red Hat Text"', '"Boldonse"', 'sans-serif'],
        boldonse: ['"Boldonse"', 'sans-serif'],
        redhat: ['"Red Hat Text"', '"Red Hat Display"', 'sans-serif'],
        script: ['"Pinyon Script"', 'cursive'],
        pinyon: ['"Pinyon Script"', 'cursive'],
      },
    },
  },
  plugins: [],
};
