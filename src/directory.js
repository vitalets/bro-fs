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

function createChildDir(parent, dirName) {
  return utils.promiseCall(parent, 'getDirectory', dirName, {create: true, exclusive: true});
}

function getChildDir(parent, dirName) {
  return utils.promiseCall(parent, 'getDirectory', dirName, {create: false});
}
