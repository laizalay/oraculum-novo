/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bb-blue': '#1F3864',
        'bb-yellow': '#F5C518',
      }
    },
  },
  plugins: [],
}

