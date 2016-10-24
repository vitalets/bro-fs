
describe('rmdir', function () {

  it('should remove empty dir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.rmdir('a'))
      .then(() => assert.eventually.notOk(fs.exists('a')))
  });

  it('should remove non-empty dir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.writeFile('a/a.txt', 'abc'))
      .then(() => fs.rmdir('a'))
      .then(() => assert.eventually.notOk(fs.exists('a/b')))
      .then(() => assert.eventually.notOk(fs.exists('a/a.txt')))
      .then(() => assert.eventually.notOk(fs.exists('a')))
  });

  it('should remove subdir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.rmdir('a/b'))
      .then(() => assert.eventually.notOk(fs.exists('a/b')))
  });

  it('should "remove" non-existing dir', function() {
    return Promise.resolve()
      .then(() => fs.rmdir('a'))
      .then(() => assert.eventually.notOk(fs.exists('a')))
  });
});
