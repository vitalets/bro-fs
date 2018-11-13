describe('mutable vs snapshot', function () {

  it('should modify the content of previously created Blob', async function () {
    await fs.writeFile('a.txt', 'abc');
    const res = await fs.readFile('a.txt', { type: 'MutableFile' });
    await fs.writeFile('a.txt', 'd');
    assert.equal(await new Response(res).text(), 'd');
  });

  it('should return an immutable snapshot', async function () {
    await fs.writeFile('a.txt', 'abc');
    const res = await fs.readFile('a.txt', { type: 'Blob' });
    await fs.writeFile('a.txt', 'd');
    assert.equal(await new Response(res).text(), 'abc');
  });

});
