
const fs = window.fs = require('../src');

before(function () {
  return fs.init({type: window.TEMPORARY});
});

beforeEach(function () {
  return fs.clear();
});
