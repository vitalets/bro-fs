
describe('stat', function () {

  it('should return dir info by path', function() {
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

  it('should return dir info by entry', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(entry => fs.stat(entry))
      .then(stat => assert.shallowDeepEqual(stat, {
        isFile: false,
        isDirectory: true,
        name: 'a',
        fullPath: '/a',
        size: 0,
      }))
  });

  it('should return file info by path', function() {
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

  it('should return file info by entry', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(entry => fs.stat(entry))
      .then(stat => assert.shallowDeepEqual(stat, {
        isFile: true,
        isDirectory: false,
        name: 'a.txt',
        fullPath: '/a.txt',
        size: 3,
      }))
  });

  it('should throw error for missing entry', async () => {
    await assertThrowsAsync(() => fs.stat('a.txt'),
      'A requested file or directory could not be found at the time an operation was processed. Call: getFile(["a.txt",{"create":false}])'
    );
  });
});
