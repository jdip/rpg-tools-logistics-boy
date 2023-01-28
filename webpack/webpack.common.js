const moduleInfo = require('../src/module.json')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const transformCSS = require('./postcss').transformCSS

module.exports = (env) => {
  return {
    entry: {
      index: [
        './src/module.ts'
      ]
    },
    module: {
      rules: [

      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    output: {
      filename: `scripts/${moduleInfo.name}.js`,
      path: path.resolve(path.dirname(__dirname), 'dist'),
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
}
