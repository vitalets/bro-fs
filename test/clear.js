
describe('clear', function () {

  it('should clear whole fs', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.mkdir('c'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.writeFile('c/a.txt', 'abc'))
      .then(() => fs.clear())
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 0))
      .then(() => assert.eventually.notOk(fs.exists('a')))
      .then(() => assert.eventually.notOk(fs.exists('c')))
  });

});
