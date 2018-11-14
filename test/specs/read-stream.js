describe('read stream', function () {

  it('should read as stream', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => new Response(fs.createReadStream('a.txt')).text())
      .then(res => assert.equal(res, 'abc'))
  });

  it('should reject on non-existing file', function () {
    return Promise.resolve()
      .then(() => fs.createReadStream('a.txt'))
      .catch(e => {
        assert.equal(e.name, 'NotFoundError');
        assert.include(e.message, 'a.txt');
        assert.include(e.stack, 'a.txt');
      })
  });

  it('should read from entry', function () {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => new Response(fs.createReadStream('a.txt')).text())
      .then(res => assert.equal(res, 'abc'))
  });
});
