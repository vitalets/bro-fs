
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

module.exports = {
  entry: './src',
  output: {
    path: path.resolve('dist'),
    filename: `bro-fs${process.env.NODE_ENV === 'production' ? '.min' : ''}.js`,
    libraryTarget: 'umd',
    library: 'fs',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(`bro-fs v${packageJson.version}`)
  ]
};
