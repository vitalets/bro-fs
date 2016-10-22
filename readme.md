# bro-fs
Promise-based [HTML5 Filesystem API](https://dev.w3.org/2009/dap/file-system/file-dir-sys.html)
allowing to work with sandboxed filesystem in browser.  
API is similar to [Node.js fs module](https://nodejs.org/api/fs.html) with some extra sugar.

## Specs
Current:  
 * https://dev.w3.org/2009/dap/file-system/file-dir-sys.html (Chrome)
 * https://wicg.github.io/entries-api/ (Firefox and EDGE)
 
Coming:  
 * https://w3c.github.io/filesystem-api/
 
Discussion:  
 * https://github.com/w3c/filesystem-api/issues/8
 

## Similar packages
* https://www.npmjs.com/package/filer.js - unix-like commands, callbacks
* https://github.com/evanshortiss/html5-fs - not maintained, callbacks
* https://github.com/jvilk/BrowserFS - many backends, callbacks
* https://www.npmjs.com/package/fs-web - store in IndexedDB, not html5 filesystem
* https://github.com/mmckegg/web-fs - abanboned
* https://github.com/mafintosh/browserify-fs - uses leveldb under hood, callbacks
* https://github.com/CrabDude/fs-browserify - abanboned
* https://www.npmjs.com/package/dom-fs - abanboned
