
describe('exists', function () {

  it('should return true for existing file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => assert.eventually.ok(fs.exists('a.txt')))
  });

  it('should return false for non-existing file', function() {
    return Promise.resolve()
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
      .then(() => assert.eventually.notOk(fs.exists('b/a.txt')))
  });

  it('should return true for existing dir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => assert.eventually.ok(fs.exists('a')))
  });

  it('should return false for non-existing dir', function() {
    return Promise.resolve()
      .then(() => assert.eventually.notOk(fs.exists('a')))
      .then(() => assert.eventually.notOk(fs.exists('a/b')))
  });

});
