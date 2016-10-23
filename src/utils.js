/**
 * Utils
 */

exports.promiseCall = function (obj, method) {
  if (!obj) {
    throw new Error(`Can't call promisified method '${method}' of ${obj}`);
  }
  const args = [].slice.call(arguments, 2);
  return new Promise((resolve, reject) => {
    args.push(resolve, reject);
    return obj[method].apply(obj, args);
  });
};

exports.parsePath = function (path) {
  const parts = exports.splitPath(path);
  const fileName = parts.pop();
  const dirPath = parts.join('/');
  return {dirPath, fileName};
};

exports.splitPath = function (path = '') {
  path = path.replace(/^\.\//, ''); // remove './' at start
  if (path.length > 1 && path.endsWith('/')) {
    throw new Error(`Path can not end with '/'`);
  }
  return path.split('/').filter(Boolean);
};
