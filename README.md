# bro-fs

[![Build Status](https://travis-ci.org/vitalets/bro-fs.svg?branch=master)](https://travis-ci.org/vitalets/bro-fs)
[![Sauce Test Status](https://saucelabs.com/buildstatus/browserfilesystem)](https://saucelabs.com/u/browserfilesystem)
[![npm](https://img.shields.io/npm/v/bro-fs.svg)](https://www.npmjs.com/package/bro-fs)
[![license](https://img.shields.io/npm/l/bro-fs.svg)](https://www.npmjs.com/package/bro-fs)

Promise-based wrapper over [HTML5 Filesystem API](https://dev.w3.org/2009/dap/file-system/file-dir-sys.html)
allowing to work with sandboxed filesystem in browser.  
API is similar to [Node.js fs module](https://nodejs.org/api/fs.html) with some extra sugar.
Currently it is supported [only by Chrome](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem#Browser_compatibility). 

Tested in:  
[![Sauce Test Status](https://saucelabs.com/browser-matrix/browserfilesystem.svg)](https://saucelabs.com/u/browserfilesystem)

## Live demo & Docs
* [Demo](https://vitalets.github.io/bro-fs/demo/)
* [API Documentaion](https://vitalets.github.io/bro-fs/)

## Install
```bash
npm install bro-fs --save
```
or download manually [latest release](https://github.com/vitalets/bro-fs/releases/latest).

## Usage
Webpack/browserify:
```js
const fs = require('bro-fs');

// with async/await:
(async function () {
  await fs.init({type: window.TEMPORARY, bytes: 5 * 1024 * 1024});
  await fs.mkdir('dir');
  await fs.writeFile('file.txt', 'hello world');
  const content = await fs.readFile('file.txt');
  console.log(content); // => "hello world"
})();

// OR with .then():
fs.init({type: window.TEMPORARY, bytes: 5 * 1024 * 1024})
  .then(() => fs.mkdir('dir'))
  .then(() => fs.writeFile('file.txt', 'hello world'))
  .then(() => fs.readFile('file.txt'))
  .then(content => console.log(content)); // => "hello world"
```

Script tag:
```html
<script src="https://unpkg.com/bro-fs"></script>
<script>
(async function () {
  await fs.init({type: window.TEMPORARY, bytes: 5 * 1024 * 1024});
  ...
})();
</script>
```

See more usage examples in [test directory](/test).

## W3C Specs
Current:  
 * [https://dev.w3.org/2009/dap/file-system/file-dir-sys.html](https://dev.w3.org/2009/dap/file-system/file-dir-sys.html) (Chrome)
 * [https://wicg.github.io/entries-api](https://wicg.github.io/entries-api) (Firefox and Edge)
 
Coming (draft):  
 * [https://w3c.github.io/filesystem-api](https://w3c.github.io/filesystem-api)
 
Discussion:  
 * [https://github.com/w3c/filesystem-api/issues/8](https://github.com/w3c/filesystem-api/issues/8)
 
## Similar packages
* [filer.js](https://www.npmjs.com/package/filer.js) - unix-like commands, callbacks
* [html5-fs](https://github.com/evanshortiss/html5-fs) - looks obsolete, callbacks
* [chromestore.js](https://github.com/summera/chromestore.js) - looks obsolete, callbacks
* [BrowserFS](https://github.com/jvilk/BrowserFS) - many backends, callbacks
* [fs-web](https://www.npmjs.com/package/fs-web) - store files in IndexedDB, not html5 filesystem
* [web-fs](https://github.com/mmckegg/web-fs) - abandoned
* [browserify-fs](https://github.com/mafintosh/browserify-fs) - uses leveldb under hood, callbacks
* [fs-browserify](https://github.com/CrabDude/fs-browserify) - abandoned
* [dom-fs](https://www.npmjs.com/package/dom-fs) - abandoned

## License
MIT @ [Vitaliy Potapov](https://github.com/vitalets)
