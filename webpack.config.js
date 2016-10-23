module.exports = {
  entry: './src',
  output: {
    path: 'dist',
    filename: 'bro-fs.js',
    libraryTarget: 'umd',
    library: 'fs',
  }
};
