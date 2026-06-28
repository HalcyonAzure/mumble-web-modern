/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mumble: {
          bg: '#1a1d24',
          bg2: '#22262e',
          bg3: '#2d3139',
          accent: '#58a6a6',
          text: '#e4e6e8',
          text2: '#8b929d',
          border: '#363a42',
          hover: '#2f333c',
        }
      }
    },
  },
  plugins: [],
}
