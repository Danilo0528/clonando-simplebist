/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        colors: {
            surface: {
                50: '#eff1f5',
                100: '#dee2e9',
                200: '#c5cbd8',
                300: '#a7b0c3',
                400: '#8692ab',
                500: '#6d7a95',
                600: '#596480',
                700: '#485168',
                800: '#3a4255',
                900: '#313745',
            },
        },
        keyframes: {
            'fade-in-down': {
                '0%': {
                    opacity: '0',
                    transform: 'translateY(-10px)'
                },
                '100%': {
                    opacity: '1',
                    transform: 'translateY(0)'
                },
            }
        },
        animation: {
            'fade-in-down': 'fade-in-down 0.2s ease-out'
        }
    },
  },
  plugins: [],
}