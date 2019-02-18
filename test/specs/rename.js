
describe('rename', function () {

  it('should rename file in the same dir', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.rename('a.txt', 'b.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
      .then(() => assert.eventually.equal(fs.readFile('b.txt'), 'abc'))
  });

  it('should rename file in the same dir by entry', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(entry => fs.rename(entry, 'b.txt'))
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

  it('should throw error for non-existing file', async () => {
    await assertThrowsAsync(() => fs.rename('a.txt', 'b.txt'),
      'A requested file or directory could not be found at the time an operation was processed. Call: getFile(["a.txt",{"create":false}])'
    );
  });

  it('should overwrite existing file', async () => {
    await fs.writeFile('a.txt', 'abc');
    await fs.writeFile('b.txt', 'bcd');
    await fs.rename('a.txt', 'b.txt');
    assert.notOk(await fs.exists('a.txt'));
    assert.equal(await fs.readFile('b.txt'), 'abc');
  });

});
