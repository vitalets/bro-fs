/**
 * Store link to fs root (singleton)
 */

let root = null;
let type = null;

exports.get = function () {
  if (!root) {
    throw new Error('Filesystem not initialized.');
  } else {
    return root;
  }
};

exports.set = function (newRoot, newType) {
  root = newRoot;
  type = newType;
};

exports.getType = function () {
  return type;
};
