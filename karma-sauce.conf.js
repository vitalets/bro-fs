// Sauce platform configurator:
// https://wiki.saucelabs.com/display/DOCS/Platform+Configurator

const baseFn = require('./karma.conf');

module.exports = function (config) {
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1)
  }

  baseFn(config);

  // Browsers to run on Sauce Labs
  // Check out https://saucelabs.com/platforms for all browser/OS combos
  var customLaunchers = {
    sl_chrome_win10: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest'
    },
    sl_chrome_osx10: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'macOS 10.12',
      version: 'latest'
    },

    // below does not pass :(

    // sl_chrome_win7: {
    //   base: 'SauceLabs',
    //   browserName: 'chrome',
    //   platform: 'Windows 7',
    //   version: 'latest'
    // },

    // sl_chrome_win7_beta: {
    //   base: 'SauceLabs',
    //   browserName: 'chrome',
    //   platform: 'Windows 10',
    //   version: 'beta'
    // },
  };

  config.set({
    sauceLabs: {
      testName: 'bro-fs',
      recordScreenshots: false,
      public: 'public'
    },
    // Increase timeout in case connection in CI is slow
    captureTimeout: 120 * 1000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    reporters: ['dots', 'saucelabs'],
    singleRun: true
  })
};
