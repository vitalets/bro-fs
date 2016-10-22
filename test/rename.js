
describe('rename', function () {

  it('should rename file in the same dir', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.rename('a.txt', 'b.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
      .then(() => assert.eventually.equal(fs.readFile('b.txt'), 'abc'))
  });

  it('should move file to another dir', function () {
    return Promise.resolve()
      .then(() => fs.mkdir('b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.rename('a.txt', 'b/a.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

  it('should move and rename file to another dir', function () {
    return Promise.resolve()
      .then(() => fs.mkdir('b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.rename('a.txt', 'b/b.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
      .then(() => assert.eventually.equal(fs.readFile('b/b.txt'), 'abc'))
  });

  it('should rename dir', function () {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.writeFile('a/a.txt', 'abc'))
      .then(() => fs.rename('a', 'b'))
      .then(() => assert.eventually.notOk(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('b')))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

});
