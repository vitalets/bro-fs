
const fs = window.fs = require('../src');

before(function () {
  return fs.init({type: window.TEMPORARY});
});

beforeEach(function () {
  return fs.clear();
});

assert.notFound = function (e) {
  const notFoundMsg = [
    'A requested file or directory could not be found',
    'at the time an operation was processed.'
  ].join(' ');
  return assert.equal(e.message, notFoundMsg);
};

