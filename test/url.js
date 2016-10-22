describe('url', function () {

  it('should return url for file', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.getUrl('a.txt'))
      .then(url => {
        assert.match(url, /^filesystem:http:/);
        assert.match(url, /\/persistent\/a\.txt$/);
      })
  });

  it('should return url for dir', function() {
    return Promise.resolve()
      .then(() => fs.mkdir('a/b'))
      .then(() => fs.getUrl('a/b'))
      .then(url => {
        assert.match(url, /^filesystem:http:/);
        assert.match(url, /\/persistent\/a\/b$/);
      })
  });

  it('should return url for root', function() {
    return Promise.resolve()
      .then(() => fs.getUrl())
      .then(url => {
        assert.match(url, /^filesystem:http:/);
        assert.match(url, /\/persistent\/$/);
      })
  });

});
