describe('write file', function () {

  it('should return FileEntry', async function() {
    const res = await fs.writeFile('a.txt', 'abc');
    assert.equal(res.toString(), '[object FileEntry]');
  });

  it('should write string', async function() {
    await fs.writeFile('a.txt', 'abc');
    const res = await fs.readFile('a.txt');
    assert.equal(res, 'abc');
  });

  it('should write array buffer', async function() {
    const data = new Int32Array([42, 24]);
    await fs.writeFile('a.txt', data.buffer);
    const res = await fs.readFile('a.txt', {type: 'ArrayBuffer'});
    const arr = new Int32Array(res);
    assert.lengthOf(arr, 2);
    assert.equal(arr[0], 42);
    assert.equal(arr[1], 24);
  });

  // from: https://developer.mozilla.org/ru/docs/Web/API/FileReader/readAsBinaryString
  it('should write binary string', async function() {
    const canvas = document.createElement('canvas');
    const blob = await new Promise(resolve => canvas.toBlob(resolve));
    await fs.writeFile('a.txt', blob);
    const res = fs.readFile('a.txt', {type: 'BinaryString'});
    assert.ok(res);
  });

  it('should overwrite existing file', async function() {
    await fs.writeFile('a.txt', 'abc');
    await fs.writeFile('a.txt', 'd');
    assert.equal(await fs.readFile('a.txt'), 'd');
  });

  it('should create needed directories', async function() {
    await fs.writeFile('a/b/c.txt', 'abc');
    assert.ok(await fs.exists('a'));
    assert.ok(await fs.exists('a/b'));
    assert.ok(await fs.exists('a/b/c.txt'));
    assert.equal(await fs.readFile('a/b/c.txt'), 'abc');
  });

  it('should create files in parallel in the same directory', async function() {
    await Promise.all([
      fs.writeFile('a/file1.txt', 'abc'),
      fs.writeFile('a/file2.txt', 'def'),
    ]);
    assert.ok(await fs.exists('a'));
    assert.ok(await fs.exists('a/file1.txt'));
    assert.equal(await fs.readFile('a/file1.txt'), 'abc');
    assert.ok(await fs.exists('a/file2.txt'));
    assert.equal(await fs.readFile('a/file2.txt'), 'def');
  });

});
