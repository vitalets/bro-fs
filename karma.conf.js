
const path = require('path');

const srcPath = process.env.SRC_PATH || './src';

module.exports = function (config) {
  config.set({
    browsers: [
      //'Chrome',
      //'ChromeCanary',
      //'ChromeUnlimitedStorage'
      'ChromeHeadless',
    ],
    // todo: run with sheeva in different env
    // customLaunchers: {
    //   ChromeUnlimitedStorage: {
    //     base: 'Chrome',
    //     flags: ['--unlimited-storage', '--disable-web-security']
    //   },
    //   ChromeCanaryUnlimitedStorage: {
    //     base: 'ChromeCanary',
    //     flags: ['--unlimited-storage']
    //   },
    // },
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
          'bro-fs': path.resolve(srcPath),
        }
      },
    },
    autoWatch: true,
    singleRun: false,
  });
};
