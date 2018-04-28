describe('usage', function () {

  it('should return empty usage for empty fs', function() {
    return Promise.resolve()
      .then(() => fs.usage())
      .then(res => {
        assert.equal(res.usedBytes, 0);
        assert.isAbove(res.grantedBytes, 0);
      });
  });

  it('should return non-empty usage for non-empty fs', function() {
    return Promise.resolve()
      .then(() => fs.writeFile('a.txt', 'abc'))
      .then(() => fs.usage())
      .then(res => {
        assert.equal(res.usedBytes, 159);
        assert.isAbove(res.grantedBytes, 0);
      });
  });

});
