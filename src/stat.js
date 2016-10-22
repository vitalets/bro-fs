/**
 * Stat for file or directory
 */

const utils = require('./utils');

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
