/**
 * PostCSS configuration.
 * PostCSS is a tool for transforming CSS with plugins.
 * Here we use it to process Tailwind CSS directives (@tailwind)
 * and add vendor prefixes automatically (autoprefixer).
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
