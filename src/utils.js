/**
 * Utils
 */

exports.promiseCall = function (obj, method) {
  if (!obj) {
    throw new Error(`Can't call promisified method '${method}' of ${obj}`);
  }
  const args = [].slice.call(arguments, 2);
  return new Promise((resolve, reject) => {
    // create error before call to capture stack
    const errback = getErrback(new Error(), method, args, reject);
    const fullArgs = args.concat([resolve, errback]);
    return obj[method].apply(obj, fullArgs);
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

/**
 * Convert DOMException to regular error to have normal stack trace
 * Also add some details to error message
 */
function getErrback(err, method, args, reject) {
  return function (e) {
    let argsStr = '';
    try {
      argsStr = JSON.stringify(args);
    } catch (ex) {
      argsStr = args.join(', ');
    }
    err.name = e.name;
    err.message = `${e.message} Call: ${method}(${argsStr})`;
    reject(err);
  };
}
