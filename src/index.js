/**
 * Promise-based HTML5 Filesystem API compatible with Node.js fs module.
 *
 * Someday browsers will implement W3C filesystem: https://w3c.github.io/filesystem-api/
 *
 * HTML5 Rocks article:
 * https://www.html5rocks.com/en/tutorials/file/filesystem/
 *
 * Links:
 * https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
 * https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
 * https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
 */

let root = null;

/**
 * Init filesystem
 *
 * @param {Object} [options]
 * @param {Number} [options.type] window.PERSISTENT | window.TEMPORARY
 * @param {Number} [options.bytes]
 * @param {Boolean} [options.requestQuota] show request quota popup
 * (not needed for extensions with unlimitedStorage permission)
 * @returns {Promise}
 */
exports.init = function (options = {}) {
  const type = options.type || window.PERSISTENT;
  const bytes = options.bytes || 0;
  const requestQuota = options.requestQuota === undefined ? true : options.requestQuota;
  return Promise.resolve()
    .then(() => requestQuota ? requestQuotaPopup({type, bytes}) : bytes)
    .then(grantedBytes => promiseCall(window, 'webkitRequestFileSystem', type, grantedBytes))
    .then(fs => root = fs.root);
};

/**
 * Reads file content
 *
 * @param {String} path
 * @returns {Promise<String>}
 */
exports.readFile = function (path) {
  return getFile(path)
    .then(file => readFromFileEntry(file));
};

/**
 * Writes data to file
 *
 * @param {String} path
 * @param {String} data
 * @returns {Promise<String>}
 */
exports.writeFile = function (path, data) {
  return getFile(path, {create: true, overwrite: true})
    .then(file => writeToFileEntry(file, data, {append: false}));
};

/**
 * Appends data to file
 *
 * @param {String} path
 * @param {String} data
 * @returns {Promise<String>}
 */
exports.appendFile = function (path, data) {
  return getFile(path, {create: true, overwrite: false})
    .then(file => writeToFileEntry(file, data, {append: true}));
};

exports.unlink = function (path) {
  return getFile(path)
    .then(file => promiseCall(file, 'remove'));
};

exports.rename = function (oldPath, newPath) {

};

exports.copy = function (oldPath, newPath) {

};

exports.rmdir = function (path) {
  return getDir(path)
    .then(dir => dir === root
      ? Promise.reject('Can not rmdir root. Use clear() to clear fs.')
      : promiseCall(dir, 'removeRecursively')
    )
};

exports.mkdir = function (path) {
  return getDir(path, {create: true});
};

exports.stat = function (path) {
  return getDir(path)
    .then(getStat, e => isTypeMismatchError(e)
      ? getFile(path).then(getStat)
      : Promise.reject(e)
    )
};

exports.readdir = function (path) {
  return getDir(path)
    .then(dir => promiseCall(dir.createReader(), 'readEntries'))
    .then(entries => entries.sort(entry => entry.name));
};

/**
 * Clears whole filesystem
 */
exports.clear = function () {
  return exports.readdir('/')
    .then(entries => {
      const tasks = entries.map(entry => entry.isDirectory
        ? promiseCall(entry, 'removeRecursively')
        : promiseCall(entry, 'remove')
      );
      return Promise.all(tasks);
    });
};

/**
 * Returns DirectoryEntry by path
 * If options.create = true will create missing directories
 *
 * @param {String} path
 * @param {Object} options
 * @param {Boolean} options.create
 * @returns {Promise}
 */
function getDir(path, options = {}) {
  const parts = splitPath(path);
  return parts.reduce((res, dirName) => {
    return res.then(dir => {
      let task = getChildDir(dir, dirName);
      if (options.create) {
        task = task.catch(e => isNotFoundError(e) ? createChildDir(dir, dirName) : Promise.reject(e));
      }
      return task;
    });
   }, Promise.resolve(root));
}

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
function getFile(path, options = {}) {
  const {dirPath, fileName} = parsePath(path);
  return Promise.resolve()
    .then(() => getDir(dirPath, options))
    .then(dir => {
      if (options.create) {
        if (options.overwrite) {
          return createChildFile(dir, fileName);
        } else {
          return getChildFile(dir, fileName)
            .catch(e => isNotFoundError(e) ? createChildFile(dir, fileName) : Promise.reject(e))
        }
      } else {
        return getChildFile(dir, fileName);
      }
    });
}

function createChildDir(parent, dirName) {
  return promiseCall(parent, 'getDirectory', dirName, {create: true, exclusive: true});
}

function getChildDir(parent, dirName) {
  return promiseCall(parent, 'getDirectory', dirName, {create: false});
}

function createChildFile(parent, fileName) {
  return promiseCall(parent, 'getFile', fileName, {create: true, exclusive: false});
}

function getChildFile(parent, fileName) {
  return promiseCall(parent, 'getFile', fileName, {create: false});
}

function requestQuotaPopup(options = {}) {
  return promiseCall(window.webkitStorageInfo, 'requestQuota', options.type, options.bytes)
    .then(grantedBytes => grantedBytes > 0
      ? Promise.resolve(grantedBytes)
      : Promise.reject('Quota not granted')
    );
}

function promiseCall(obj, method) {
  const args = [].slice.call(arguments, 2);
  return new Promise((resolve, reject) => obj[method].apply(obj, args.concat([resolve, reject])));
}

function splitPath(path = '') {
  path = path.replace(/^\.\//, ''); // remove './' at start
  if (path.length > 1 && path.endsWith('/')) {
    throw new Error(`Path can not end with '/'`);
  }
  return path.split('/').filter(Boolean);
}

function parsePath(path) {
  const parts = splitPath(path);
  const fileName = parts.pop();
  const dirPath = parts.join('/');
  return {dirPath, fileName};
}

/**
 * Writes to fileEntry using fileWriter
 *
 * @param {Object} fileEntry
 * @param {String} data
 * @param {Object} [options]
 * @param {Boolean} [options.append]
 * @returns {Promise}
 */
function writeToFileEntry(fileEntry, data, options = {}) {
  return promiseCall(fileEntry, 'createWriter')
    .then(fileWriter => {
      return new Promise((resolve, reject) => {
        if (options.append) {
          fileWriter.seek(fileWriter.length);
        }
        fileWriter.onwriteend = resolve;
        fileWriter.onerror = reject;
        const blob = new Blob([data], {type: 'text/plain'});
        fileWriter.write(blob);
      });
    });
}

function readFromFileEntry(fileEntry) {
  return promiseCall(fileEntry, 'file')
    .then(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    });
}

function isNotFoundError(e) {
  return e.name === 'NotFoundError';
}
function isTypeMismatchError(e) {
  return e.name === 'TypeMismatchError';
}

function getStat(entry) {
  return promiseCall(entry, 'getMetadata')
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
}
