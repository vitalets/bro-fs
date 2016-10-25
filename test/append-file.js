describe('append file', function () {

  it('should return FileEntry', function() {
    return Promise.resolve()
      .then(() => fs.appendFile('a.txt', 'abc'))
      .then(res => assert.equal(res.toString(), '[object FileEntry]'))
  });

  it('should append to new file', function() {
    return Promise.resolve()
      .then(() => fs.appendFile('a.txt', 'def'))
      .then(res => assert.equal(res.toString(), '[object FileEntry]'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'def'))
  });

  it('should append string to existing file by path', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.appendFile('a.txt', 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abcdef'))
  });

  it('should append string to existing file by entry', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(entry => fs.appendFile(entry, 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abcdef'))
  });

  it('should append array buffer', function() {
    const data = new Int32Array([42, 24]);
    const data2 = new Int32Array([18]);
    return Promise.resolve()
      .then(() => fs.appendFile('a.txt', data.buffer))
      .then(() => fs.appendFile('a.txt', data2.buffer))
      .then(() => fs.readFile('a.txt', {type: 'ArrayBuffer'}))
      .then(res => {
        const arr = new Int32Array(res);
        assert.lengthOf(arr, 3);
        assert.equal(arr[0], 42);
        assert.equal(arr[1], 24);
        assert.equal(arr[2], 18);
      })
  });
});
