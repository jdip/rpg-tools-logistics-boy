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
  }
}
