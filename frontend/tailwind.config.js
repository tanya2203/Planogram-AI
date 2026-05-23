/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        sidebar: '#0F172A',
        'page-bg': '#F1F5F9',
        'accent-blue': '#3B82F6',
        'accent-purple': '#7C3AED',
      },
    },
  },
  plugins: [],
}