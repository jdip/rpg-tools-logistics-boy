console.log('WEBPACK MODE: PRODUCTION')
module.exports = {
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
}
