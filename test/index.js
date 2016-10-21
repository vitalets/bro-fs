
const fs = require('../src');

chai.config.truncateThreshold = 0;

describe('fs', function () {

  before(function () {
    return fs.init({requestQuota: false});
  });

  beforeEach(function () {
    return fs.clear();
  });

  it('clear', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 2))
      .then(() => fs.clear())
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 0))
  });

  it('writeFile / readFile', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 1))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
  });

  it('overwrite file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.writeFile('a.txt', 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'def'))
  });

  it('appendFile (new)', function() {
    return Promise.resolve()
      .then(() => fs.appendFile('a.txt', 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'def'))
  });

  it('appendFile (existing)', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.appendFile('a.txt', 'def'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abcdef'))
  });

  it('unlink', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.unlink('a.txt'))
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 0))
  });

  it('readdir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.mkdir('c'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readdir('/'))
      .then(entries => {
        assert.lengthOf(entries, 3);
        assert.equal(entries[0].name, 'c');
        assert.equal(entries[1].name, 'a.txt');
        assert.equal(entries[2].name, 'a');
      });
  });

  it('readdir (subdir)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.writeFile('a/a.txt', 'abc'))
      .then(() => fs.readdir('a'))
      .then(entries => {
        assert.lengthOf(entries, 2);
        assert.equal(entries[0].name, 'b');
        assert.equal(entries[1].name, 'a.txt');
      });
  });

  it('rmdir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.rmdir('a'))
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 0))
  });

  it('rmdir (subdir)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => assert.eventually.lengthOf(fs.readdir('a'), 1))
      .then(() => fs.rmdir('a/b'))
      .then(() => assert.eventually.lengthOf(fs.readdir('a'), 0))
  });

  it('rmdir (recursive)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.rmdir('a'))
      .then(() => assert.eventually.lengthOf(fs.readdir('/'), 0))
  });

  it('stat (directory)', function() {
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

  it('stat (file)', function() {
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

});

