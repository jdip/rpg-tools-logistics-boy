const path = require('path')

const foundryURL = 'http://localhost:30000'

module.exports = {
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'istanbul'
            ],
            presets: [
              '@babel/typescript',
              '@babel/preset-env'
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
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
  }
}
