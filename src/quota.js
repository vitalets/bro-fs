/**
 * Requesting quota
 */

const utils = require('./utils');

/**
 * Requesting quota is needed only for persistent storage.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/LocalFileSystem
 *
 * @param {Number} bytes
 * @returns {Promise}
 */
exports.requestPersistent = function (bytes) {
  const storage = getStorageByType(window.PERSISTENT);
  return utils.promiseCall(storage, 'requestQuota', bytes)
    .then(grantedBytes => grantedBytes > 0
      ? grantedBytes
      : Promise.reject(`Quota not granted (requested: ${bytes}, granted: ${grantedBytes})`));
};

exports.usage = function (type) {
  const storage = getStorageByType(type);
  return utils.promiseCall(storage, 'queryUsageAndQuota')
    .then(([usedBytes, grantedBytes]) => {
      return {usedBytes, grantedBytes};
    });
};

function getStorageByType(type) {
  return type === window.PERSISTENT
    ? navigator.webkitPersistentStorage
    : navigator.webkitTemporaryStorage;
}
