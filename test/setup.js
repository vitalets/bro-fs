
window.fs = require('bro-fs');
const chai = require('chai');

// include chai plugins here instead of using karma-* packages
// see: https://stackoverflow.com/questions/45089905/uncaught-referenceerror-require-is-not-defined-karma-and-webpack
chai.use(require('chai-as-promised'));
chai.use(require('chai-shallow-deep-equal'));

window.assert = chai.assert;
window.assertThrowsAsync = async (fn, regExp) => {
  let f = () => {};
  try {
    await fn();
  } catch(e) {
    f = () => {throw e};
  } finally {
    assert.throws(f, regExp);
  }
};
