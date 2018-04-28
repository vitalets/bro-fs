/**
 * Utils
 */

/**
 * Calls async method of object with convertion callbacks into promise.
 *
 * @param {Object} obj
 * @param {String} method
 * @returns {Promise} promise resolved with returned value
 * (or array of values if callback called with more than one arguments)
 */
exports.promiseCall = function (obj, method) {
  if (!obj) {
    throw new Error(`Can't call promisified method '${method}' of ${obj}`);
  }
  const args = [].slice.call(arguments, 2);
  return new Promise((resolve, reject) => {
    const callback = getCallback(resolve);
    // create error before call to capture stack
    const errback = getErrback(new Error(), method, args, reject);
    const fullArgs = args.concat([callback, errback]);
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
 * Create callback. Resolve should always be called with single argument:
 * - if underling callback called with zero or one argument - resolve call with the same
 * - if underling callback called with multiple arguments - resolve call with array of arguments
 *
 * See: https://github.com/vitalets/bro-fs/issues/7
 */
function getCallback(resolve) {
  return function () {
    // not leaking arguments copy
    // see: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    let i = arguments.length;
    const args = [];
    while (i--) {
      args[i] = arguments[i];
    }
    if (args.length === 0) {
      resolve();
    } else if (args.length === 1) {
      resolve(args[0]);
    } else {
      resolve(args);
    }
  };
}

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
