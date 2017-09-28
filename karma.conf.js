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
    frameworks: ['mocha', 'chai'],
    files: ['test/**'],
    preprocessors: {
      'test/**': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: 'inline-source-map'
    },
    autoWatch: true,
    singleRun: false,
  });
};
