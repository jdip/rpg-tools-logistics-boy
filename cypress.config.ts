import { defineConfig } from 'cypress'
import webpackPreprocessor from '@cypress/webpack-preprocessor'
import registerCodeCoverageTasks from '@cypress/code-coverage/task'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackOptions = require('./webpack.config.js')

export default defineConfig({
  e2e: {
    // numTestsKeptInMemory: 0,
    baseUrl: 'http://localhost:4000',
    env: {
      codeCoverage: {
        exclude: 'cypress/**/*.*'
      }
    },
    setupNodeEvents (on, config) {
      // implement node event listeners here
      on('file:preprocessor', webpackPreprocessor({
        webpackOptions: webpackOptions('development')
      }))
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // require('@cypress/code-coverage/task')(on, config)
      registerCodeCoverageTasks(on, config)
      return config
    }
  }
})
