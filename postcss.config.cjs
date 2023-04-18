// eslint-disable-next-line no-undef
const path = require('path')

/* eslint-disable no-undef */
module.exports = {
  plugins: {
    tailwindcss: {
      config: path.join(__dirname, 'tailwindcss.config.cjs'),
    },
    autoprefixer: {},
  },
}
