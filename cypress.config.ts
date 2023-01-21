import { defineConfig } from "cypress";
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  e2e: {
    env: {
      codeCoverage: {
        exclude: "cypress/**/*.*",
      },
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('file:preprocessor', vitePreprocessor())
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
  },
});
