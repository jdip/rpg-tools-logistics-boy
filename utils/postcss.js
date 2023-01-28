const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const postcssNested = require('postcss-nested')
const cssnano = require('cssnano')
const moduleInfo = require('../src/module.json')

const transformCSS = async (assets, options) => {
  const plugins = [autoprefixer, postcssNested]
  if (options.nano) plugins.push(cssnano)
  const processed = await Promise.all(
    assets.map(async (asset) => {
      const processed = await postcss(plugins)
        .process(
          `${asset.data}`,
          {
            from: asset.sourceFilename,
            to: `styles/${moduleInfo.name}.css`,
            map: options.map ?? {} /* {
              inline: true,
              annotation: true
            } */
          }
        )
      return `${processed}\n`
    })
  )
  return processed.reduce((accumulator, css) => {
    return `${accumulator}${css}\n`
  }, '')
}

module.exports = {
  transformCSS
}
