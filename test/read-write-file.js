describe('read/write/append file', function () {

  it('should write data and return FileEntry', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(res => assert.equal(res.toString(), '[object FileEntry]'))
  });

  it('should write and read as string', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt'))
      .then(res => assert.equal(res, 'abc'))
  });

  // todo truncate write 'abc', then write 'b'!

  it('should write and read as array buffer', function() {
    const data = new Int32Array([42, 24]);
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', data.buffer))
      .then(() => fs.readFile('a.txt', {type: 'ArrayBuffer'}))
      .then(res => {
        const arr = new Int32Array(res);
        assert.lengthOf(arr, 2);
        assert.equal(arr[0], 42);
        assert.equal(arr[1], 24);
      })
  });

  // from: https://developer.mozilla.org/ru/docs/Web/API/FileReader/readAsBinaryString
  it('should write and read as binary string', function() {
    const canvas = document.createElement('canvas');
    return Promise.resolve()
      .then(() => new Promise(resolve => canvas.toBlob(resolve)))
      .then(blob => fs.writeFile('a.txt', blob))
      .then(() => fs.readFile('a.txt', {type: 'BinaryString'}))
      .then(res => assert.ok(res));
  });

  it('should write and read as data url', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt', {type: 'DataURL'}))
      .then(res => assert.equal(res, 'data:text/plain;base64,YWJj'));
  });

  it('should overwrite existing file and read content', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.writeFile('a.txt', 'd'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'd'))
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
      .catch(e => {
        assert.equal(e.name, 'NotFoundError');
        assert.include(e.message, 'a.txt');
        assert.include(e.stack, 'a.txt');
        assert.include(e.stack, 'getChildFile');
      })
  });
});
