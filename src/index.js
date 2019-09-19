/**
 * HTML5 Filesystem API
 * @module fs
 */

const utils = require('./utils');
const errors = require('./errors');
const root = require('./root');
const file = require('./file');
const directory = require('./directory');
const stat = require('./stat');
const quota = require('./quota');

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
exports.init = function (options = {}) {
  const type = Object.prototype.hasOwnProperty.call(options, 'type') ? options.type : window.PERSISTENT;
  const bytes = options.bytes || 1024 * 1024;
  assertType(type);
  const shouldRequestQuota = type === window.PERSISTENT
    ? (Object.prototype.hasOwnProperty.call(options, 'requestQuota') ? options.requestQuota : true)
    : false;
  return Promise.resolve()
    .then(() => shouldRequestQuota ? quota.requestPersistent(bytes) : bytes)
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
exports.readFile = function (path, options = {}) {
  return file.get(path)
    .then(fileEntry => file.read(fileEntry, options));
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
  return file.get(path, {create: true, overwrite: true})
    .then(fileEntry => file.write(fileEntry, data, {append: false}));
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
  return file.get(path, {create: true, overwrite: false})
    .then(fileEntry => file.write(fileEntry, data, {append: true}));
};

/**
 * Removes file.
 * If file does not exist - no error thrown.
 *
 * @param {String|FileSystemFileEntry} path
 * @returns {Promise}
 */
exports.unlink = function (path) {
  return file.get(path)
    .then(
      fileEntry => utils.promiseCall(fileEntry, 'remove'),
      e => errors.isNotFoundError(e)
        ? Promise.resolve(false)
        : Promise.reject(e)
    );
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
exports.rename = function (oldPath, newPath, options = {}) {
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
exports.copy = function (oldPath, newPath, options = {}) {
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
  return directory.get(path)
    .then(
      dir => dir === root.get()
        ? Promise.reject('Can not remove root. Use clear() to clear fs.')
        : utils.promiseCall(dir, 'removeRecursively'),
      e => errors.isNotFoundError(e)
        ? Promise.resolve(false)
        : Promise.reject(e)
    )
};

/**
 * Recursively creates required directories in provided path.
 *
 * @param {String} path
 * @returns {Promise<FileSystemDirectoryEntry>}
 */
exports.mkdir = function (path) {
  return directory.get(path, {create: true});
};

/**
 * Checks that file or directory exists by provided path.
 *
 * @param {String} path
 * @returns {Promise<Boolean>}
 */
exports.exists = function (path) {
  return exports.getEntry(path)
    .then(() => true, e => errors.isNotFoundError(e)
      ? false
      : Promise.reject(e)
    );
};

/**
 * Gets info about file or directory.
 * If it does not exist - error thrown.
 *
 * @param {String|FileSystemEntry} path
 * @returns {Promise<StatObject>}
 */
exports.stat = function (path) {
  return exports.getEntry(path)
    .then(entry => stat.get(entry));
};

/**
 * Reads directory content
 *
 * @param {String|FileSystemDirectoryEntry} path
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
 * @param {String|FileSystemEntry} path
 * @returns {String}
 */
exports.getUrl = function (path) {
  return exports.getEntry(path)
    .then(entry => entry.toURL())
};

/**
 * Gets file or directory
 *
 * @param {String|FileSystemEntry} path
 * @returns {Promise<FileSystemEntry>}
 */
exports.getEntry = function (path) {
  return file.get(path)
    .catch(e => errors.isTypeMismatchError(e)
      ? directory.get(path)
      : Promise.reject(e)
    );
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
  if (oldPath === newPath) { // runtyper-disable-line
    return Promise.resolve();
  }
  const {
    dirPath: newParentDirPath,
    fileName: newName,
  } = utils.parsePath(newPath);
  return Promise.all([
    exports.getEntry(oldPath),
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
