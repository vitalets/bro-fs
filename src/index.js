/**
 * Exported fs API
 */

const utils = require('./utils');
const errors = require('./errors');
const root = require('./root');
const file = require('./file');
const directory = require('./directory');
const stat = require('./stat');
const quota = require('./quota');

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
    .then(() => requestQuota ? quota.request({type, bytes}) : bytes)
    .then(grantedBytes => utils.promiseCall(window, 'webkitRequestFileSystem', type, grantedBytes))
    .then(fs => root.set(fs.root));
};

/**
 * Reads file content
 *
 * @param {String} path
 * @returns {Promise<String>}
 */
exports.readFile = function (path) {
  return file.get(path)
    .then(fileEntry => file.read(fileEntry));
};

/**
 * Writes data to file
 *
 * @param {String} path
 * @param {String} data
 * @returns {Promise<String>}
 */
exports.writeFile = function (path, data) {
  return file.get(path, {create: true, overwrite: true})
    .then(fileEntry => file.write(fileEntry, data, {append: false}));
};

/**
 * Appends data to file
 *
 * @param {String} path
 * @param {String} data
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
 * @param {Boolean} [options.create] create missing directories
 * @returns {Promise}
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
 * @param {Boolean} [options.create] create missing directories
 * @returns {Promise}
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
 * @returns {Promise}
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
 * @returns {Promise<Object>}
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
 * @param {Boolean} [options.deep]
 * @returns {Promise<Array>}
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
