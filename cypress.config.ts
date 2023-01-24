import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:30001',
    env: {
      codeCoverage: {
        exclude: 'cypress/**/*.*'
      }
    },
    setupNodeEvents (on, config) {
      // implement node event listeners here
      on('file:preprocessor', vitePreprocessor())
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('@cypress/code-coverage/task')(on, config)
      return config
    }
  }
})
