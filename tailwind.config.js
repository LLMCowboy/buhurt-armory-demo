/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505", // True Midnight Luxe background
        surface: "#111111", // Inner core background
        forge: "#ea580c",
        steel: "#EAEAEA", // Champagne / Steel text
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        display: ['Clash Display', 'sans-serif'],
      },
      borderRadius: {
        'bezel-outer': '2rem',
        'bezel-inner': '1.625rem', // 2rem - 0.375rem (6px gap)
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      }
    },
  },
  plugins: [],
}
