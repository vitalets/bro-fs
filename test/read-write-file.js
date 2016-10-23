describe('read/write/append file', function () {

  it('should write new file and read content', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(res => assert.equal(res.toString(), '[object FileEntry]'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
  });

  it('should overwrite existing file and read content', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.writeFile('a.txt', 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'def'))
  });

  it('should create needed directories and write new file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a/b/c.txt', 'abc'))
      .then(() => assert.eventually.ok(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('a/b')))
      .then(() => assert.eventually.ok(fs.exists('a/b/c.txt')))
      .then(() => assert.eventually.equal(fs.readFile('a/b/c.txt'), 'abc'))
  });

  it('should append to new file', function() {
    return Promise.resolve()
      .then(() => fs.appendFile('a.txt', 'def'))
      .then(res => assert.equal(res.toString(), '[object FileEntry]'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'def'))
  });

  it('should append to existing file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.appendFile('a.txt', 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abcdef'))
  });

  it('should reject when reading non-existing file', function() {
    return Promise.resolve()
      .then(() => fs.readFile('a.txt'))
      .catch(e => assert.notFound(e))
  });
});
