
describe('stat', function () {

  it('should return dir info', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.stat('a'))
      .then(stat => assert.shallowDeepEqual(stat, {
        isFile: false,
        isDirectory: true,
        name: 'a',
        fullPath: '/a',
        size: 0,
      }))
  });

  it('should return file info', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.stat('a.txt'))
      .then(stat => assert.shallowDeepEqual(stat, {
        isFile: true,
        isDirectory: false,
        name: 'a.txt',
        fullPath: '/a.txt',
        size: 3,
      }))
  });

  it('should reject for missing entry', function() {
    return Promise.resolve()
      .then(() => fs.stat('a.txt'))
      .catch(e => assert.notFound(e))
  });

});
