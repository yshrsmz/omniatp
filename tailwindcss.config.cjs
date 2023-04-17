/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/options.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
