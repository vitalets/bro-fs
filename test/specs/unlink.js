
describe('unlink', function () {

  it('should remove existing file by path', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.unlink('a.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
  });

  it('should remove existing file by entry', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(entry => fs.unlink(entry))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
  });

  it('should not throw for non-existing file', async () => {
    await fs.unlink('a.txt');
    assert.equal(await fs.exists('a.txt'), false);
  });

});
