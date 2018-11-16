describe('File vs Blob', function () {

  it('should modify the content of File', async function () {
    await fs.writeFile('a.txt', 'abc');
    const res = await fs.readFile('a.txt', { type: 'File' });
    await fs.writeFile('a.txt', 'd');
    assert.equal(await new Response(res).text(), 'd');
  });

  it('should not modify the content of Blob', async function () {
    await fs.writeFile('a.txt', 'abc');
    const res = await fs.readFile('a.txt', { type: 'Blob' });
    await fs.writeFile('a.txt', 'd');
    assert.equal(await new Response(res).text(), 'abc');
  });

});
