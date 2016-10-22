/**
 * Requesting quota
 */

const utils = require('./utils');

exports.request = function ({type, bytes}) {
  return utils.promiseCall(window.webkitStorageInfo, 'requestQuota', type, bytes)
    .then(grantedBytes => grantedBytes > 0
      ? Promise.resolve(grantedBytes)
      : Promise.reject('Quota not granted')
    );
};
