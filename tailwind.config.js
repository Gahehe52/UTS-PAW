/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'crypto-yellow': '#FCD34D',
        'crypto-dark': '#1A202C',
        'crypto-light': '#FFFFFF',
      }
    },
  },
  plugins: [],
}
