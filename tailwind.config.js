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
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b7cfff',
          300: '#86aeff',
          400: '#5a8af7',
          500: '#3a6bf3',
          600: '#315ad6',
          700: '#2749b5',
          800: '#203b92',
          900: '#172b6a',
        },
        accent: {
          50: '#eefaff',
          100: '#d9f2ff',
          200: '#b9e7ff',
          300: '#82d2fb',
          400: '#4aabf4',
          500: '#3c9fdb',
          600: '#2e82bc',
          700: '#276a9a',
          800: '#245778',
          900: '#214962',
        },
        warm: {
          50: '#ffffff',
          100: '#f7f9fc',
          200: '#edf1f7',
          300: '#e3e9f2',
          400: '#cbd5e3',
          500: '#a8b4c5',
        },
      },
      boxShadow: {
        'soft': '0 4px 18px rgba(58, 107, 243, 0.06)',
        'soft-lg': '0 10px 32px rgba(58, 107, 243, 0.10)',
        'soft-xl': '0 16px 48px rgba(15, 23, 42, 0.16)',
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
