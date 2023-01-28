module.exports = {
  devtool: 'source-map',
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
              [
                '@babel/env',
                {
                  modules: false,
                  targets: {
                    chrome: '58',
                    ie: '11'
                  }
                }
              ]
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
