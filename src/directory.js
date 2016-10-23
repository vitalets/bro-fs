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
