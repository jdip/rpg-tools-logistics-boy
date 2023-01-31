const moduleInfo = require('../src/module.json')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const transformCSS = require('./postcss').transformCSS

const foundryURL = 'http://localhost:30000'

module.exports = (env) => {
  return {
    entry: {
      index: [
        './src/module.ts'
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
    devServer: {
      static: path.join(__dirname, 'dist'),
      devMiddleware: {
        writeToDisk: true
      },
      port: 4000,
      proxy: [{
        context: (pathname, _request) => {
          return !pathname.match('^/ws')
        },
        target: foundryURL,
        ws: true
      }],
      // Manually proxy paths that dev-server sees as local and returns before involving built-in proxy
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined')
        }
        middlewares.unshift({
          name: 'no-proxy-lang',
          path: '^/lang',
          middleware: async (req, res) => {
            try {
              const result = await fetch(`${foundryURL}/lang${req.path}`)
              res.set('Content-Type', 'text/json').send(await result.text())
            } catch (err) {
              res.status(502).send('<h1>Error 502</h1><HR><h2>Bad Gateway</h2>')
            }
          }
        })
        return middlewares
      }
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
