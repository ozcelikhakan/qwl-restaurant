/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'owl-primary': '#c8a96e',
        'owl-dark': '#1a1a1a',
        'owl-text': '#777777',
        'owl-light': '#f8f5f0',
        'owl-primary-dark': '#b8944e',
      },
      fontFamily: {
        'heading': ['"Playfair Display"', 'serif'],
        'body': ['Roboto', 'sans-serif'],
        'cursive': ['"Herr Von Muellerhoff"', 'cursive'],
      },
    },
  },
  plugins: [],
}

