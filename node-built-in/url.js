/**
 * @since 2023-04-25
 * @author vivaxy
 */
const path = require('path');
module.exports = { URL, URLSearchParams, pathToFileURL };

const isWindows = false;

function pathToFileURL(filepath) {
  const outURL = new URL('file://');

  let resolved = path.resolve(filepath);
  // path.resolve strips trailing slashes so we must add them back
  const filePathLast = filepath.charCodeAt(filepath.length - 1);
  if (
    (filePathLast === CHAR_FORWARD_SLASH ||
      (isWindows && filePathLast === CHAR_BACKWARD_SLASH)) &&
    resolved[resolved.length - 1] !== path.sep
  )
    resolved += '/';
  outURL.pathname = encodePathChars(resolved);
  return outURL;
}

const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;

function encodePathChars(filepath) {
  if (filepath.includes('%'))
    filepath = percentRegEx[Symbol.replace](filepath, '%25');
  // In posix, backslash is a valid character in paths:
  if (!isWindows && filepath.includes('\\'))
    filepath = backslashRegEx[Symbol.replace](filepath, '%5C');
  if (filepath.includes('\n'))
    filepath = newlineRegEx[Symbol.replace](filepath, '%0A');
  if (filepath.includes('\r'))
    filepath = carriageReturnRegEx[Symbol.replace](filepath, '%0D');
  if (filepath.includes('\t'))
    filepath = tabRegEx[Symbol.replace](filepath, '%09');
  return filepath;
}
