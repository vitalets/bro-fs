
describe('mkdir', function () {

  it('should create dir', async () => {
    await fs.mkdir('a');
    assert.ok(await fs.exists('a'));
  });

  it('should not fail when creating existing dir', async () => {
    await fs.mkdir('a');
    await fs.writeFile('a/file.txt', 'abc');
    await fs.mkdir('a');
    assert.ok(await fs.exists('a'));
    assert.ok(await fs.exists('a/file.txt'));
  });

  it('should fail when creating dir over file', async () => {
    await fs.writeFile('a', 'abc');
    await assertThrowsAsync(() => fs.mkdir('a'),
      'The path supplied exists, but was not an entry of requested type. Call: getDirectory(["a",{"create":false}])'
    );
  });

  it('should create dir and subdir', async () => {
    await fs.mkdir('a/b');
    assert.ok(await fs.exists('a/b'));
  });

  it('should not clear dir when creating subdirs', async () => {
    await fs.mkdir('a/b');
    await fs.writeFile('a/file.txt', 'abc');
    await fs.mkdir('a/c');
    assert.ok(await fs.exists('a/b'));
    assert.ok(await fs.exists('a/file.txt'));
    assert.ok(await fs.exists('a/c'));
  });
});
