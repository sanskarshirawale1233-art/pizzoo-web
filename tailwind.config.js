/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trattoria: {
          bg: '#FAF6F0',
          dark: '#0D0700',
          dark2: '#1A0E00',
          red: '#C8102E',
          redHover: '#A00E26',
          terracotta: '#B91C1C',
          green: '#15803D',
          olive: '#3F6212',
          gold: '#F0A500',
          amber: '#D97706',
          cream: '#FFF8F0',
          wood: '#3D1F00',
          woodDark: '#1A0A00',
          card: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(240, 165, 0, 0.18)'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Oswald', 'sans-serif'],
        body: ['Lato', 'sans-serif']
      },
      boxShadow: {
        'trattoria': '0 10px 30px rgba(0, 0, 0, 0.5)',
        'gold-glow': '0 0 25px rgba(240, 165, 0, 0.35)',
        'red-glow': '0 8px 25px rgba(200, 16, 46, 0.4)'
      }
    },
  },
  plugins: [],
}
