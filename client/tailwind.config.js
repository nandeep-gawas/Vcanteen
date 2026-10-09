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
        brand: {
          orange: '#F97316',
          orangeDark: '#EA580C',
          orangeLight: '#FFF7ED',
          green: '#10B981',
          greenDark: '#059669',
          greenLight: '#ECFDF5'
        }
      }
    },
  },
  plugins: [],
}
