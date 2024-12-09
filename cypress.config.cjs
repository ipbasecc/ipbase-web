require('dotenv').config();
const registerCodeCoverageTasks = require('@cypress/code-coverage/task');
const { injectQuasarDevServerConfig } = require('@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  video: true,
  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      return config;
    },
    baseUrl: 'http://localhost:9000/',
    supportFile: 'test/cypress/support/e2e.js',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    env: {
      codeCoverage: true,
      E2E_USERNAME: process.env.E2E_USERNAME,
      E2E_PASSWORD: process.env.E2E_PASSWORD,
    },
  },
  component: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
    supportFile: 'test/cypress/support/component.js',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'test/cypress/support/component-index.html',
    devServer: injectQuasarDevServerConfig(),
  },
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  retries: {
    runMode: 2,
    openMode: 0
  },
  videoCompression: 32,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true
});
