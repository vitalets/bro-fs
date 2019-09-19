/*! bro-fs v0.5.0 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["fs"] = factory();
	else
		root["fs"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/directory.js":
/*!**************************!*\
  !*** ./src/directory.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Operations with directories
 */
var utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

var errors = __webpack_require__(/*! ./errors */ "./src/errors.js");

var root = __webpack_require__(/*! ./root */ "./src/root.js");
/**
 * Returns DirectoryEntry by path
 * If options.create = true will create missing directories
 *
 * @param {String} path
 * @param {Object} options
 * @param {Boolean} options.create
 * @returns {Promise}
 */


exports.get = function (path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (path && typeof path !== 'string') {
    return path.isDirectory ? Promise.resolve(path) : Promise.reject(new DOMError('TypeMismatchError', 'Expected directory but got file'));
  }

  var parts = utils.splitPath(path);
  return parts.reduce(function (res, dirName) {
    return res.then(function (dir) {
      var task = getChildDir(dir, dirName);

      if (options.create) {
        task = task["catch"](function (e) {
          return errors.isNotFoundError(e) ? createChildDir(dir, dirName) : Promise.reject(e);
        });
      }

      return task;
    });
  }, Promise.resolve(root.get()));
};
/**
 * Reads dir entries
 * Note: readEntries returns maximum 100 files. To get all entries method should be called recursively
 * until empty array returned.
 * @see https://stackoverflow.com/questions/23823548/maximum-files-of-a-directory-that-can-be-read-by-filereaderreadentries-in-javas
 * @param {Object} dir
 */


exports.read = function (dir) {
  return readEntriesRecursive(dir.createReader(), []);
};
/**
 * Reads dir entries deeply
 *
 * @param {Object} dir
 * @returns {Promise<Array>}
 */


exports.readDeep = function (dir) {
  return exports.read(dir).then(function (entries) {
    var tasks = entries.map(function (entry) {
      if (entry.isDirectory) {
        return exports.readDeep(entry).then(function (subEntries) {
          return Object.assign(entry, {
            children: subEntries
          });
        });
      } else {
        return Promise.resolve(entry);
      }
    });
    return Promise.all(tasks);
  });
};

function createChildDir(parent, dirName) {
  return utils.promiseCall(parent, 'getDirectory', dirName, {
    create: true,
    exclusive: false
  });
}

function getChildDir(parent, dirName) {
  return utils.promiseCall(parent, 'getDirectory', dirName, {
    create: false
  });
}

function readEntriesRecursive(reader, acc) {
  return utils.promiseCall(reader, 'readEntries').then(function (entries) {
    return entries.length ? readEntriesRecursive(reader, acc.concat(entries)) : acc;
  });
}

/***/ }),

/***/ "./src/errors.js":
/*!***********************!*\
  !*** ./src/errors.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Errors
 */
exports.isNotFoundError = function (e) {
  return e && e.name === 'NotFoundError';
};

exports.isTypeMismatchError = function (e) {
  return e && e.name === 'TypeMismatchError';
};

/***/ }),

/***/ "./src/file.js":
/*!*********************!*\
  !*** ./src/file.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Operations with files
 */
var utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

var errors = __webpack_require__(/*! ./errors */ "./src/errors.js");

var directory = __webpack_require__(/*! ./directory */ "./src/directory.js");
/**
 * Returns FileEntry by path
 * If options.create = true will create missing directories and file
 *
 * @param {String|FileSystemFileEntry} path
 * @param {Object} [options]
 * @param {Boolean} [options.create]
 * @param {Boolean} [options.overwrite]
 * @returns {Promise}
 */


exports.get = function (path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (path && typeof path !== 'string') {
    return path.isFile ? Promise.resolve(path) : Promise.reject(new DOMError('TypeMismatchError', 'Expected file but got directory'));
  }

  var _utils$parsePath = utils.parsePath(path),
      dirPath = _utils$parsePath.dirPath,
      fileName = _utils$parsePath.fileName;

  return Promise.resolve().then(function () {
    return directory.get(dirPath, options);
  }).then(function (dir) {
    if (options.create) {
      if (options.overwrite) {
        return createChildFile(dir, fileName);
      } else {
        return getChildFile(dir, fileName)["catch"](function (e) {
          return errors.isNotFoundError(e) ? createChildFile(dir, fileName) : Promise.reject(e);
        });
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


exports.write = function (fileEntry, data) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return utils.promiseCall(fileEntry, 'createWriter').then(function (fileWriter) {
    return new Promise(function (resolve, reject) {
      if (options.append) {
        fileWriter.seek(fileWriter.length);
        fileWriter.onwriteend = resolve;
      } else {
        var truncated = false;

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
      var blob = new Blob([data], {
        type: getMimeTypeByData(data)
      });
      fileWriter.write(blob);
    });
  }).then(function () {
    return fileEntry;
  });
};
/**
 * Reads from fileEntry
 * 
 * `options.type='Blob'` returns a snapshot of the file. Slower but safer.
 * 
 * `options.type='File'` returns a real-time reference without any r/w lock. Faster but may have a data race.
 *
 * @param {Object} fileEntry
 * @param {Object} [options]
 * @param {String} [options.type] how content should be read
 * @returns {Promise<String>}
 */


exports.read = function (fileEntry) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return utils.promiseCall(fileEntry, 'file').then(function (file) {
    if (options.type === 'Blob') {
      // see /test/file-vs-blob.js for why we need to "freeze" a Blob
      return freezeMutableFile(file);
    } else if (options.type === 'File') {
      return file;
    } else {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();

        reader.onload = function () {
          return resolve(reader.result);
        };

        reader.onerror = function () {
          return reject(reader.error);
        }; // see: https://developer.mozilla.org/ru/docs/Web/API/FileReader


        readAs(options.type, reader, file);
      });
    }
  });
};
/**
 * Create a ReadableStream from path or fileEntry
 *
 * @param {String|FileSystemFileEntry} path
 * @returns {ReadableStream}
 */


exports.createReadStream = function (path) {
  /* global TransformStream:false */
  var _ref = new TransformStream(),
      readable = _ref.readable,
      writable = _ref.writable;

  exports.get(path).then(function (fileEntry) {
    return utils.promiseCall(fileEntry, 'file');
  }).then(function (file) {
    return new Response(file).body.pipeTo(writable);
  })["catch"](function (e) {
    return writable.abort(e);
  });
  return readable;
};
/**
 * Create a WritableStream from fileEntry
 *
 * @param {String|FileSystemFileEntry} path
 * @param {Object} [options]
 * @param {Boolean} [options.append]
 * @param {String} [options.type] mimetype
 * @returns {WritableStream}
 */


exports.createWriteStream = function (path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new WritableStream({
    start: function start() {
      var _this = this;

      return exports.get(path, {
        create: true,
        overwrite: true
      }).then(function (fileEntry) {
        return utils.promiseCall(fileEntry, 'createWriter');
      }).then(function (fileWriter) {
        _this.fileWriter = fileWriter;

        if (options.append) {
          fileWriter.seek(fileWriter.length);
        }
      });
    },
    write: function write(data) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var blob = new Blob([data], {
          type: getMimeTypeByData(data)
        });
        _this2.fileWriter.onwriteend = resolve;
        _this2.fileWriter.onerror = reject;

        _this2.fileWriter.write(blob);
      });
    },
    close: function close() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.fileWriter.onwriteend = resolve;
        _this3.fileWriter.onerror = reject;

        _this3.fileWriter.truncate(_this3.fileWriter.position);
      });
    }
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

function freezeMutableFile(file) {
  // I tried different APIs, but they either require reading the
  // entire Blob into a buffer, or do not (deep) clone the Blob
  // at all. Response is so far the best I can find.
  return new Response(file).blob();
}

function createChildFile(parent, fileName) {
  return utils.promiseCall(parent, 'getFile', fileName, {
    create: true,
    exclusive: false
  });
}

function getChildFile(parent, fileName) {
  return utils.promiseCall(parent, 'getFile', fileName, {
    create: false
  });
}

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * HTML5 Filesystem API
 * @module fs
 */
var utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

var errors = __webpack_require__(/*! ./errors */ "./src/errors.js");

var root = __webpack_require__(/*! ./root */ "./src/root.js");

var file = __webpack_require__(/*! ./file */ "./src/file.js");

var directory = __webpack_require__(/*! ./directory */ "./src/directory.js");

var stat = __webpack_require__(/*! ./stat */ "./src/stat.js");

var quota = __webpack_require__(/*! ./quota */ "./src/quota.js");
/**
 * Is filesystem API supported by current browser
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
 * (for Chrome extensions with `unlimitedStorage` permission it is useful to pass options.requestQuota = false)
 * @returns {Promise}
 */


exports.init = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var type = Object.prototype.hasOwnProperty.call(options, 'type') ? options.type : window.PERSISTENT;
  var bytes = options.bytes || 1024 * 1024;
  assertType(type);
  var shouldRequestQuota = type === window.PERSISTENT ? Object.prototype.hasOwnProperty.call(options, 'requestQuota') ? options.requestQuota : true : false;
  return Promise.resolve().then(function () {
    return shouldRequestQuota ? quota.requestPersistent(bytes) : bytes;
  }) // webkitRequestFileSystem always returns fs even if quota not granted
  .then(function (grantedBytes) {
    return utils.promiseCall(window, 'webkitRequestFileSystem', type, grantedBytes);
  }).then(function (fs) {
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
 * Reads file content.
 * - `options.type='Blob'` returns a immutable snapshot of the file. Slower but safer.
 * - `options.type='File'` returns a mutable instance of {@link https://developer.mozilla.org/en-US/docs/Web/API/File File}. Faster but may have a data race.
 *
 * If file does not exist - error thrown.
 *
 * @param {String|FileSystemFileEntry} path
 * @param {Object} [options]
 * @param {String} [options.type='Text'] how content should be read: Text|ArrayBuffer|BinaryString|DataURL|Blob|File
 * @returns {Promise<String>}
 */


exports.readFile = function (path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return file.get(path).then(function (fileEntry) {
    return file.read(fileEntry, options);
  });
};
/**
 * Writes data to file.
 * If file does not exist - it will be created.
 * If file already exists - it will be overwritten.
 *
 * @param {String} path
 * @param {String|Blob|File|ArrayBuffer} data
 * @returns {Promise}
 */


exports.writeFile = function (path, data) {
  return file.get(path, {
    create: true,
    overwrite: true
  }).then(function (fileEntry) {
    return file.write(fileEntry, data, {
      append: false
    });
  });
};
/**
 * Appends data to file.
 * If file does not exist - it will be created.
 *
 * @param {String|FileSystemFileEntry} path
 * @param {String|Blob|File|ArrayBuffer} data
 * @returns {Promise}
 */


exports.appendFile = function (path, data) {
  return file.get(path, {
    create: true,
    overwrite: false
  }).then(function (fileEntry) {
    return file.write(fileEntry, data, {
      append: true
    });
  });
};
/**
 * Removes file.
 * If file does not exist - no error thrown.
 *
 * @param {String|FileSystemFileEntry} path
 * @returns {Promise}
 */


exports.unlink = function (path) {
  return file.get(path).then(function (fileEntry) {
    return utils.promiseCall(fileEntry, 'remove');
  }, function (e) {
    return errors.isNotFoundError(e) ? Promise.resolve(false) : Promise.reject(e);
  });
};
/**
 * Renames file or directory.
 * If source file or directory does not exist - error thrown.
 * If target already exists - it will be overwritten.
 *
 * @param {String|FileSystemEntry} oldPath
 * @param {String} newPath
 * @param {Object} [options]
 * @param {Boolean} [options.create=false] create missing directories
 * @returns {Promise<FileSystemEntry>}
 */


exports.rename = function (oldPath, newPath) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return moveOrCopy(oldPath, newPath, 'moveTo', options);
};
/**
 * Copies file or entire directory.
 * If file or directory does not exist - error thrown.
 *
 * @param {String|FileSystemEntry} oldPath
 * @param {String} newPath
 * @param {Object} [options]
 * @param {Boolean} [options.create=false] create missing directories
 * @returns {Promise<FileSystemEntry>}
 */


exports.copy = function (oldPath, newPath) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return moveOrCopy(oldPath, newPath, 'copyTo', options);
};
/**
 * Removes directory recursively.
 * If directory does not exist - method does nothing without error.
 *
 * @param {String|FileSystemDirectoryEntry} path
 * @returns {Promise}
 */


exports.rmdir = function (path) {
  return directory.get(path).then(function (dir) {
    return dir === root.get() ? Promise.reject('Can not remove root. Use clear() to clear fs.') : utils.promiseCall(dir, 'removeRecursively');
  }, function (e) {
    return errors.isNotFoundError(e) ? Promise.resolve(false) : Promise.reject(e);
  });
};
/**
 * Recursively creates required directories in provided path.
 *
 * @param {String} path
 * @returns {Promise<FileSystemDirectoryEntry>}
 */


exports.mkdir = function (path) {
  return directory.get(path, {
    create: true
  });
};
/**
 * Checks that file or directory exists by provided path.
 *
 * @param {String} path
 * @returns {Promise<Boolean>}
 */


exports.exists = function (path) {
  return exports.getEntry(path).then(function () {
    return true;
  }, function (e) {
    return errors.isNotFoundError(e) ? false : Promise.reject(e);
  });
};
/**
 * Gets info about file or directory.
 * If it does not exist - error thrown.
 *
 * @param {String|FileSystemEntry} path
 * @returns {Promise<StatObject>}
 */


exports.stat = function (path) {
  return exports.getEntry(path).then(function (entry) {
    return stat.get(entry);
  });
};
/**
 * Reads directory content
 *
 * @param {String|FileSystemDirectoryEntry} path
 * @param {Object} [options]
 * @param {Boolean} [options.deep=false] read recursively and attach data as `children` property
 * @returns {Promise<Array<FileSystemEntry>>}
 */


exports.readdir = function (path) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return directory.get(path).then(function (dir) {
    return options.deep ? directory.readDeep(dir) : directory.read(dir);
  });
};
/**
 * Clears whole filesystem
 * @returns {Promise}
 */


exports.clear = function () {
  return exports.readdir('/').then(function (entries) {
    var tasks = entries.map(function (entry) {
      return entry.isDirectory ? utils.promiseCall(entry, 'removeRecursively') : utils.promiseCall(entry, 'remove');
    });
    return Promise.all(tasks);
  });
};
/**
 * Gets URL for path
 *
 * @param {String|FileSystemEntry} path
 * @returns {String}
 */


exports.getUrl = function (path) {
  return exports.getEntry(path).then(function (entry) {
    return entry.toURL();
  });
};
/**
 * Gets file or directory
 *
 * @param {String|FileSystemEntry} path
 * @returns {Promise<FileSystemEntry>}
 */


exports.getEntry = function (path) {
  return file.get(path)["catch"](function (e) {
    return errors.isTypeMismatchError(e) ? directory.get(path) : Promise.reject(e);
  });
};
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream ReadableStream} for reading
 *
 * @param {String|FileSystemFileEntry} path
 * @returns {ReadableStream}
 */


exports.createReadStream = function (path) {
  return file.createReadStream(path);
};
/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/API/WritableStream WritableStream} for writing
 *
 * @param {String|FileSystemFileEntry} path
 * @returns {WritableStream}
 */


exports.createWriteStream = function (path) {
  return file.createWriteStream(path);
};

function moveOrCopy(oldPath, newPath, method, options) {
  if (oldPath === newPath) {
    // runtyper-disable-line
    return Promise.resolve();
  }

  var _utils$parsePath = utils.parsePath(newPath),
      newParentDirPath = _utils$parsePath.dirPath,
      newName = _utils$parsePath.fileName;

  return Promise.all([exports.getEntry(oldPath), directory.get(newParentDirPath, options)]).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        enrty = _ref2[0],
        newParent = _ref2[1];

    return utils.promiseCall(enrty, method, newParent, newName);
  });
}

function assertType(type) {
  if (type !== window.PERSISTENT && type !== window.TEMPORARY) {
    throw new Error("Unknown storage type ".concat(type));
  }
}

/***/ }),

/***/ "./src/quota.js":
/*!**********************!*\
  !*** ./src/quota.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Requesting quota
 */
var utils = __webpack_require__(/*! ./utils */ "./src/utils.js");
/**
 * Requesting quota is needed only for persistent storage.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/LocalFileSystem
 *
 * @param {Number} bytes
 * @returns {Promise}
 */


exports.requestPersistent = function (bytes) {
  var storage = getStorageByType(window.PERSISTENT);
  return utils.promiseCall(storage, 'requestQuota', bytes).then(function (grantedBytes) {
    return grantedBytes > 0 ? grantedBytes : Promise.reject("Quota not granted (requested: ".concat(bytes, ", granted: ").concat(grantedBytes, ")"));
  });
};

exports.usage = function (type) {
  var storage = getStorageByType(type);
  return utils.promiseCall(storage, 'queryUsageAndQuota').then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        usedBytes = _ref2[0],
        grantedBytes = _ref2[1];

    return {
      usedBytes: usedBytes,
      grantedBytes: grantedBytes
    };
  });
};

function getStorageByType(type) {
  return type === window.PERSISTENT ? navigator.webkitPersistentStorage : navigator.webkitTemporaryStorage;
}

/***/ }),

/***/ "./src/root.js":
/*!*********************!*\
  !*** ./src/root.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Store link to fs root (singleton)
 */
var root = null;
var type = null;

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

/***/ }),

/***/ "./src/stat.js":
/*!*********************!*\
  !*** ./src/stat.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Stat for file or directory
 */
var utils = __webpack_require__(/*! ./utils */ "./src/utils.js");
/**
 * Gets stat info
 *
 * @param {FileSystemEntry} entry
 * @returns {Promise<StatObject>}
 */


exports.get = function (entry) {
  return utils.promiseCall(entry, 'getMetadata').then(function (metadata) {
    return {
      isFile: entry.isFile,
      isDirectory: entry.isDirectory,
      name: entry.name,
      fullPath: entry.fullPath,
      modificationTime: metadata.modificationTime,
      size: metadata.size
    };
  });
};

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Utils
 */

/**
 * Calls async method of object with convertion callbacks into promise.
 *
 * @param {Object} obj
 * @param {String} method
 * @returns {Promise} promise resolved with returned value
 * (or array of values if callback called with more than one arguments)
 */
exports.promiseCall = function (obj, method) {
  if (!obj) {
    throw new Error("Can't call promisified method '".concat(method, "' of ").concat(obj));
  }

  var args = [].slice.call(arguments, 2);
  return new Promise(function (resolve, reject) {
    var callback = getCallback(resolve); // create error before call to capture stack

    var errback = getErrback(new Error(), method, args, reject);
    var fullArgs = args.concat([callback, errback]);
    return obj[method].apply(obj, fullArgs);
  });
};

exports.parsePath = function (path) {
  var parts = exports.splitPath(path);
  var fileName = parts.pop();
  var dirPath = parts.join('/');
  return {
    dirPath: dirPath,
    fileName: fileName
  };
};

exports.splitPath = function () {
  var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  path = path.replace(/^\.\//, ''); // remove './' at start

  if (path.length > 1 && path.endsWith('/')) {
    throw new Error("Path can not end with '/'");
  }

  return path.split('/').filter(Boolean);
};
/**
 * Create callback. Resolve should always be called with single argument:
 * - if underling callback called with zero or one argument - resolve call with the same
 * - if underling callback called with multiple arguments - resolve call with array of arguments
 *
 * See: https://github.com/vitalets/bro-fs/issues/7
 */


function getCallback(resolve) {
  return function () {
    // not leaking arguments copy
    // see: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var i = arguments.length;
    var args = [];

    while (i--) {
      args[i] = arguments[i];
    }

    if (args.length === 0) {
      resolve();
    } else if (args.length === 1) {
      resolve(args[0]);
    } else {
      resolve(args);
    }
  };
}
/**
 * Convert DOMException to regular error to have normal stack trace
 * Also add some details to error message
 */


function getErrback(err, method, args, reject) {
  return function (e) {
    var argsStr = '';

    try {
      argsStr = JSON.stringify(args);
    } catch (ex) {
      argsStr = args.join(', ');
    }

    err.name = e.name;
    err.message = "".concat(e.message, " Call: ").concat(method, "(").concat(argsStr, ")");
    reject(err);
  };
}

/***/ })

/******/ });
});
//# sourceMappingURL=bro-fs.js.map