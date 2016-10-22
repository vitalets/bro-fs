/**
 * Store link to fs root (singleton)
 */

let root = null;

exports.get = function () {
  if (!root) {
    throw new Error('Filesystem not initialized.');
  } else {
    return root;
  }
};

exports.set = function (newRoot) {
  root = newRoot;
};
