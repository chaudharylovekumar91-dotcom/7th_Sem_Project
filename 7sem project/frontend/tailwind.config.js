/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',    // slate-900
          primary: '#6366f1', // indigo-500
          accent: '#8b5cf6',  // violet-500
          light: '#e0e7ff',   // indigo-100
        }
      }
    },
  },
  plugins: [],
}
