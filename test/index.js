
const fs = window.fs = require('../src');

// include chai plugins here instead of using karma-* packages
// see: https://stackoverflow.com/questions/45089905/uncaught-referenceerror-require-is-not-defined-karma-and-webpack
chai.use(require('chai-as-promised'));
chai.use(require('chai-shallow-deep-equal'));

before(function () {
  return fs.init({type: window.TEMPORARY});
});

beforeEach(function () {
  return fs.clear();
});
