/*! bro-fs v0.1.2 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["fs"] = factory();
	else
		root["fs"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * HTML5 Filesystem API
	 * @module fs
	 */

	const utils = __webpack_require__(1);
	const errors = __webpack_require__(2);
	const root = __webpack_require__(3);
	const file = __webpack_require__(4);
	const directory = __webpack_require__(5);
	const stat = __webpack_require__(6);
	const quota = __webpack_require__(7);

	/**
	 * Is filesystem API supported
	 *
	 * @returns {Boolean}
	 */
	exports.isSupported = function () {
	  return Boolean(window.webkitRequestFileSystem);
	};

	/**
	 * Init filesystem
	 *
	 * @param {Object} [options]
	 * @param {Number} [options.type=window.PERSISTENT] window.PERSISTENT | window.TEMPORARY
	 * @param {Number} [options.bytes=1Mb]
	 * @param {Boolean} [options.requestQuota=true] show request quota popup for PERSISTENT type.
	 * (`false` for Chrome extensions with `unlimitedStorage` permission)
	 * @returns {Promise}
	 */
	exports.init = function (options = {}) {
	  const type = options.hasOwnProperty('type') ? options.type : window.PERSISTENT;
	  const bytes = options.bytes || 1024 * 1024;
	  assertType(type);
	  const requestQuota = type === window.PERSISTENT
	    ? (options.requestQuota === undefined ? true : options.requestQuota)
	    : false;
	  return Promise.resolve()
	    .then(() => requestQuota ? quota.requestPersistent(bytes) : bytes)
	    // webkitRequestFileSystem always returns fs even if quota not granted
	    .then(grantedBytes => utils.promiseCall(window, 'webkitRequestFileSystem', type, grantedBytes))
	    .then(fs => {
	      root.set(fs.root, type);
	      return fs;
	    });
	};

	/**
	 * Gets used and granted bytes
	 *
	 * @returns {Promise<{usedBytes, grantedBytes}>}
	 */
	exports.usage = function () {
	  return quota.usage(root.getType());
	};

	/**
	 * Returns root directory
	 *
	 * @returns {FileSystemDirectoryEntry}
	 */
	exports.getRoot = function () {
	  return root.get();
	};

	/**
	 * Reads file content
	 *
	 * @param {String} path
	 * @param {Object} [options]
	 * @param {String} [options.type='Text'] how content should be read: Text|ArrayBuffer|BinaryString|DataURL
	 * @returns {Promise<String>}
	 */
	exports.readFile = function (path, options = {}) {
	  return file.get(path)
	    .then(fileEntry => file.read(fileEntry, options));
	};

	/**
	 * Writes data to file
	 *
	 * @param {String} path
	 * @param {String|Blob|File|ArrayBuffer} data
	 * @returns {Promise}
	 */
	exports.writeFile = function (path, data) {
	  return file.get(path, {create: true, overwrite: true})
	    .then(fileEntry => file.write(fileEntry, data, {append: false}));
	};

	/**
	 * Appends data to file
	 *
	 * @param {String} path
	 * @param {String|Blob|File|ArrayBuffer} data
	 * @returns {Promise}
	 */
	exports.appendFile = function (path, data) {
	  return file.get(path, {create: true, overwrite: false})
	    .then(fileEntry => file.write(fileEntry, data, {append: true}));
	};

	/**
	 * Removes file
	 *
	 * @param {String} path
	 * @returns {Promise}
	 */
	exports.unlink = function (path) {
	  return file.get(path)
	    .then(fileEntry => utils.promiseCall(fileEntry, 'remove'));
	};

	/**
	 * Renames file or directory
	 *
	 * @param {String} oldPath
	 * @param {String} newPath
	 * @param {Object} [options]
	 * @param {Boolean} [options.create=false] create missing directories
	 * @returns {Promise<FileSystemFileEntry>}
	 */
	exports.rename = function (oldPath, newPath, options = {}) {
	  return moveOrCopy(oldPath, newPath, 'moveTo', options);
	};

	/**
	 * Copies file or directory
	 *
	 * @param {String} oldPath
	 * @param {String} newPath
	 * @param {Object} [options]
	 * @param {Boolean} [options.create=false] create missing directories
	 * @returns {Promise<FileSystemFileEntry>}
	 */
	exports.copy = function (oldPath, newPath, options = {}) {
	  return moveOrCopy(oldPath, newPath, 'copyTo', options);
	};

	/**
	 * Removes directory recursively
	 *
	 * @param {String} path
	 * @returns {Promise}
	 */
	exports.rmdir = function (path) {
	  return directory.get(path)
	    .then(dir => dir === root.get()
	      ? Promise.reject('Can not rmdir root. Use clear() to clear fs.')
	      : utils.promiseCall(dir, 'removeRecursively')
	    )
	};

	/**
	 * Creates new directory
	 *
	 * @param {String} path
	 * @returns {Promise<FileSystemDirectoryEntry>}
	 */
	exports.mkdir = function (path) {
	  return directory.get(path, {create: true});
	};

	/**
	 * Checks that file or directory exists by provided path
	 *
	 * @param {String} path
	 * @returns {Promise<Boolean>}
	 */
	exports.exists = function (path) {
	  return getFileOrDir(path)
	    .then(() => true, e => errors.isNotFoundError(e)
	      ? false
	      : Promise.reject(e)
	    );
	};

	/**
	 * Gets info about file or directory
	 *
	 * @param {String} path
	 * @returns {Promise<StatObject>}
	 */
	exports.stat = function (path) {
	  return getFileOrDir(path)
	    .then(entry => stat.get(entry));
	};

	/**
	 * Reads directory content
	 *
	 * @param {String} path
	 * @param {Object} [options]
	 * @param {Boolean} [options.deep=false] read recursively and attach data as `children` property
	 * @returns {Promise<Array<FileSystemEntry>>}
	 */
	exports.readdir = function (path, options = {}) {
	  return directory.get(path)
	    .then(dir => options.deep
	      ? directory.readDeep(dir)
	      : directory.read(dir)
	    )
	};

	/**
	 * Clears whole filesystem
	 * @returns {Promise}
	 */
	exports.clear = function () {
	  return exports.readdir('/')
	    .then(entries => {
	      const tasks = entries.map(entry => entry.isDirectory
	        ? utils.promiseCall(entry, 'removeRecursively')
	        : utils.promiseCall(entry, 'remove')
	      );
	      return Promise.all(tasks);
	    });
	};

	/**
	 * Gets URL for path
	 *
	 * @param {String} path
	 * @returns {String}
	 */
	exports.getUrl = function (path) {
	  return getFileOrDir(path)
	    .then(entry => entry.toURL())
	};

	function getFileOrDir(path) {
	  return file.get(path)
	    .catch(e => errors.isTypeMismatchError(e)
	      ? directory.get(path)
	      : Promise.reject(e)
	    );
	}

	function moveOrCopy(oldPath, newPath, method, options) {
	  if (oldPath === newPath) {
	    return Promise.resolve();
	  }
	  const {
	    dirPath: newParentDirPath,
	    fileName: newName,
	  } = utils.parsePath(newPath);
	  return Promise.all([
	    getFileOrDir(oldPath),
	    directory.get(newParentDirPath, options)
	  ]).then(([enrty, newParent]) => {
	    return utils.promiseCall(enrty, method, newParent, newName);
	  });
	}

	function assertType(type) {
	  if (type !== window.PERSISTENT && type !== window.TEMPORARY) {
	    throw new Error(`Unknown storage type ${type}`);
	  }
	}


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Utils
	 */

	exports.promiseCall = function (obj, method) {
	  if (!obj) {
	    throw new Error(`Can't call promisified method '${method}' of ${obj}`);
	  }
	  const args = [].slice.call(arguments, 2);
	  return new Promise((resolve, reject) => {
	    args.push(resolve, reject);
	    return obj[method].apply(obj, args);
	  });
	};

	exports.parsePath = function (path) {
	  const parts = exports.splitPath(path);
	  const fileName = parts.pop();
	  const dirPath = parts.join('/');
	  return {dirPath, fileName};
	};

	exports.splitPath = function (path = '') {
	  path = path.replace(/^\.\//, ''); // remove './' at start
	  if (path.length > 1 && path.endsWith('/')) {
	    throw new Error(`Path can not end with '/'`);
	  }
	  return path.split('/').filter(Boolean);
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Errors
	 */

	exports.isNotFoundError = function (e) {
	  return e && e.name === 'NotFoundError';
	};

	exports.isTypeMismatchError = function (e) {
	  return e && e.name === 'TypeMismatchError';
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Store link to fs root (singleton)
	 */

	let root = null;
	let type = null;

	exports.get = function () {
	  if (!root) {
	    throw new Error('Filesystem not initialized.');
	  } else {
	    return root;
	  }
	};

	exports.set = function (newRoot, newType) {
	  root = newRoot;
	  type = newType;
	};

	exports.getType = function () {
	  return type;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Operations with files
	 */

	const utils = __webpack_require__(1);
	const errors = __webpack_require__(2);
	const directory = __webpack_require__(5);

	/**
	 * Returns FileEntry by path
	 * If options.create = true will create missing directories and file
	 *
	 * @param {String} path
	 * @param {Object} [options]
	 * @param {Boolean} [options.create]
	 * @param {Boolean} [options.overwrite]
	 * @returns {Promise}
	 */
	exports.get = function (path, options = {}) {
	  const {dirPath, fileName} = utils.parsePath(path);
	  return Promise.resolve()
	    .then(() => directory.get(dirPath, options))
	    .then(dir => {
	      if (options.create) {
	        if (options.overwrite) {
	          return createChildFile(dir, fileName);
	        } else {
	          return getChildFile(dir, fileName)
	            .catch(e => errors.isNotFoundError(e)
	              ? createChildFile(dir, fileName)
	              : Promise.reject(e))
	        }
	      } else {
	        return getChildFile(dir, fileName);
	      }
	    });
	};

	/**
	 * Writes to fileEntry using fileWriter
	 *
	 * @param {Object} fileEntry
	 * @param {String} data
	 * @param {Object} [options]
	 * @param {Boolean} [options.append]
	 * @param {String} [options.type] mimetype
	 * @returns {Promise}
	 */
	exports.write = function (fileEntry, data, options = {}) {
	  return utils.promiseCall(fileEntry, 'createWriter')
	    .then(fileWriter => {
	      return new Promise((resolve, reject) => {
	        if (options.append) {
	          fileWriter.seek(fileWriter.length);
	          fileWriter.onwriteend = resolve;
	        } else {
	          let truncated = false;
	          fileWriter.onwriteend = function () {
	            if (!truncated) {
	              truncated = true;
	              this.truncate(this.position);
	            } else {
	              resolve();
	            }
	          };
	        }
	        fileWriter.onerror = reject;
	        const blob = new Blob([data], {type: getMimeTypeByData(data)});
	        fileWriter.write(blob);
	      });
	    })
	    .then(() => fileEntry)
	};

	/**
	 * Reads from fileEntry
	 *
	 * @param {Object} fileEntry
	 * @param {Object} [options]
	 * @param {String} [options.type] how content should be read
	 * @returns {Promise<String>}
	 */
	exports.read = function (fileEntry, options = {}) {
	  return utils.promiseCall(fileEntry, 'file')
	    .then(file => {
	      return new Promise((resolve, reject) => {
	        const reader = new FileReader();
	        reader.onload = () => resolve(reader.result);
	        reader.onerror = () => reject(reader.error);
	        // see: https://developer.mozilla.org/ru/docs/Web/API/FileReader
	        readAs(options.type, reader, file);
	      });
	    });
	};

	function getMimeTypeByData(data) {
	  if (typeof data === 'string') {
	    return 'text/plain';
	  } else {
	    return 'application/octet-binary';
	  }
	}

	function readAs(type, reader, file) {
	  switch (type) {
	    case 'ArrayBuffer':
	      return reader.readAsArrayBuffer(file);
	    case 'BinaryString':
	      return reader.readAsBinaryString(file);
	    case 'DataURL':
	      return reader.readAsDataURL(file);
	    case 'Text':
	    default:
	      return reader.readAsText(file);
	  }
	}

	function createChildFile(parent, fileName) {
	  return utils.promiseCall(parent, 'getFile', fileName, {create: true, exclusive: false});
	}

	function getChildFile(parent, fileName) {
	  return utils.promiseCall(parent, 'getFile', fileName, {create: false});
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Operations with directories
	 */

	const utils = __webpack_require__(1);
	const errors = __webpack_require__(2);
	const root = __webpack_require__(3);

	/**
	 * Returns DirectoryEntry by path
	 * If options.create = true will create missing directories
	 *
	 * @param {String} path
	 * @param {Object} options
	 * @param {Boolean} options.create
	 * @returns {Promise}
	 */
	exports.get = function (path, options = {}) {
	  const parts = utils.splitPath(path);
	  return parts.reduce((res, dirName) => {
	    return res.then(dir => {
	      let task = getChildDir(dir, dirName);
	      if (options.create) {
	        task = task.catch(e => errors.isNotFoundError(e)
	          ? createChildDir(dir, dirName)
	          : Promise.reject(e));
	      }
	      return task;
	    });
	  }, Promise.resolve(root.get()));
	};

	/**
	 * Reads dir entries
	 *
	 * @param {Object} dir
	 */
	exports.read = function (dir) {
	  return utils.promiseCall(dir.createReader(), 'readEntries')
	};

	/**
	 * Reads dir entries deeply
	 *
	 * @param {Object} dir
	 * @returns {Promise<Array>}
	 */
	exports.readDeep = function (dir) {
	  return exports.read(dir)
	    .then(entries => {
	      const tasks = entries.map(entry => {
	        if (entry.isDirectory) {
	          return exports.readDeep(entry)
	            .then(subEntries => Object.assign(entry, {children: subEntries}))
	        } else {
	          return Promise.resolve(entry);
	        }
	      });
	      return Promise.all(tasks);
	    });
	};

	function createChildDir(parent, dirName) {
	  return utils.promiseCall(parent, 'getDirectory', dirName, {create: true, exclusive: true});
	}

	function getChildDir(parent, dirName) {
	  return utils.promiseCall(parent, 'getDirectory', dirName, {create: false});
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Stat for file or directory
	 */

	const utils = __webpack_require__(1);

	/**
	 * Gets stat info
	 *
	 * @param {FileSystemEntry} entry
	 * @returns {Promise<StatObject>}
	 */
	exports.get = function (entry) {
	  return utils.promiseCall(entry, 'getMetadata')
	    .then(metadata => {
	      return {
	        isFile: entry.isFile,
	        isDirectory: entry.isDirectory,
	        name: entry.name,
	        fullPath: entry.fullPath,
	        modificationTime: metadata.modificationTime,
	        size: metadata.size,
	      };
	    })
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Requesting quota
	 */

	const utils = __webpack_require__(1);

	exports.requestPersistent = function (bytes) {
	  const storage = getStorageByType(window.PERSISTENT);
	  return utils.promiseCall(storage, 'requestQuota', bytes)
	    .then(grantedBytes => grantedBytes > 0
	      ? Promise.resolve(grantedBytes)
	      : Promise.reject('Quota not granted')
	    );
	};

	exports.usage = function (type) {
	  const storage = getStorageByType(type);
	  return utils.promiseCall(storage, 'queryUsageAndQuota')
	    .then((usedBytes, grantedBytes) => {
	      return {usedBytes, grantedBytes};
	    });
	};

	function getStorageByType(type) {
	  return type === window.PERSISTENT
	    ? navigator.webkitPersistentStorage
	    : navigator.webkitTemporaryStorage;
	}


/***/ }
/******/ ])
});
;