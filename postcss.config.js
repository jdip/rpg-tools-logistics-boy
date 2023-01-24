module.exports = (ctx) => ({
  map: ctx.options.map,
  parser: ctx.options.parser,
  plugins: {
    'postcss-nested': {},
    cssnano: ctx.env === 'production' ? {} : false
  }
})
