const moduleInfo = require('../src/module.json')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const transformCSS = require('./postcss').transformCSS

module.exports = (env) => {
  return {
    entry: {
      index: [
        './src/main.ts'
      ]
    },
    module: {
      rules: []
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
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'assets',
            to: ''
          },
          {
            from: 'src/templates',
            to: 'templates'
          },
          {
            from: 'src/module.json',
            to: ''
          },
          {
            from: 'src/**/*.css',
            to: `styles/${moduleInfo.name}.css`,
            transformAll (assets) {
              return transformCSS(assets, { nano: true })
            }
          }
        ]
      })
    ]
  }
}
