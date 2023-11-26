/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
       
        'galaxy': "url('../src/assets/1x/background-20.jpg')",
        'background': "url('../src/assets/SVG/background.svg')",
      }
    }
  },
  plugins: [],
}

