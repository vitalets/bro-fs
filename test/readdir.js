
describe('readdir', function () {

  it('should return array of dir entries (root)', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('c'))
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.readdir('/'))
      .then(entries => assert.shallowDeepEqual(entries, [
        {name: 'c'},
        {name: 'a.txt'},
        {name: 'a'},
      ]));
  });

  it('should return array of dir entries (subdir)', function() {
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

  it('should return empty array for empty dir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.readdir('a/b'))
      .then(entries => assert.lengthOf(entries, 0));
  });

  it('should reject for non-existing dir', function() {
    return Promise.resolve()
      .then(() => fs.readdir('a'))
      .catch(e => assert.notFound(e))
  });

  it('should return all entries with deep option', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('c'))
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.writeFile('a/b/c.txt', 'abc'))
      .then(() => fs.readdir('/', {deep: true}))
      .then(entries => assert.shallowDeepEqual(entries, [
        {name: 'c', children: []},
        {name: 'a.txt'},
        {name: 'a', children: [
          {name: 'b', children: [
            {name: 'c.txt'},
          ]},
        ]},
      ]));
  });

});
