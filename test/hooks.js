
before(function () {
  return fs.init({type: window.TEMPORARY});
});

beforeEach(function () {
  return fs.clear();
});
