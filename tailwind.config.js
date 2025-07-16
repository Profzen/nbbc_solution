/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6600",
        secondary: "#FFFFFF",
        accent: "#0044CC"
      }
    },
  },
  plugins: [],
}