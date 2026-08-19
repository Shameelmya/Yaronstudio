/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yaron: {
          magenta: '#C72D5C',
          purple: '#7B2B91',
          orange: '#F45B0A',
          gold: '#F5A414',
          charcoal: '#27292B',
          gray: '#8C8C8C',
          light: '#F8F9FA'
        }
      },
      backgroundImage: {
        'yaron-gradient': 'linear-gradient(to right, #C72D5C, #F45B0A)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
