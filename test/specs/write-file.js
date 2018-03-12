describe('write file', function () {

  it('should return FileEntry', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(res => assert.equal(res.toString(), '[object FileEntry]'))
  });

  it('should write string', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt'))
      .then(res => assert.equal(res, 'abc'))
  });

  it('should write array buffer', function() {
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
  it('should write binary string', function() {
    const canvas = document.createElement('canvas');
    return Promise.resolve()
      .then(() => new Promise(resolve => canvas.toBlob(resolve)))
      .then(blob => fs.writeFile('a.txt', blob))
      .then(() => fs.readFile('a.txt', {type: 'BinaryString'}))
      .then(res => assert.ok(res));
  });

  it('should overwrite existing file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.writeFile('a.txt', 'd'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'd'))
  });

  it('should create needed directories', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a/b/c.txt', 'abc'))
      .then(() => assert.eventually.ok(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('a/b')))
      .then(() => assert.eventually.ok(fs.exists('a/b/c.txt')))
      .then(() => assert.eventually.equal(fs.readFile('a/b/c.txt'), 'abc'))
  });

  it('should create files in parallel in the same directory', function() {
    return Promise.resolve()
      .then(() => {
        return Promise.all([
          fs.writeFile('a/file1.txt', 'abc'),
          fs.writeFile('a/file2.txt', 'def'),
        ]);
      })
      .then(() => assert.eventually.ok(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('a/file1.txt')))
      .then(() => assert.eventually.equal(fs.readFile('a/file1.txt'), 'abc'))
      .then(() => assert.eventually.ok(fs.exists('a/file2.txt')))
      .then(() => assert.eventually.equal(fs.readFile('a/file2.txt'), 'def'))
  });

});
