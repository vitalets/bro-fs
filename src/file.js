/**
 * Operations with files
 */

const utils = require('./utils');
const errors = require('./errors');
const directory = require('./directory');

/**
 * Returns FileEntry by path
 * If options.create = true will create missing directories and file
 *
 * @param {String|FileSystemFileEntry} path
 * @param {Object} [options]
 * @param {Boolean} [options.create]
 * @param {Boolean} [options.overwrite]
 * @returns {Promise}
 */
exports.get = function (path, options = {}) {
  if (path && typeof path !== 'string') {
    return path.isFile
      ? Promise.resolve(path)
      : Promise.reject(new DOMError('TypeMismatchError', 'Expected file but got directory'));
  }
  const {dirPath, fileName} = utils.parsePath(path);
  return Promise.resolve()
    .then(() => directory.get(dirPath, options))
    .then(dir => {
      if (options.create) {
        if (options.overwrite) {
          return createChildFile(dir, fileName);
        } else {
          return getChildFile(dir, fileName)
            .catch(e => errors.isNotFoundError(e)
              ? createChildFile(dir, fileName)
              : Promise.reject(e))
        }
      } else {
        return getChildFile(dir, fileName);
      }
    });
};

/**
 * Writes to fileEntry using fileWriter
 *
 * @param {Object} fileEntry
 * @param {String} data
 * @param {Object} [options]
 * @param {Boolean} [options.append]
 * @param {String} [options.type] mimetype
 * @returns {Promise}
 */
exports.write = function (fileEntry, data, options = {}) {
  return utils.promiseCall(fileEntry, 'createWriter')
    .then(fileWriter => {
      return new Promise((resolve, reject) => {
        if (options.append) {
          fileWriter.seek(fileWriter.length);
          fileWriter.onwriteend = resolve;
        } else {
          let truncated = false;
          fileWriter.onwriteend = function () {
            if (!truncated) {
              truncated = true;
              this.truncate(this.position);
            } else {
              resolve();
            }
          };
        }
        fileWriter.onerror = reject;
        const blob = new Blob([data], {type: getMimeTypeByData(data)});
        fileWriter.write(blob);
      });
    })
    .then(() => fileEntry)
};

/**
 * Reads from fileEntry
 * 
 * `options.type='Blob'` returns a snapshot of the file. Slower but safer.
 * 
 * `options.type='File'` returns a real-time reference without any r/w lock. Faster but may have a data race.
 *
 * @param {Object} fileEntry
 * @param {Object} [options]
 * @param {String} [options.type] how content should be read
 * @returns {Promise<String>}
 */
exports.read = function (fileEntry, options = {}) {
  return utils.promiseCall(fileEntry, 'file')
    .then(file => {
      if (options.type === 'Blob') {
        // see /test/mutable-vs-snapshot.js for why we need to "freeze" a Blob
        return freezeMutableFile(file);
      } else if (options.type === 'File') {
        return file;
      } else {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          // see: https://developer.mozilla.org/ru/docs/Web/API/FileReader
          readAs(options.type, reader, file);
        });
      }
    });
};

/**
 * Create a ReadableStream from path or fileEntry
 *
 * @param {String|FileSystemFileEntry} path
 * @returns {ReadableStream}
 */
exports.createReadStream = function (path) {
  /* global TransformStream:false */
  const { readable, writable } = new TransformStream();
  exports.get(path)
    .then(fileEntry => utils.promiseCall(fileEntry, 'file'))
    .then(file => new Response(file).body.pipeTo(writable))
    .catch(e => writable.abort(e));
  return readable;
};

/**
 * Create a WritableStream from fileEntry
 *
 * @param {String|FileSystemFileEntry} path
 * @param {Object} [options]
 * @param {Boolean} [options.append]
 * @param {String} [options.type] mimetype
 * @returns {WritableStream}
 */
exports.createWriteStream = function (path, options = {}) {
  return new WritableStream({
    start() {
      return exports.get(path, { create: true, overwrite: true })
        .then(fileEntry => utils.promiseCall(fileEntry, 'createWriter'))
        .then(fileWriter => {
          this.fileWriter = fileWriter;
          if (options.append) {
            fileWriter.seek(fileWriter.length);
          }
        })
    },
    write(data) {
      return new Promise((resolve, reject) => {
        const blob = new Blob([data], { type: getMimeTypeByData(data) });
        this.fileWriter.onwriteend = resolve;
        this.fileWriter.onerror = reject;
        this.fileWriter.write(blob);
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        this.fileWriter.onwriteend = resolve;
        this.fileWriter.onerror = reject;
        this.fileWriter.truncate(this.fileWriter.position);
      });
    }
  });
};

function getMimeTypeByData(data) {
  if (typeof data === 'string') {
    return 'text/plain';
  } else {
    return 'application/octet-binary';
  }
}

function readAs(type, reader, file) {
  switch (type) {
    case 'ArrayBuffer':
      return reader.readAsArrayBuffer(file);
    case 'BinaryString':
      return reader.readAsBinaryString(file);
    case 'DataURL':
      return reader.readAsDataURL(file);
    case 'Text':
    default:
      return reader.readAsText(file);
  }
}

function freezeMutableFile(file) {
  // I tried different APIs, but they either require reading the
  // entire Blob into a buffer, or do not (deep) clone the Blob
  // at all. Response is so far the best I can find.

  return new Response(file).blob();
}

function createChildFile(parent, fileName) {
  return utils.promiseCall(parent, 'getFile', fileName, {create: true, exclusive: false});
}

function getChildFile(parent, fileName) {
  return utils.promiseCall(parent, 'getFile', fileName, {create: false});
}
