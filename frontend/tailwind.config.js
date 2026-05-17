/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a4f3a',
        'primary-light': '#2d7a5a',
        'primary-bg': '#e8f5ee',
        accent: '#e8a020',
        'accent-bg': '#fff8e6',
        danger: '#c94040',
        'danger-bg': '#fef0f0',
        info: '#2060c0',
        'info-bg': '#eaf0fc',
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
