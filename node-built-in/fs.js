/**
 * @since 20180817 10:06
 * @author vivaxy
 */

module.exports = { fileExistsSync, readFileSync };

fileExistsSync.cache = {};

function fileExistsSync(filename) {
  if (fileExistsSync.cache.hasOwnProperty(filename)) {
    return fileExistsSync.cache[filename];
  }

  try {
    readFileSync.cache[filename] = loadFileSync(filename);
    fileExistsSync.cache[filename] = true;
  } catch (e) {
    fileExistsSync.cache[filename] = false;
  }

  return fileExistsSync.cache[filename];
}

readFileSync.cache = {};

function readFileSync(filename) {
  if (readFileSync.cache.hasOwnProperty(filename)) {
    return readFileSync.cache[filename];
  }

  try {
    readFileSync.cache[filename] = loadFileSync(filename);
    fileExistsSync.cache[filename] = true;
    return readFileSync.cache[filename];
  } catch (e) {
    fileExistsSync.cache[filename] = false;
    throw new Error('readFileSync: ' + filename);
  }
}
