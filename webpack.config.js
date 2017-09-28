
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

module.exports = {
  entry: './src',
  output: {
    path: path.resolve('dist'),
    filename: 'bro-fs.js',
    libraryTarget: 'umd',
    library: 'fs',
  },
  plugins: [
    new webpack.BannerPlugin(`bro-fs v${packageJson.version}`)
  ]
};
