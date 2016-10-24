# bro-fs

[![Build Status](https://travis-ci.org/vitalets/bro-fs.svg?branch=master)](https://travis-ci.org/vitalets/bro-fs)
[![GitHub version](https://badge.fury.io/gh/vitalets%2Fbro-fs.svg)](https://github.com/vitalets/bro-fs/releases/latest)

Promise-based [HTML5 Filesystem API](https://dev.w3.org/2009/dap/file-system/file-dir-sys.html)
allowing to work with sandboxed filesystem in browser.  
API is similar to [Node.js fs module](https://nodejs.org/api/fs.html) with some extra sugar.
Currently it is supported [only in Chrome](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem#Browser_compatibility). 

[![Sauce Test Status](https://saucelabs.com/browser-matrix/autovit.svg)](https://saucelabs.com/u/autovit)

## Live demo & Docs
* [Demo](https://vitalets.github.io/bro-fs/demo/)
* [Documentaion](https://vitalets.github.io/bro-fs/)

## Install
```bash
npm install bro-fs --save
```
or download manually [latest release](https://github.com/vitalets/bro-fs/releases/latest).

## Usage
Webpack/browserify:
```js
const fs = require('bro-fs');

fs.init({type: window.TEMPORARY, bytes: 5 * 1024 * 1024})
  .then(() => fs.mkdir('dir'))
  .then(() => fs.writeFile('file.txt', 'hello world'))

```
Script tag:
```html
<script src="node_modules/bro-fs/dist/bro-fs.js"></script>
<script>
    fs.init({type: window.TEMPORARY, bytes: 5 * 1024 * 1024})
      .then(() => fs.mkdir('dir'))
      .then(() => fs.writeFile('file.txt', 'hello world'))
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
 * [https://github.com/w3c/filesystem-api/issues/8](https://w3c.github.io/filesystem-api)
 
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
MIT
