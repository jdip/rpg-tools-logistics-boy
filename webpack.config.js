const moduleInfo = require('./src/module.json')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const postcssNested = require('postcss-nested')
const cssnano = require('cssnano')

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
  entry: {
    index: [
      './src/module.ts'
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: `scripts/${moduleInfo.name}.js`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    clean: true
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    devMiddleware: {
      writeToDisk: true
    },
    port: 4000,
    proxy: {
      // '/modules/rpg-tools-logistics-boy': './dist',
      context: (pathname, _request) => {
        return !pathname.match('^/ws')
      },
      target: 'http://localhost:30000',
      ws: true
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '' },
        { from: 'src/templates', to: 'templates' },
        { from: 'src/module.json', to: '' },
        {
          from: 'src/**/*.css',
          to: `styles/${moduleInfo.name}.css`,
          transformAll (assets) {
            return transformCSS(
              assets,
              {
                nano: true /*,
                map: {
                  inline: true,
                  annotation: true
                } */
              }
            )
          }
        }
      ]
    })
  ]
}
