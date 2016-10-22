
const fs = require('../src');

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

  it('stat (dir)', function() {
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

  it('stat (missing)', function() {
    return Promise.resolve()
      .then(() => fs.stat('a.txt'))
      .should.be.rejected.and.eventually.have.property(
        'message',
        'A requested file or directory could not be found at the time an operation was processed.'
      )
  });

  it('exists (file)', function() {
    return Promise.resolve()
      .then(() => assert.eventually.notOk(fs.exists('a.txt')))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => assert.eventually.ok(fs.exists('a.txt')))
  });

  it('exists (dir)', function() {
    return Promise.resolve()
      .then(() => assert.eventually.notOk(fs.exists('a')))
      .then(() => fs.mkdir('a'))
      .then(() => assert.eventually.ok(fs.exists('a')))
  });

  it('rename (file in the same dir)', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.rename('a.txt', 'b.txt'))
      .then(() => assert.eventually.equal(fs.readFile('b.txt'), 'abc'))
  });

  it('rename (move to another dir)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.rename('a.txt', 'b/a.txt'))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

  it('rename (dir)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.rename('a', 'b'))
      .then(() => assert.eventually.notOk(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('b')))
  });

  it('copy (file in the same dir)', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.copy('a.txt', 'b.txt'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
      .then(() => assert.eventually.equal(fs.readFile('b.txt'), 'abc'))
  });

  it('copy (move to another dir)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.copy('a.txt', 'b/a.txt'))
      .then(() => assert.eventually.equal(fs.readFile('a.txt'), 'abc'))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

  it('copy (dir)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a'))
      .then(() => fs.writeFile('a/a.txt', 'abc'))
      .then(() => fs.copy('a', 'b'))
      .then(() => assert.eventually.ok(fs.exists('a')))
      .then(() => assert.eventually.ok(fs.exists('b')))
      .then(() => assert.eventually.equal(fs.readFile('b/a.txt'), 'abc'))
  });

});

