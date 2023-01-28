const { merge } = require('webpack-merge')
const common = require('./webpack/webpack.common')
const envs = {
  development: 'dev',
  production: 'prod'
}
const env = envs[process.env.NODE_ENV || 'development']
console.log('ENV', process.env.NODE_ENV)
const envConfig = require(`./webpack/webpack.${env}.js`)
module.exports = (env) => merge(common(env), envConfig)
