module.exports = {
  entry: './src',
  output: {
    path: 'dist',
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'fs',
  }
};
