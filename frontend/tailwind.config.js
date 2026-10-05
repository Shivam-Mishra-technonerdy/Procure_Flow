/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#172B4D',
          900: '#172B4D',
          800: '#1E3863',
          700: '#25457A',
          950: '#0F1D35',
        },
        pblue: {
          DEFAULT: '#2563A6',
          hover: '#1E528B',
          soft: '#EAF2FA',
        },
        ivory: {
          DEFAULT: '#FFFFFF',
          canvas: '#FFFFFF',
          surface: '#FFFFFF',
          muted: '#F8F9FA',
        },
        charcoal: {
          DEFAULT: '#263238',
          text: '#263238',
          muted: '#667085',
        },
        slateGray: {
          DEFAULT: '#667085',
          text: '#667085',
          light: '#8893A7',
        },
        borderGray: {
          DEFAULT: '#E2E5E9',
          light: '#ECEEF1',
        },
        sage: {
          DEFAULT: '#3F7D5A',
          text: '#2F6144',
          bg: '#EDF5F0',
          border: '#C2E2CE',
        },
        amberGold: {
          DEFAULT: '#B9852C',
          text: '#8F651C',
          bg: '#FCF7ED',
          border: '#F3DCAC',
        },
        crimson: {
          DEFAULT: '#B84C4C',
          text: '#933737',
          bg: '#FDF2F2',
          border: '#F5C4C4',
        },
      }
    },
  },
  plugins: [],
}
