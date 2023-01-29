console.log('WEBPACK MODE: DEVELOPMENT')
module.exports = {
  mode: 'development',
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
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: false
          }
        },
        exclude: /node_modules/
      }
    ]
  }
}
