/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Manrope', 'ui-sans-serif', 'system-ui'],
        'montserrat': ['Manrope', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'h1': ['21px', { lineHeight: '1.5', fontWeight: '500' }],
        'h2': ['17.5px', { lineHeight: '1.5', fontWeight: '500' }],
        'h3': ['15.75px', { lineHeight: '1.5', fontWeight: '500' }],
        'base': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'button': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
      },
              colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          peach: {
            50: '#fef7f0',
            100: '#fdeee0',
            200: '#fbd4b5',
            300: '#f9ba8a',
            400: '#f7a05f',
            500: '#f58634',
            600: '#e06b1a',
            700: '#b85415',
            800: '#903d10',
            900: '#68260b',
          },
          accent: '#F88C50',
          'cta-green': '#5EB47C',
          'cta-green-hover': '#4A9A64',
          'bg-testimonials': '#F7F7F7',
          'bg-highlight': '#E5F4F1',
        },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}