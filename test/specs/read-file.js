describe('read file', function () {

  it('should read as string', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt'))
      .then(res => assert.equal(res, 'abc'))
  });

  it('should read as array buffer', function() {
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
  it('should read as binary string', function() {
    const canvas = document.createElement('canvas');
    return Promise.resolve()
      .then(() => new Promise(resolve => canvas.toBlob(resolve)))
      .then(blob => fs.writeFile('a.txt', blob))
      .then(() => fs.readFile('a.txt', {type: 'BinaryString'}))
      .then(res => assert.ok(res));
  });

  it('should read as data url', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt', {type: 'DataURL'}))
      .then(res => assert.equal(res, 'data:text/plain;base64,YWJj'));
  });

  it('should read as blob', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt', {type: 'Blob'}))
      .then(blob => new Response(blob).text())
      .then(res => assert.equal(res, 'abc'));
  });

  it('should read as mutable file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readFile('a.txt', {type: 'MutableFile'}))
      .then(file => new Response(file).text())
      .then(res => assert.equal(res, 'abc'));
  });

  it('should reject on non-existing file', function() {
    return Promise.resolve()
      .then(() => fs.readFile('a.txt'))
      .catch(e => {
        assert.equal(e.name, 'NotFoundError');
        assert.include(e.message, 'a.txt');
        assert.include(e.stack, 'a.txt');
      })
  });

  it('should read from entry', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(entry => fs.readFile(entry))
      .then(res => assert.equal(res, 'abc'))
  });
});
