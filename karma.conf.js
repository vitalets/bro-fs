
const path = require('path');

module.exports = function (config) {
  config.set({
    browsers: [
      'Chrome',
      'ChromeCanary'
    ],
    // todo: run with sheeva in different env
    /*
    customLaunchers: {
      ChromeUnlimitedStorage: {
        base: 'Chrome',
        flags: ['--unlimited-storage']
      },
      ChromeCanaryUnlimitedStorage: {
        base: 'ChromeCanary',
        flags: ['--unlimited-storage']
      },
    },
    */
    frameworks: ['mocha'],
    files: [
      'test/setup.js',
      'test/hooks.js',
      'test/specs/**',
    ],
    preprocessors: {
      'test/**': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        alias: {
          'bro-fs': path.resolve(process.env.TEST_DIR || './src'),
        }
      },
    },
    autoWatch: true,
    singleRun: false,
  });
};
