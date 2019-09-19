/**
 * Operations with directories
 */

const utils = require('./utils');
const errors = require('./errors');
const root = require('./root');

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
  if (path && typeof path !== 'string') {
    return path.isDirectory
      ? Promise.resolve(path)
      : Promise.reject(new DOMError('TypeMismatchError', 'Expected directory but got file'));
  }
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
  return utils.promiseCall(parent, 'getDirectory', dirName, {create: true, exclusive: false});
}

function getChildDir(parent, dirName) {
  return utils.promiseCall(parent, 'getDirectory', dirName, {create: false});
}

function readEntriesRecursive(reader, acc) {
  return utils.promiseCall(reader, 'readEntries')
    .then(entries => entries.length ? readEntriesRecursive(reader, acc.concat(entries)) : acc);
}
