/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef1f5',
          100: '#d4dde6',
          200: '#a9bbc9',
          300: '#7e98ac',
          400: '#537590',
          500: '#1e3a5f',
          600: '#1a3354',
          700: '#152845',
          800: '#102036',
          900: '#0a1828',
        },
        accent: {
          50: '#faf6ef',
          100: '#f0e6d3',
          200: '#e1ccb0',
          300: '#d2b288',
          400: '#c9a96e',
          500: '#b8945a',
          600: '#9a7a4c',
          700: '#7c613d',
          800: '#5e492e',
          900: '#3f311f',
        },
        warm: {
          50: '#fdfcfa',
          100: '#f8f7f4',
          200: '#f0eee8',
          300: '#e4e0d8',
          400: '#d1ccc0',
          500: '#b8b0a0',
        },
      },
      boxShadow: {
        'soft': '0 6px 24px rgba(30, 58, 95, 0.08)',
        'soft-lg': '0 10px 36px rgba(30, 58, 95, 0.10)',
        'soft-xl': '0 16px 48px rgba(30, 58, 95, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
