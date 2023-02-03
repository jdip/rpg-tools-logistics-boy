import { defineConfig } from 'cypress'
import webpackPreprocessor from '@cypress/webpack-preprocessor'
import registerCodeCoverageTasks from '@cypress/code-coverage/task'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackOptions = require('./webpack.config.js')

export default defineConfig({
  e2e: {
    // numTestsKeptInMemory: 0,
    viewportWidth: 1920,
    viewportHeight: 1080,
    baseUrl: 'http://localhost:4000',
    env: {
      codeCoverage: {
        exclude: 'cypress/**/*.*'
      }
    },
    setupNodeEvents (on, config) {
      on('file:preprocessor', webpackPreprocessor({
        webpackOptions: webpackOptions('development')
      }))
      registerCodeCoverageTasks(on, config)
      return config
    }
  }
})
