
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

const outDir = process.env.RUNTYPER ? 'dist-runtyper' : 'dist';
const outFile = `bro-fs${process.env.NODE_ENV === 'production' ? '.min' : ''}.js`;

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src',
  output: {
    path: path.resolve(outDir),
    filename: outFile,
    libraryTarget: 'umd',
    library: 'fs',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: process.env.RUNTYPER ? [
              ['babel-plugin-runtyper', {
                warnLevel: 'break',
                implicitEqualUndefined: 'allow',
              }]
            ] : []
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(`bro-fs v${packageJson.version}`)
  ]
};
