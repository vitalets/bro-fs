/**
 * Errors
 */

exports.isNotFoundError = function (e) {
  return e && e.name === 'NotFoundError';
};

exports.isTypeMismatchError = function (e) {
  return e && e.name === 'TypeMismatchError';
};
