
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
    sl_chrome_win7: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: 'latest-2'
    },
    sl_chrome_win10: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest-1'
    },
    sl_chrome_osx10: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: 'latest'
    },
    sl_chrome_win7_beta: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: 'beta'
    },
  };

  config.set({
    sauceLabs: {
      testName: 'bro-fs',
      recordScreenshots: false,
      connectOptions: {
        port: 5757,
        // logfile: 'sauce_connect.log'
      },
      public: 'public'
    },
    // Increase timeout in case connection in CI is slow
    captureTimeout: 120000,
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    reporters: ['dots', 'saucelabs'],
    singleRun: true
  })
};
