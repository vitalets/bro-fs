
describe('copy', function () {

  it('should copy file in the same dir', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.copy('a.txt', 'b.txt'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
      .then(() => assert.eventually.equal(fs.readFile('b.txt'), 'abc'))
  });

  it('should copy file in the same dir by entry', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(entry => fs.copy(entry, 'b.txt'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
      .then(() => assert.eventually.equal(fs.readFile('b.txt'), 'abc'))
  });

  it('should copy file to another dir', function () {
    return Promise.resolve()
      .then(() => fs.mkdir('b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.copy('a.txt', 'b/a.txt'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

  it('should copy dir', function () {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.writeFile('a/a.txt', 'abc'))
      .then(() => fs.copy('a', 'b'))
      .then(() => assert.eventually.ok(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('b')))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

});
