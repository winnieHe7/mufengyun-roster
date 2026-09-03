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
          50: '#E6F1FB',
          100: '#B5D4F4',
          200: '#85B7EB',
          300: '#5A9ADB',
          400: '#378ADD',
          500: '#185FA5',
          600: '#15558F',
          700: '#0C447C',
          800: '#08365F',
          900: '#042C53',
        },
        accent: {
          50: '#FAEEDA',
          100: '#FAC775',
          200: '#E8AE55',
          300: '#D89532',
          400: '#BA7517',
          500: '#A36313',
          600: '#854F0B',
          700: '#74400A',
          800: '#633806',
          900: '#4A2904',
        },
        warm: {
          50: '#F8FAFC',
          100: '#F5F7FA',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
        },
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(17, 24, 39, 0.05)',
        'soft-lg': '0 8px 24px rgba(17, 24, 39, 0.08)',
        'soft-xl': '0 16px 40px rgba(17, 24, 39, 0.12)',
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
