// postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},    // <-- use this, not @tailwindcss/postcss
    autoprefixer: {},
  },
};