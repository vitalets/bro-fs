
describe('unlink', function () {

  it('should remove existing file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.unlink('a.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
  });

  it('should "reject" non-existing file', function() {
    return Promise.resolve()
      .then(() => fs.unlink('a.txt'))
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
  });

});
