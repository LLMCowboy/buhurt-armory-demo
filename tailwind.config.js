/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#09090b",
        surface: "#18181b",
        forge: "#ea580c",
        steel: "#f4f4f5",
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}
