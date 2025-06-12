/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
        primary: {
          50: '#eef0fc',
          100: '#dde0f9',
          200: '#bbc2f3',
          300: '#98a4ed',
          400: '#7686e7',
          500: '#5164e1', // Primary color
          600: '#4150b4',
          700: '#313c87',
          800: '#20285a',
          900: '#10142d',
        },
        secondary: {
          50: '#f1f9fe',
          100: '#e3f3fd',
          200: '#c7e7fb',
          300: '#a7d1f1', // Secondary color
          400: '#80b7e3',
          500: '#5a9dd5',
          600: '#487eaa',
          700: '#365e80',
          800: '#243f55',
          900: '#121f2a',
        },
        success: {
          500: '#10b981',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
        light: {
          bg: '#FCFCFC',
          card: '#F8F8F8',
          border: '#dfdfdf',
          text: {
            primary: '#111827',
            secondary: '#4B5563',
          },
        },
        dark: {
          bg: '#121212',
          card: '#171717',
          border: '#2e2e2e',
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
          },
        },
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rainbow: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
        'gradient-move': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        rainbow: "rainbow var(--speed, 2s) infinite linear",
        'gradient-move': 'gradient-move 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};