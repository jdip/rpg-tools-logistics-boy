const moduleInfo = require('./src/module.json')
const path = require('path')

module.exports = {
  entry: './src/module.ts',
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
    filename: `${moduleInfo.name}.js`,
    path: path.resolve(__dirname, 'dist/scripts'),
    publicPath: ''
  },
  devServer: {
    static: path.join(__dirname, 'dist/scripts'),
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
  }
}
